import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import { storage, KEYS } from "@/lib/storage";

/* ------------------------------------------------------------------ *
 * Parent PIN — storage, derivation and attempt lockout.
 *
 * Storage: expo-secure-store (iOS Keychain / Android Keystore). The old
 * AsyncStorage entry (`parentPinHash`, non-salted 31-rolling hash) is
 * migrated away silently — see `migrateLegacyPin`.
 *
 * Derivation: salted, iterated SHA-256 implemented in pure JS below.
 * Rationale (verified against this tree, 2026-07):
 *   - `expo-crypto` is NOT installed and adding dependencies is out of
 *     scope for this change.
 *   - Hermes/RN 0.81 exposes no `crypto.subtle`; Expo SDK 54's WinterCG
 *     runtime (`expo/src/winter/runtime.native.ts`) installs TextDecoder,
 *     URL, structuredClone… but no WebCrypto. So SubtleCrypto/PBKDF2 is
 *     unavailable at runtime.
 *   - The JS SHA-256 here was verified byte-for-byte against `node:crypto`
 *     and costs ~20 ms for 60k iterations in V8 (~120–250 ms on Hermes),
 *     which is an acceptable one-shot cost for a PIN entry.
 * The stored record carries its own `iterations`, so the cost factor can
 * be raised later without invalidating existing PINs.
 * ------------------------------------------------------------------ */

export const PARENT_PIN_LENGTH = 4;

/** Consecutive misses that trigger a lock. */
const LOCK_THRESHOLD = 5;
/** First lock duration; doubles with every further miss streak. */
const LOCK_BASE_MS = 30_000;
/** Hard ceiling for a single lock window. */
const LOCK_MAX_MS = 300_000;

const CREDENTIAL_KEY = "parentPinCredential";
const LOCK_STATE_KEY = "parentPinLockState";
const KEYCHAIN_SERVICE = "routinestars.parent";

const CREDENTIAL_VERSION = 1;
const DEFAULT_ITERATIONS = 60_000;
const SALT_BYTES = 16;

interface StoredCredential {
  v: number;
  salt: string;
  hash: string;
  iterations: number;
}

interface StoredLockState {
  /** Misses since the last success or lock. */
  failedAttempts: number;
  /** How many locks the current miss streak has already produced. */
  lockLevel: number;
  /** Epoch ms; 0 when unlocked. */
  lockUntil: number;
}

export interface ParentPinLockState {
  isLocked: boolean;
  /** Epoch ms the lock expires at; 0 when unlocked. */
  lockedUntil: number;
  /** Milliseconds left on the lock; 0 when unlocked. */
  remainingMs: number;
  /** Misses in the current streak. */
  failedAttempts: number;
  /** Misses left before the next lock kicks in. */
  attemptsRemaining: number;
  /** Locks already served in this streak (drives the doubling). */
  lockLevel: number;
}

export type ParentPinFailureReason = "locked" | "no-pin" | "wrong-pin" | "invalid-pin";

export interface ParentPinVerifyResult {
  success: boolean;
  reason?: ParentPinFailureReason;
  lock: ParentPinLockState;
}

/* ------------------------------------------------------------------ *
 * SHA-256 (pure JS, big-endian, RFC 6234)
 * ------------------------------------------------------------------ */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const schedule = new Uint32Array(64);

