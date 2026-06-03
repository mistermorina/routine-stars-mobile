import { useCallback, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

const COLLAPSE_SCROLL_Y = 32;
const EXPAND_SCROLL_Y = 8;

export function useCollapsibleHeader() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const handleHeaderScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;

      setIsHeaderCollapsed((current) => {
        if (offsetY > COLLAPSE_SCROLL_Y) return true;
        if (offsetY < EXPAND_SCROLL_Y) return false;
        return current;
      });
    },
    []
  );

  const toggleHeaderCollapsed = useCallback(() => {
    setIsHeaderCollapsed((current) => !current);
  }, []);

  return {
    handleHeaderScroll,
    isHeaderCollapsed,
    setIsHeaderCollapsed,
    toggleHeaderCollapsed,
  };
}
