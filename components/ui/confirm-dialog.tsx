import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { modalSpring, timings } from "@/lib/motion";
import { shadowPresets } from "@/lib/theme";

const LIFT_DISTANCE = 12;

export interface ConfirmDialogProps {
  visible: boolean;
  /** One line, states what will happen ("Kind löschen?"). */
  title: string;
  /** Optional consequence sentence — say what is lost, in German. */
  description?: string;
  /** Verb, not "OK" ("Löschen", "Zurücksetzen"). */
  confirmLabel: string;
  /** Defaults to "Abbrechen". */
  cancelLabel?: string;
  /** Deep-red confirm styling for irreversible actions. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Branded replacement for Alert.alert on confirmations.
 *
 * Never use Alert.alert in this app: it ignores the bundled fonts, the palette
 * and the radius scale, and it cannot be screenshotted for the store. Backdrop
 * tap and the hardware back button both resolve to `onCancel`, so the safe
 * choice is always the easy one.
 */
export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = "Abbrechen",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(LIFT_DISTANCE);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      lift.value = LIFT_DISTANCE;
      opacity.value = 0;
      return;
    }

    if (reduceMotion) {
      lift.value = 0;
      opacity.value = 1;
      return;
    }

    lift.value = withSpring(0, modalSpring);
    opacity.value = withTiming(1, timings.fast);
  }, [lift, opacity, reduceMotion, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: lift.value }],
  }));

  return (
    <Dialog visible={visible} onClose={onCancel}>
      <Animated.View style={cardStyle}>
        <DialogContent
          className="rounded-card p-6"
          style={shadowPresets.shadowFloating}
        >
          <View
            accessible
            accessibilityRole="alert"
            accessibilityViewIsModal
            accessibilityLabel={description ? `${title}. ${description}` : title}
          >
            <Text className="font-headline text-xl text-card-foreground">{title}</Text>
            {description ? (
              <Text className="mt-2 font-body text-sm leading-5 text-muted-foreground">
                {description}
              </Text>
            ) : null}
          </View>

          <View className="mt-6 gap-3">
            <Button
              variant={destructive ? "destructive" : "default"}
              className={destructive ? "w-full bg-destructive-strong" : "w-full"}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
            >
              {cancelLabel}
            </Button>
          </View>
        </DialogContent>
      </Animated.View>
    </Dialog>
  );
}
