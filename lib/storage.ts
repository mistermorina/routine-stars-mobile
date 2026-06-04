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
} as const;

export { KEYS };

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
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
  }
}

export const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  KEYS,
};