function sha256(bytes: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const byteLength = bytes.length;
  const paddedLength = (((byteLength + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[byteLength] = 0x80;

  // Inputs here are always far below 2^29 bytes, so the low word suffices.
  const bitLength = byteLength * 8;
  padded[paddedLength - 4] = (bitLength >>> 24) & 0xff;
  padded[paddedLength - 3] = (bitLength >>> 16) & 0xff;
  padded[paddedLength - 2] = (bitLength >>> 8) & 0xff;
  padded[paddedLength - 1] = bitLength & 0xff;

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      const p = offset + i * 4;
      schedule[i] =
        ((padded[p] << 24) | (padded[p + 1] << 16) | (padded[p + 2] << 8) | padded[p + 3]) >>> 0;
    }

    for (let i = 16; i < 64; i += 1) {
      const x = schedule[i - 15];
      const y = schedule[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      schedule[i] = (schedule[i - 16] + s0 + schedule[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const sigma1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const choose = (e & f) ^ (~e & g);
      const temp1 = (h + sigma1 + choose + K[i] + schedule[i]) >>> 0;
      const sigma0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + majority) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const digest = new Uint8Array(32);
  const words = [h0, h1, h2, h3, h4, h5, h6, h7];

  for (let i = 0; i < 8; i += 1) {
    digest[i * 4] = (words[i] >>> 24) & 0xff;
    digest[i * 4 + 1] = (words[i] >>> 16) & 0xff;
    digest[i * 4 + 2] = (words[i] >>> 8) & 0xff;
    digest[i * 4 + 3] = words[i] & 0xff;
  }

  return digest;
}

function toUtf8Bytes(text: string): Uint8Array {
  const bytes: number[] = [];

  for (let index = 0; index < text.length; index += 1) {
    let code = text.charCodeAt(index);

    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
      const low = text.charCodeAt(index + 1);
      code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
      index += 1;
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }

  return Uint8Array.from(bytes);
}

function toHex(bytes: Uint8Array): string {
  let hex = "";

  for (let index = 0; index < bytes.length; index += 1) {
    hex += bytes[index].toString(16).padStart(2, "0");
  }

  return hex;
}

function fromHex(hex: string): Uint8Array {
  const length = Math.floor(hex.length / 2);
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16) || 0;
  }

  return bytes;
}

/** Hermes has no WebCrypto; fall back to a hashed entropy mix when absent. */
function randomSalt(): string {
  const target = new Uint8Array(SALT_BYTES);
  const source = (globalThis as { crypto?: { getRandomValues?: (array: Uint8Array) => unknown } })
    .crypto;

  if (typeof source?.getRandomValues === "function") {
    try {
      source.getRandomValues(target);
      return toHex(target);
    } catch {
      // Fall through to the entropy mix below.
    }
  }

  let entropy = `${Date.now()}|${Math.random()}|${Math.random()}`;
  for (let index = 0; index < 4; index += 1) {
    entropy += `|${Math.random()}|${globalThis.performance?.now?.() ?? index}`;
  }

  return toHex(sha256(toUtf8Bytes(entropy))).slice(0, SALT_BYTES * 2);
}

/**
 * Salted, iterated SHA-256: `H(salt || pin)` chained `iterations` times with
 * the salt folded back in each round (PBKDF2-shaped, single block per round).
 */
function derivePinHash(pin: string, salt: string, iterations: number): string {
  const saltBytes = fromHex(salt);
  let digest = sha256(toUtf8Bytes(`routine-stars/parent-pin/v1|${salt}|${pin}`));

  const block = new Uint8Array(digest.length + saltBytes.length);
  const rounds = Math.max(1, iterations);

  for (let round = 1; round < rounds; round += 1) {
    block.set(digest, 0);
    block.set(saltBytes, digest.length);
    digest = sha256(block);
  }

  return toHex(digest);
}

/** Length-independent, early-exit-free comparison. */
function equalsInConstantTime(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

/* ------------------------------------------------------------------ *
 * Secure storage backend (SecureStore, AsyncStorage as fallback)
 * ------------------------------------------------------------------ */

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: KEYCHAIN_SERVICE,
};

let secureStoreUsable: Promise<boolean> | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (!secureStoreUsable) {
    secureStoreUsable = SecureStore.isAvailableAsync().catch(() => false);
  }

  return secureStoreUsable;
}

/** Permanently degrade to AsyncStorage if the keychain rejects us at runtime. */
function degradeToAsyncStorage() {
  secureStoreUsable = Promise.resolve(false);
}

async function readSecure(key: string): Promise<string | null> {
  if (await canUseSecureStore()) {
    try {
      const value = await SecureStore.getItemAsync(key, secureStoreOptions);
      if (value !== null) {
        return value;
      }
    } catch {
      degradeToAsyncStorage();
    }
  }

  // Also covers entries left behind by an earlier degraded write.
  return storage.getItem<string>(key);
}

async function writeSecure(key: string, value: string): Promise<void> {
  if (await canUseSecureStore()) {
    try {
      await SecureStore.setItemAsync(key, value, secureStoreOptions);
      return;
    } catch {
      degradeToAsyncStorage();
    }
  }

  await storage.setItem<string>(key, value);
}

async function deleteSecure(key: string): Promise<void> {
  if (await canUseSecureStore()) {
    try {
      await SecureStore.deleteItemAsync(key, secureStoreOptions);
    } catch {
      degradeToAsyncStorage();
    }
  }

  // Always clear the plain mirror too — a degraded write may have landed there.
  await storage.removeItem(key);
}

/* ------------------------------------------------------------------ *
 * Credential record
 * ------------------------------------------------------------------ */

function parseCredential(raw: string | null): StoredCredential | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCredential>;

    if (
      typeof parsed?.salt !== "string" ||
      typeof parsed?.hash !== "string" ||
      typeof parsed?.iterations !== "number" ||
      parsed.salt.length === 0 ||
      parsed.hash.length === 0
    ) {
      return null;
    }

    return {
      v: typeof parsed.v === "number" ? parsed.v : CREDENTIAL_VERSION,
      salt: parsed.salt,
      hash: parsed.hash,
      iterations: parsed.iterations,
    };
  } catch {
    return null;
  }
}

