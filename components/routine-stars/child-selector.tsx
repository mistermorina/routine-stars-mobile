import React from "react";
import { Text, Pressable, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AvatarImage } from "@/components/ui/avatar-image";
import { cn } from "@/lib/utils";
import type { Child } from "@/lib/types";

interface ChildSelectorProps {
  children: Child[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
}

function ChildAvatar({
  child,
  isSelected,
  onPress,
}: {
  child: Child;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="items-center mx-3"
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          "h-20 w-20 items-center justify-center rounded-full bg-card",
          isSelected
            ? "border-2 border-gold"
            : "border-2 border-transparent"
        )}
      >
        <AvatarImage
          avatar={child.avatar}
          size={76}
          borderRadius={38}
          backgroundColor="transparent"
          accessibilityLabel={`${child.name} Avatar`}
        />
      </Animated.View>
      <Text
        className={cn(
          "mt-2 text-sm font-body-semibold",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {child.name}
      </Text>
    </Pressable>
  );
}

export function ChildSelector({
  children,
  selectedChildId,
  onSelectChild,
}: ChildSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 py-3 justify-center flex-grow"
    >
      {children.map((child) => (
        <ChildAvatar
          key={child.id}
          child={child}
          isSelected={child.id === selectedChildId}
          onPress={() => onSelectChild(child.id)}
        />
      ))}
    </ScrollView>
  );
}
