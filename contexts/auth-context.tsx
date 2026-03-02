import React, { createContext, useContext, useState, useCallback } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isParentAuthorized: boolean;
}

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  authorizeParent: () => void;
  deauthorizeParent: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isParentAuthorized: false,
  });

  const login = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, isParentAuthorized: false });
  }, []);

  const authorizeParent = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isParentAuthorized: true }));
  }, []);

  const deauthorizeParent = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isParentAuthorized: false }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        authorizeParent,
        deauthorizeParent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
