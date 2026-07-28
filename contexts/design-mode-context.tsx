import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage, KEYS } from "@/lib/storage";
import {
  DEFAULT_DESIGN_MODE,
  normalizeDesignMode,
  type DesignMode,
} from "@/lib/design-mode";

interface DesignModeContextValue {
  designMode: DesignMode;
  setDesignMode: (mode: DesignMode) => Promise<void>;
  isLoading: boolean;
}

const DesignModeContext = createContext<DesignModeContextValue | null>(null);

export function DesignModeProvider({ children }: { children: React.ReactNode }) {
  const [designMode, setMode] = useState<DesignMode>(DEFAULT_DESIGN_MODE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      const stored = await storage.getItem<string>(KEYS.DESIGN_MODE);
      if (!active) return;
      setMode(normalizeDesignMode(stored));
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const setDesignMode = useCallback(async (mode: DesignMode) => {
    // Optimistic: the toggle should flip instantly, the write can trail.
    setMode(mode);
    await storage.setItem(KEYS.DESIGN_MODE, mode);
  }, []);

  const value = useMemo(
    () => ({ designMode, setDesignMode, isLoading }),
    [designMode, isLoading, setDesignMode]
  );

  return <DesignModeContext.Provider value={value}>{children}</DesignModeContext.Provider>;
}

export function useDesignMode(): DesignModeContextValue {
  const context = useContext(DesignModeContext);

  if (!context) {
    throw new Error("useDesignMode must be used within a DesignModeProvider");
  }

  return context;
}
