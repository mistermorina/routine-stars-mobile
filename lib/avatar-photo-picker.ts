import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import type { AvatarValue } from "@/lib/types";

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

  const persistedUri = await persistAvatarPhotoAsync(uri);

  return {
    status: "selected",
    avatar: { type: "photo", uri: persistedUri },
  };
}

async function persistAvatarPhotoAsync(uri: string) {
  if (!FileSystem.documentDirectory) {
    return uri;
  }

  const directory = `${FileSystem.documentDirectory}avatar-photos/`;
  const extension = getFileExtension(uri);
  const destination = `${directory}avatar-${Date.now()}.${extension}`;

  try {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch {
    return uri;
  }
}

function getFileExtension(uri: string) {
  const extension = uri.split("?")[0]?.split(".").pop()?.toLowerCase();

  if (extension === "png" || extension === "webp" || extension === "heic" || extension === "heif") {
    return extension;
  }

  return "jpg";
}