async function readCredential(): Promise<StoredCredential | null> {
  return parseCredential(await readSecure(CREDENTIAL_KEY));
}

async function writeCredential(pin: string): Promise<void> {
  const salt = randomSalt();
  const credential: StoredCredential = {
    v: CREDENTIAL_VERSION,
    salt,
    hash: derivePinHash(pin, salt, DEFAULT_ITERATIONS),
    iterations: DEFAULT_ITERATIONS,
  };

  await writeSecure(CREDENTIAL_KEY, JSON.stringify(credential));
}

/* ------------------------------------------------------------------ *
 * Legacy migration (AsyncStorage `parentPinHash`)
 * ------------------------------------------------------------------ */

/** The pre-SecureStore hash. Kept only to recognise an old PIN once. */
function legacyPinHash(pin: string): string {
  let hash = 0;

  for (let index = 0; index < pin.length; index += 1) {
    hash = (hash * 31 + pin.charCodeAt(index)) >>> 0;
  }

  return `pin-${hash.toString(16)}`;
}

async function readLegacyPinHash(): Promise<string | null> {
  return storage.getItem<string>(KEYS.PARENT_PIN_HASH);
}

/**
 * The legacy hash is not reversible, so migration can only happen when the
 * parent actually types the right PIN. On that first success we re-derive it
 * into the new salted format and drop the AsyncStorage entry.
 */
async function migrateLegacyPin(pin: string, legacyHash: string): Promise<boolean> {
  if (!equalsInConstantTime(legacyHash, legacyPinHash(pin))) {
    return false;
  }

  await writeCredential(pin);
  await storage.removeItem(KEYS.PARENT_PIN_HASH);

  return true;
}

/* ------------------------------------------------------------------ *
 * Lockout
 * ------------------------------------------------------------------ */

const EMPTY_LOCK_STATE: StoredLockState = { failedAttempts: 0, lockLevel: 0, lockUntil: 0 };

function lockDurationFor(lockLevel: number): number {
  const exponent = Math.max(0, lockLevel - 1);
  return Math.min(LOCK_BASE_MS * 2 ** exponent, LOCK_MAX_MS);
}

function toPublicLockState(state: StoredLockState, now: number): ParentPinLockState {
  const isLocked = state.lockUntil > now;

  return {
    isLocked,
    lockedUntil: isLocked ? state.lockUntil : 0,
    remainingMs: isLocked ? state.lockUntil - now : 0,
    failedAttempts: state.failedAttempts,
    attemptsRemaining: Math.max(0, LOCK_THRESHOLD - state.failedAttempts),
    lockLevel: state.lockLevel,
  };
}

async function readLockState(): Promise<StoredLockState> {
  const raw = await readSecure(LOCK_STATE_KEY);

  if (!raw) {
    return { ...EMPTY_LOCK_STATE };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredLockState>;

    return {
      failedAttempts: Math.max(0, Number(parsed?.failedAttempts) || 0),
      lockLevel: Math.max(0, Number(parsed?.lockLevel) || 0),
      lockUntil: Math.max(0, Number(parsed?.lockUntil) || 0),
    };
  } catch {
    return { ...EMPTY_LOCK_STATE };
  }
}

