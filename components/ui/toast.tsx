import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { PressableScale } from "@/components/ui/pressable-scale";
import { useToast, type ToastData } from "@/hooks/use-toast";
import { enterStagger, exitSlideDown } from "@/lib/motion";
import { shadowPresets } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * The single place toasts render. Mounted once in `app/_layout.tsx` above the
 * Stack, so `toast()` from any screen, dialog or hook becomes visible.
 */
export function ToastHost() {
  const { toasts, dismiss } = useToast();

  // Deliberately stays mounted while empty: unmounting the container would cut
  // off the exit animation of the last toast leaving it.
  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-24 left-4 right-4 z-50 items-center gap-2"
    >
      {toasts.map((entry, index) => (
        <ToastItem key={entry.id} toast={entry} index={index} onDismiss={dismiss} />
      ))}
    </View>
  );
}

function ToastItem({
  toast,
  index,
  onDismiss,
}: {
  toast: ToastData;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const isDestructive = toast.variant === "destructive";

  return (
    <Animated.View
      entering={enterStagger(index)}
      exiting={exitSlideDown()}
      className="w-full"
      accessibilityLiveRegion="polite"
    >
      <PressableScale
        onPress={() => onDismiss(toast.id)}
        accessibilityRole="button"
        accessibilityLabel={
          toast.description ? `${toast.title}. ${toast.description}` : toast.title
        }
        accessibilityHint="Zum Ausblenden tippen"
        containerClassName="w-full"
        className={cn(
          "w-full justify-center rounded-card border px-4 py-3",
          isDestructive ? "border-destructive bg-destructive-soft" : "border-border bg-card"
        )}
        style={shadowPresets.shadowFloating}
      >
        <Text
          className={cn(
            "font-body-semibold text-base",
            isDestructive ? "text-destructive-strong" : "text-card-foreground"
          )}
          maxFontSizeMultiplier={1.4}
        >
          {toast.title}
        </Text>

        {toast.description ? (
          <Text
            className={cn(
              "mt-0.5 font-body text-sm",
              isDestructive ? "text-destructive-strong" : "text-muted-foreground"
            )}
            maxFontSizeMultiplier={1.4}
          >
            {toast.description}
          </Text>
        ) : null}
      </PressableScale>
    </Animated.View>
  );
}

interface ToastOverlayProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

/**
 * @deprecated Toasts render globally through `<ToastHost />` in
 * `app/_layout.tsx`. Kept as a no-op so screens that still render it do not
 * show every toast twice; delete the render and this component with it.
 */
export function ToastOverlay(_props: ToastOverlayProps) {
  return null;
}
