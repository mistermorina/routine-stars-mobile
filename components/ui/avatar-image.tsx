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

  const emojiTextStyle = {
    fontSize: Math.round(size * 0.55),
    lineHeight: Math.round(size * 0.64),
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
              fontSize: Math.round(size * 0.42),
              lineHeight: Math.round(size * 0.52),
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
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {renderContent()}
    </View>
  );
}
