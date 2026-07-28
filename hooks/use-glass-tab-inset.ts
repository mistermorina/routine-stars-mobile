import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesignMode } from "@/contexts/design-mode-context";

/** Tab row height without the safe-area padding (see tab-bar.tsx geometry). */
const TAB_ROW_HEIGHT = 62;

/**
 * In glass mode the tab bar floats over the scene so its blur can sample the
 * backdrop, which means it no longer reserves layout space. Scroll views need
 * that space back or their last card sits under the bar.
 *
 * Returns `undefined` in soft mode so the existing padding classes stay
 * untouched.
 */
export function useGlassTabInset(): { paddingBottom: number } | undefined {
  const { designMode } = useDesignMode();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    if (designMode !== "glass") return undefined;
    return { paddingBottom: TAB_ROW_HEIGHT + Math.max(insets.bottom, 10) };
  }, [designMode, insets.bottom]);
}
