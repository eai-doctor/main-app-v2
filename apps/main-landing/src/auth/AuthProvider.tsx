import type { JSX, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthResult, EaiUser, Role } from './authService';
import * as authService from './authService';
import i18n, { toLanguageCode } from '../i18n';

interface AuthContextValue {
  readonly user: EaiUser | undefined;
  /** True until the initial session restore (refresh cookie) has finished. */
  readonly loading: boolean;
  readonly signIn: (email: string, password: string) => Promise<AuthResult>;
  readonly register: typeof authService.register;
  readonly verifyEmail: (email: string, code: string) => Promise<AuthResult>;
  readonly signOut: () => Promise<void>;
  /** Called after any successful sign-in / register / verify so the header updates. */
  readonly setSignedIn: (result: AuthResult) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<EaiUser>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService
      .restoreSession()
      .then((result) => active && setUser(result?.user))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Like the portals' AppLayout: a language saved on the account is applied after sign-in.
  // Unlike the portals, nothing is forced when the account has no saved language.
  useEffect(() => {
    const prefs = user?.preferences as { language?: string } | undefined;
    const code = toLanguageCode(prefs?.language);
    if (code && !i18n.language.startsWith(code)) {
      i18n.changeLanguage(code).catch(console.error);
    }
  }, [user]);

  const setSignedIn = useCallback((result: AuthResult) => setUser(result.user), []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    setUser(result.user);
    return result;
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const result = await authService.verifyEmail(email, code);
    setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      setUser(undefined);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, register: authService.register, verifyEmail, signOut, setSignedIn }),
    [user, loading, signIn, verifyEmail, signOut, setSignedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

export function hasRole(user: EaiUser | undefined, roles: readonly Role[]): boolean {
  return !!user && roles.includes(user.role);
}
