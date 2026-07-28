import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Routine Stars has no accounts and no sign-in — everything lives on this
 * device. The only "auth" in the app is the parent gate: a PIN that unlocks the
 * parent area for the current session and re-locks on demand or on restart.
 */
interface AuthContextType {
  /** True while the parent area (settings) may be entered without a PIN. */
  isParentAuthorized: boolean;
  /** Called after a successful PIN check. */
  authorizeParent: () => void;
  /** Re-locks the parent area — settings bounce back to the PIN screen. */
  deauthorizeParent: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isParentAuthorized, setIsParentAuthorized] = useState(false);

  const authorizeParent = useCallback(() => {
    setIsParentAuthorized(true);
  }, []);

  const deauthorizeParent = useCallback(() => {
    setIsParentAuthorized(false);
  }, []);

  const value = useMemo(
    () => ({ isParentAuthorized, authorizeParent, deauthorizeParent }),
    [authorizeParent, deauthorizeParent, isParentAuthorized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
