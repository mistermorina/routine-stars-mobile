import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  fallback: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, fallback, size = 48, className }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-secondary",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src && !hasError ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Text
          className="font-headline text-muted-foreground"
          style={{ fontSize: size * 0.4 }}
        >
          {fallback}
        </Text>
      )}
    </View>
  );
}
