import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { DEFAULT_AVATAR_VALUE, getAvatarAsset, getAvatarKey, normalizeAvatarValue } from "@/lib/avatars";
import { resolveAvatarPhotoUri } from "@/lib/avatar-photo-picker";
import { cn } from "@/lib/utils";
import type { AvatarValue } from "@/lib/types";

interface AvatarImageProps {
  avatar?: AvatarValue | null;
  size?: number;
  borderRadius?: number;
  backgroundColor?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /**
   * Name of the child the avatar belongs to. Its initial is shown when the image
   * cannot be loaded (deleted photo, stale path). Falls back to the default emoji.
   */
  fallbackLabel?: string;
  /**
   * Set when the avatar only repeats a label that is already read out next to it.
   * Removes the whole node from the accessibility tree on both platforms.
   */
  accessibilityElementsHidden?: boolean;
}

export function AvatarImage({
  avatar,
  size = 48,
  borderRadius = 16,
  backgroundColor = "rgba(255,255,255,0.78)",
  className,
  style,
  accessibilityLabel = "Avatar",
  fallbackLabel,
  accessibilityElementsHidden = false,
}: AvatarImageProps) {
  const normalizedAvatar = normalizeAvatarValue(avatar);
  const avatarKey = getAvatarKey(normalizedAvatar);
  const [failedAvatarKey, setFailedAvatarKey] = React.useState<string | null>(null);
  const imageStyle = { width: "100%" as const, height: "100%" as const };

  // Comparing against the key resets the error state automatically when the avatar changes.
  const hasFailed = failedAvatarKey === avatarKey;

  const handleError = React.useCallback(() => {
    setFailedAvatarKey(avatarKey);
  }, [avatarKey]);

  // Clamped to the 12px type floor so a small avatar never renders sub-legible.
  const emojiTextStyle = {
    fontSize: Math.max(12, Math.round(size * 0.55)),
    lineHeight: Math.max(14, Math.round(size * 0.64)),
  };

  const fallbackInitial = fallbackLabel?.trim().charAt(0).toUpperCase();

  function renderContent() {
    if (normalizedAvatar.type === "emoji") {
      return (
        <Text style={emojiTextStyle} maxFontSizeMultiplier={1.2}>
          {normalizedAvatar.emoji}
        </Text>
      );
    }

    if (hasFailed) {
      if (fallbackInitial) {
        return (
          <Text
            className="font-body-bold text-foreground"
            style={{
              fontSize: Math.max(12, Math.round(size * 0.42)),
              lineHeight: Math.max(14, Math.round(size * 0.52)),
            }}
            maxFontSizeMultiplier={1.2}
          >
            {fallbackInitial}
          </Text>
        );
      }

      return (
        <Text style={emojiTextStyle} maxFontSizeMultiplier={1.2}>
          {DEFAULT_AVATAR_VALUE.emoji}
        </Text>
      );
    }

    if (normalizedAvatar.type === "asset") {
      return (
        <Image
          source={getAvatarAsset(normalizedAvatar.id)}
          style={imageStyle}
          contentFit="cover"
          transition={120}
          onError={handleError}
        />
      );
    }

    return (
      <Image
        source={{ uri: resolveAvatarPhotoUri(normalizedAvatar.uri) }}
        style={imageStyle}
        contentFit="cover"
        transition={120}
        onError={handleError}
      />
    );
  }

  return (
    <View
      className={cn("items-center justify-center overflow-hidden", className)}
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
      accessibilityRole={accessibilityElementsHidden ? undefined : "image"}
      accessibilityLabel={accessibilityElementsHidden ? undefined : accessibilityLabel}
      accessibilityElementsHidden={accessibilityElementsHidden}
      importantForAccessibility={accessibilityElementsHidden ? "no-hide-descendants" : "auto"}
    >
      {renderContent()}
    </View>
  );
}
