import { storage, KEYS } from "@/lib/storage";

function hashPin(pin: string): string {
  let hash = 0;

  for (let index = 0; index < pin.length; index += 1) {
    hash = (hash * 31 + pin.charCodeAt(index)) >>> 0;
  }

  return `pin-${hash.toString(16)}`;
}

export async function getParentPinHash(): Promise<string | null> {
  return storage.getItem<string>(KEYS.PARENT_PIN_HASH);
}

export async function hasParentPin(): Promise<boolean> {
  return Boolean(await getParentPinHash());
}

export async function saveParentPin(pin: string): Promise<void> {
  await storage.setItem(KEYS.PARENT_PIN_HASH, hashPin(pin));
}

export async function verifyParentPin(pin: string): Promise<boolean> {
  const storedHash = await getParentPinHash();
  if (!storedHash) {
    return false;
  }

  return storedHash === hashPin(pin);
}
