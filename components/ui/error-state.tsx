import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Star } from "@/lib/icons";
import { enterFade } from "@/lib/motion";
import { semanticColors, shadowPresets } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  /** Defaults to "Etwas hat nicht geklappt". */
  title?: string;
  /** Defaults to a calm retry hint. Keep it blame-free and child-safe. */
  description?: string;
  /** Omit to render an informational state without a CTA. */
  onRetry?: () => void;
  /** Layout classes for the outer card (margins, flex-1, …). */
  className?: string;
  /** Defaults to "Erneut versuchen". */
  retryLabel?: string;
}

/**
 * Friendly inline error surface — for a failed load inside a screen, never for
 * validation errors (those belong next to the field) and never as a red alert.
 * Drop it where the content would have been.
 */
export function ErrorState({
  title = "Etwas hat nicht geklappt",
  description = "Wir konnten die Daten gerade nicht laden. Bitte versuche es noch einmal.",
  onRetry,
  className,
  retryLabel = "Erneut versuchen",
}: ErrorStateProps) {
  return (
    <Animated.View
      entering={enterFade()}
      className={cn("items-center rounded-card bg-card px-6 py-8", className)}
      style={shadowPresets.shadowCard}
    >
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-warning-soft"
        accessible={false}
      >
        <Star size={28} color={semanticColors.warningForeground} />
      </View>

      <View accessible accessibilityRole="text" accessibilityLabel={`${title}. ${description}`}>
        <Text className="text-center font-headline text-lg text-card-foreground">{title}</Text>
        <Text className="mt-2 text-center font-body text-sm leading-5 text-muted-foreground">
          {description}
        </Text>
      </View>

      {onRetry ? (
        <Button
          variant="outline"
          className="mt-5 w-full"
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          onPress={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </Animated.View>
  );
}
