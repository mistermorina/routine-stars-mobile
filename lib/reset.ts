import { Directory, Paths } from "expo-file-system";

import { clearParentPin } from "@/lib/parent-access";
import { storage } from "@/lib/storage";

/**
 * Where `lib/avatar-photo-picker.ts` copies picked avatar photos to. Kept in
 * sync with that module — a reset must remove the files too, not just the
 * relative paths pointing at them.
 */
const AVATAR_PHOTO_DIRECTORY = "avatar-photos";

/**
 * Wipes every trace of this household from the device:
 *   - the parent PIN, its legacy hash and the lockout state (Keychain /
 *     Keystore — `storage.clear()` alone would leave the PIN behind)
 *   - every AsyncStorage key (children, routines, rewards, stars, activity
 *     logs, sticker state, notification/legal preferences, sound + haptics)
 *   - the copied avatar photos on disk
 *
 * Irreversible and unsynced — there is no backup anywhere. Always confirm via
 * `ConfirmDialog` first. Navigation is the caller's job: send the parent to
 * `/(auth)/welcome` afterwards.
 */
export async function resetAppData(): Promise<void> {
  await clearParentPin();
  await storage.clear();
  deleteAvatarPhotos();
}

function deleteAvatarPhotos(): void {
  try {
    const directory = new Directory(Paths.document, AVATAR_PHOTO_DIRECTORY);

    if (directory.exists) {
      directory.delete();
    }
  } catch (error) {
    // A locked or already-missing directory must never block the data wipe.
    console.error("Failed to delete avatar photos:", error);
  }
}
