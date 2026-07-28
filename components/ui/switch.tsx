import React, { useCallback } from "react";
import { Switch as RNSwitch } from "react-native";

import { triggerFeedback } from "@/lib/feedback";
import { semanticColors } from "@/lib/theme";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /**
   * Built-in selection tick. Set `false` when the change handler already fires
   * its own semantic event so the user does not feel two haptics for one flip.
   */
  haptic?: boolean;
}

/**
 * Track/thumb wrapper around the platform switch. The selection tick lives here
 * instead of in every screen: `triggerFeedback` honours the global haptics
 * switch and throttles, and switches always sit in quiet parent-facing
 * surfaces, so the feedback stays silent.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  haptic = true,
}: SwitchProps) {
  const handleValueChange = useCallback(
    (next: boolean) => {
      if (haptic) {
        void triggerFeedback("theme_preview", { disableSound: true });
      }
      onCheckedChange(next);
    },
    [haptic, onCheckedChange]
  );

  return (
    <RNSwitch
      value={checked}
      onValueChange={handleValueChange}
      disabled={disabled}
      trackColor={{ false: semanticColors.border, true: semanticColors.primary }}
      thumbColor={checked ? semanticColors.gold : semanticColors.card}
      ios_backgroundColor={semanticColors.border}
    />
  );
}
