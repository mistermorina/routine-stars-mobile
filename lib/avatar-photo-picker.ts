import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";
import type { AvatarValue } from "@/lib/types";

/**
 * Avatar photos are copied into `<documentDirectory>/avatar-photos/` and stored as a
 * RELATIVE path (`avatar-photos/<name>.jpg`).
 *
 * iOS rewrites the absolute app-container path on every install/update, so an absolute
 * `file://` URI persisted in AsyncStorage becomes a dead link after the next app update.
 * Only the relative path survives — it is joined with the *current* document directory
 * at read time via `resolveAvatarPhotoUri`.
 */
const AVATAR_PHOTO_DIRECTORY = "avatar-photos";

export type PickAvatarPhotoResult =
  | { status: "selected"; avatar: AvatarValue }
  | { status: "cancelled" }
  | { status: "denied" };

export async function pickAvatarPhotoAsync(): Promise<PickAvatarPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

  if (!permission.granted) {
    return { status: "denied" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled) {
    return { status: "cancelled" };
  }

  const uri = result.assets[0]?.uri;

  if (!uri) {
    return { status: "cancelled" };
  }

  return {
    status: "selected",
    avatar: { type: "photo", uri: await persistAvatarPhoto(uri) },
  };
}

/**
 * Turns a stored avatar photo value into a URI that is valid for the current app install.
 *
 * Handles both formats:
 * - new relative values (`avatar-photos/avatar-123.jpg`)
 * - legacy absolute values (`file:///…/Documents/avatar-photos/avatar-123.jpg`) — the file
 *   name is re-joined with the current document directory, which migrates old entries lazily
 *   without a bulk rewrite.
 *
 * Anything that is not a managed avatar photo (remote URLs, `data:` URIs, cache paths from a
 * failed copy) is returned unchanged.
 */
export function resolveAvatarPhotoUri(stored: string): string {
  const value = typeof stored === "string" ? stored.trim() : "";

  if (!value) {
    return "";
  }

  const fileName = getManagedFileName(value);

  if (!fileName) {
    return value;
  }

  const documentDirectoryUri = getDocumentDirectoryUri();

  if (!documentDirectoryUri) {
    return value;
  }

  return `${documentDirectoryUri.replace(/\/+$/, "")}/${AVATAR_PHOTO_DIRECTORY}/${fileName}`;
}

/**
 * Removes a stored avatar photo from disk. Only files inside the managed
 * `avatar-photos` directory are touched — any other value is ignored.
 *
 * Call this when a child is deleted or switches away from a photo avatar, otherwise the
 * orphaned image keeps occupying storage forever. Never rejects.
 */
export async function deleteAvatarPhoto(stored: string | null | undefined): Promise<boolean> {
  const fileName = getManagedFileName(stored);

  if (!fileName) {
    return false;
  }

  try {
    const file = new File(Paths.document, AVATAR_PHOTO_DIRECTORY, fileName);

    if (!file.exists) {
      return false;
    }

    file.delete();
    return true;
  } catch {
    return false;
  }
}

async function persistAvatarPhoto(sourceUri: string) {
  const fileName = `avatar-${Date.now()}.${getFileExtension(sourceUri)}`;

  try {
    const directory = new Directory(Paths.document, AVATAR_PHOTO_DIRECTORY);
    directory.create({ intermediates: true, idempotent: true });

    const destination = new File(directory, fileName);

    if (destination.exists) {
      destination.delete();
    }

    await new File(sourceUri).copy(destination);

    return `${AVATAR_PHOTO_DIRECTORY}/${fileName}`;
  } catch {
    return sourceUri;
  }
}

/**
 * Returns the file name of a managed avatar photo, or `null` when the value does not
 * point into the `avatar-photos` directory.
 */
function getManagedFileName(stored: string | null | undefined): string | null {
  const value = typeof stored === "string" ? stored.trim() : "";

  if (!value) {
    return null;
  }

  const path = value.split("?")[0]?.split("#")[0] ?? "";
  const segments = path.split("/").filter(Boolean);
  const directoryIndex = segments.lastIndexOf(AVATAR_PHOTO_DIRECTORY);

  if (directoryIndex === -1 || directoryIndex !== segments.length - 2) {
    return null;
  }

  return segments[segments.length - 1] ?? null;
}

let cachedDocumentDirectoryUri: string | null = null;

function getDocumentDirectoryUri(): string | null {
  if (cachedDocumentDirectoryUri) {
    return cachedDocumentDirectoryUri;
  }

  try {
    const uri = Paths.document.uri;

    if (typeof uri === "string" && uri.length > 0) {
      cachedDocumentDirectoryUri = uri;
      return uri;
    }
  } catch {
    // Filesystem unavailable (e.g. web) — fall back to the stored value.
  }

  return null;
}

function getFileExtension(uri: string) {
  const extension = uri.split("?")[0]?.split(".").pop()?.toLowerCase();

  if (extension === "png" || extension === "webp" || extension === "heic" || extension === "heif") {
    return extension;
  }

  return "jpg";
}