async function writeLockState(state: StoredLockState): Promise<void> {
  await writeSecure(LOCK_STATE_KEY, JSON.stringify(state));
}

async function clearLockState(): Promise<void> {
  await deleteSecure(LOCK_STATE_KEY);
}

/**
 * Current lockout status. Safe to poll (drives the countdown in
 * app/parent-login.tsx). An expired lock is folded away on read.
 */
export async function getLockState(): Promise<ParentPinLockState> {
  const now = Date.now();
  const state = await readLockState();

  if (state.lockUntil > 0 && state.lockUntil <= now) {
    // The lock has run out: allow a fresh streak, but remember the level so
    // the next streak locks for twice as long.
    const relaxed: StoredLockState = {
      failedAttempts: 0,
      lockLevel: state.lockLevel,
      lockUntil: 0,
    };
    await writeLockState(relaxed);
    return toPublicLockState(relaxed, now);
  }

  return toPublicLockState(state, now);
}

async function registerFailedAttempt(): Promise<ParentPinLockState> {
  const now = Date.now();
  const current = await readLockState();
  const failedAttempts = current.failedAttempts + 1;

  if (failedAttempts < LOCK_THRESHOLD) {
    const next: StoredLockState = {
      failedAttempts,
      lockLevel: current.lockLevel,
      lockUntil: current.lockUntil > now ? current.lockUntil : 0,
    };
    await writeLockState(next);
    return toPublicLockState(next, now);
  }

  const lockLevel = current.lockLevel + 1;
  const locked: StoredLockState = {
    failedAttempts: 0,
    lockLevel,
    lockUntil: now + lockDurationFor(lockLevel),
  };

  await writeLockState(locked);
  return toPublicLockState(locked, now);
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

const PIN_PATTERN = new RegExp(`^\\d{${PARENT_PIN_LENGTH}}$`);

/** Exactly four digits — the only shape the PIN pad can produce. */
export function isValidParentPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

export async function hasParentPin(): Promise<boolean> {
  if (await readCredential()) {
    return true;
  }

  return Boolean(await readLegacyPinHash());
}

/**
 * Stores a freshly derived credential and clears any running lockout.
 * Callers must gate this: first-time setup is only reachable behind
 * ParentGateChallenge, a change behind a successful verify.
 */
export async function saveParentPin(pin: string): Promise<void> {
  if (!isValidParentPin(pin)) {
    throw new Error(`Parent PIN must be ${PARENT_PIN_LENGTH} digits`);
  }

  await writeCredential(pin);
  await storage.removeItem(KEYS.PARENT_PIN_HASH);
  await clearLockState();
}

/**
 * Verifies a PIN and maintains the lockout counter.
 * Returns the lock state alongside the result so the UI can show the
 * countdown without a second round-trip.
 */
export async function verifyParentPin(pin: string): Promise<ParentPinVerifyResult> {
  const lock = await getLockState();

  if (lock.isLocked) {
    return { success: false, reason: "locked", lock };
  }

  if (!isValidParentPin(pin)) {
    return { success: false, reason: "invalid-pin", lock };
  }

  const credential = await readCredential();

  if (credential) {
    const candidate = derivePinHash(pin, credential.salt, credential.iterations);

    if (equalsInConstantTime(credential.hash, candidate)) {
      await clearLockState();
      return { success: true, lock: await getLockState() };
    }

    return { success: false, reason: "wrong-pin", lock: await registerFailedAttempt() };
  }

  const legacyHash = await readLegacyPinHash();

  if (!legacyHash) {
    return { success: false, reason: "no-pin", lock };
  }

  if (await migrateLegacyPin(pin, legacyHash)) {
    await clearLockState();
    return { success: true, lock: await getLockState() };
  }

  return { success: false, reason: "wrong-pin", lock: await registerFailedAttempt() };
}

/** Removes the PIN, the legacy entry and any lockout (parent-initiated reset). */
export async function clearParentPin(): Promise<void> {
  await deleteSecure(CREDENTIAL_KEY);
  await storage.removeItem(KEYS.PARENT_PIN_HASH);
  await clearLockState();
}
