import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { getAvatarAsset, normalizeAvatarValue } from "@/lib/avatars";
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
}

export function AvatarImage({
  avatar,
  size = 48,
  borderRadius = 16,
  backgroundColor = "rgba(255,255,255,0.78)",
  className,
  style,
  accessibilityLabel = "Avatar",
}: AvatarImageProps) {
  const normalizedAvatar = normalizeAvatarValue(avatar);
  const imageStyle = { width: "100%" as const, height: "100%" as const };

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
      {normalizedAvatar.type === "emoji" ? (
        <Text
          style={{
            fontSize: Math.round(size * 0.55),
            lineHeight: Math.round(size * 0.64),
          }}
        >
          {normalizedAvatar.emoji}
        </Text>
      ) : normalizedAvatar.type === "asset" ? (
        <Image
          source={getAvatarAsset(normalizedAvatar.id)}
          style={imageStyle}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <Image
          source={{ uri: normalizedAvatar.uri }}
          style={imageStyle}
          contentFit="cover"
          transition={120}
        />
      )}
    </View>
  );
}
