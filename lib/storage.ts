import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  CHILDREN: "children",
  LAST_SELECTED_CHILD_ID: "lastSelectedChildId",
  ACTIVITY_LOGS: "activityLogs",
  CUSTOM_ROUTINES: "customRoutines",
  CUSTOM_REWARDS: "customRewards",
  HAS_ONBOARDED: "hasOnboarded",
  HAS_SEEN_WELCOME: "hasSeenWelcome",
  ROUTINE_PROGRESS: "routineProgress",
  CHILD_PROGRESS_STATE: "childProgressState",
  STICKER_COLLECTION: "stickerCollection",
  STICKER_WALL: "stickerWall",
  STICKER_REWARD_SETTINGS: "stickerRewardSettings",
  PARENT_PIN_HASH: "parentPinHash",
  NOTIFICATION_SETTINGS: "notificationSettings",
  LEGAL_PREFERENCES: "legalPreferences",
  SOUND_ENABLED: "soundEnabled",
  HAPTICS_ENABLED: "hapticsEnabled",
  DESIGN_MODE: "designMode",
  SCHEMA_VERSION: "schemaVersion",
} as const;

export { KEYS };

/**
 * Bumped whenever the persisted shape needs a migration step. The value is
 * written once, lazily, so that an existing install can be told apart from a
 * fresh one before any future migration runs.
 */
const CURRENT_SCHEMA_VERSION = "1";

/**
 * Values that fail to parse are moved under this prefix instead of being
 * dropped, so a corrupted payload stays recoverable.
 */
const CORRUPT_KEY_PREFIX = "__corrupt_";

let schemaVersionCheck: Promise<void> | null = null;

async function writeSchemaVersionIfAbsent(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(KEYS.SCHEMA_VERSION);
    if (existing === null) {
      await AsyncStorage.setItem(KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    }
  } catch (error) {
    console.error("Failed to ensure storage schema version:", error);
  }
}

/** Runs at most once per session; every later call awaits the same promise. */
function ensureSchemaVersion(): Promise<void> {
  if (schemaVersionCheck === null) {
    schemaVersionCheck = writeSchemaVersionIfAbsent();
  }
  return schemaVersionCheck;
}

async function quarantineCorruptValue(key: string, rawValue: string): Promise<void> {
  // Never quarantine a quarantine, otherwise the prefix keeps stacking.
  if (key.startsWith(CORRUPT_KEY_PREFIX)) return;

  try {
    await AsyncStorage.setItem(`${CORRUPT_KEY_PREFIX}${key}`, rawValue);
    // Only drop the original once the copy is safely written.
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to quarantine corrupt value for ${key}:`, error);
  }
}

async function getItem<T>(key: string): Promise<T | null> {
  await ensureSchemaVersion();

  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return null;
  }

  if (raw === null) return null;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(
      `Corrupt storage value for ${key}, quarantined as ${CORRUPT_KEY_PREFIX}${key}:`,
      error
    );
    await quarantineCorruptValue(key, raw);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await ensureSchemaVersion();

  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
  }
}

async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Failed to clear storage:", error);
  } finally {
    // The version marker was wiped too — let the next access rewrite it.
    schemaVersionCheck = null;
  }
}

export const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  KEYS,
};
