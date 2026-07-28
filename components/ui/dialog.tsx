import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  type ModalProps,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { X } from "@/lib/icons";
import { durations, timings } from "@/lib/motion";
import { semanticColors, shadowPresets } from "@/lib/theme";
import { cn } from "@/lib/utils";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Escape hatch for a native transition. Defaults to `"none"` because the
   * overlay fade is driven by motion tokens (and therefore honours
   * `ReduceMotion.System`, which the native fade does not).
   */
  animationType?: ModalProps["animationType"];
}

/**
 * Overlay shell. It owns the backdrop fade and the mount window; the card
 * entrance (springs.modal lift) belongs to the concrete dialog — see
 * `components/ui/confirm-dialog.tsx` for the canonical pattern.
 *
 * The modal stays mounted for one `durations.fast` beat after `visible` flips
 * to false so the fade-out can actually play instead of the overlay being
 * ripped out of the tree.
 */
export function Dialog({
  visible,
  onClose,
  children,
  animationType = "none",
}: DialogProps) {
  const [mounted, setMounted] = useState(visible);
  const overlay = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }

    const timeout = setTimeout(() => setMounted(false), durations.fast);
    return () => clearTimeout(timeout);
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    overlay.value = withTiming(visible ? 1 : 0, timings.fast);
  }, [mounted, overlay, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <AnimatedPressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={onClose}
          style={overlayStyle}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {children}
          </Pressable>
        </AnimatedPressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function DialogContent({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className={cn(
        "mx-6 w-[340px] max-w-[90%] rounded-card bg-card p-6",
        className
      )}
      style={[shadowPresets.shadowFloating, style]}
    >
      {children}
    </View>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <View className={cn("mb-4", className)}>{children}</View>;
}

export function DialogTitle({
  className,
  children,
  maxFontSizeMultiplier = 1.3,
}: {
  className?: string;
  children: React.ReactNode;
  /** Dialog titles sit in fixed line boxes — cap Dynamic Type growth. */
  maxFontSizeMultiplier?: number;
}) {
  return (
    <Text
      className={cn("text-xl font-headline text-card-foreground", className)}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
    >
      {children}
    </Text>
  );
}

export function DialogDescription({
  className,
  children,
  maxFontSizeMultiplier = 1.4,
}: {
  className?: string;
  children: React.ReactNode;
  maxFontSizeMultiplier?: number;
}) {
  return (
    <Text
      className={cn("text-sm text-muted-foreground font-body mt-1", className)}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
    >
      {children}
    </Text>
  );
}

export function DialogClose({
  onClose,
  className,
  accessibilityLabel = "Dialog schließen",
}: {
  onClose: () => void;
  className?: string;
  /** Override when a more specific German label reads better in context. */
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      className={cn("absolute right-4 top-4 p-1 active:opacity-70", className)}
      onPress={onClose}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={12}
    >
      <X size={20} color={semanticColors.mutedForeground} />
    </Pressable>
  );
}
