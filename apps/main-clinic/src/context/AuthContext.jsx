import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "@/config";
import i18n from "@/i18n";
import { 
  authLogin, 
  authMe, 
  authLogout, 
  authRefresh, 
  authRegister,
  authVerifyEmail, 
  authResendVerification, 
  authForgotPassword, 
  authAdminLogin 
} from "@/api/authApi";
import { setStoredToken, getStoredToken, clearStoredToken } from "@/api/axiosBase";
import { MEDPLUM_SIGNED_OUT, medplumLogout, medplumRestore } from "@/api/medplumAuth";

const USE_MEDPLUM = config.authProvider === "medplum";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  const isAuthenticated = !!user;
  const isPatient = isAuthenticated && user.role == "patient";

  // console.log("storedToken:", getStoredToken());
  // console.log("accessToken:", accessToken);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (USE_MEDPLUM) {
        const session = await medplumRestore();
        if (isMounted) {
          setUser(session?.user ?? null);
          setAccessToken(session?.accessToken ?? null);
          setStoredToken(session?.accessToken ?? null);
          setLoading(false);
        }
        return;
      }
      try {
        const refreshRes = await authRefresh({ withCredentials: true });
        const newAccessToken = refreshRes.data.access_token;

        if (isMounted) {
          setStoredToken(newAccessToken);
          setAccessToken(newAccessToken); 
        }

        const userRes = await authMe({
          headers: { Authorization: `Bearer ${newAccessToken}` }
        });

        if (isMounted && userRes.data?.user) {
          setUser(userRes.data.user);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Session recovery failed (No refresh token or expired)");
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();
    return () => { isMounted = false; };
  }, []);

  // saebyeok - cookie reflected
const login = useCallback(async (email, password) => {
  if (USE_MEDPLUM) {
    // Medplum login happens on Medplum's official sign-in page.
    window.location.assign("/signin");
    return null;
  }
  try {
    const res = await authLogin({ email, password });
    const { user: userData, access_token: tokenData } = res.data;

    setUser(userData);
    setAccessToken(tokenData);
    setStoredToken(tokenData);
    return userData;

  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.requires_verification) {
      const enriched = new Error(err.response.data.error);
      enriched.code = "REQUIRES_VERIFICATION";
      enriched.requiresVerification = true;
      enriched.email = err.response.data.email;
      throw enriched;
    }

    const code = err.response?.data?.code;
    const enrichedError = new Error(err.response?.data?.error ?? "unknown");
    enrichedError.code = code;
    enrichedError.status = err.response?.status;
    throw enrichedError;
  }
}, []);

const adminLogin = useCallback(async (email, password) => {
  if (USE_MEDPLUM) {
    // Medplum admin login: Medplum's sign-in page, admin mode (checks ProjectMembership.admin).
    window.location.assign("/signin?admin=1");
    return null;
  }
  try {
    setLoading(true);
    const res = await authAdminLogin({ email, password });
    const { user: userData, access_token: tokenData } = res.data;

    console.log(res);

    setUser(userData);
    setAccessToken(tokenData);
    setStoredToken(tokenData);
    setLoading(false);
    return res;

  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.requires_verification) {
      const enriched = new Error(err.response.data.error);
      enriched.code = "REQUIRES_VERIFICATION";
      enriched.requiresVerification = true;
      enriched.email = err.response.data.email;
      throw enriched;
    }

    const code = err.response?.data?.code;
    const enrichedError = new Error(err.response?.data?.error ?? "unknown");
    enrichedError.code = code;
    enrichedError.status = err.response?.status;
    throw enrichedError;
  }
}, []);

  // saebyeok - cookie reflected
  const logout = useCallback(async () => {
    const role = user?.role;

    try {
      if (USE_MEDPLUM) await medplumLogout();
      else await authLogout();
    } catch (err) {
      console.error("Logout notification failed", err);
    }

    setUser(null);
    setAccessToken(null);   
    setStoredToken(null);  
    clearStoredToken();

    
    // Back to the EAI landing page when it is configured; otherwise the previous behaviour.
    if (config.landingUrl) {
      window.location.replace(`${config.landingUrl}/?lng=${(i18n.language || "en").slice(0, 2)}`);
      return;
    }
    window.location.replace(
      role === "clinician" ? "/clinic-join?mode=scrolling" : "/"
    );
  }, [user]);

 const register = useCallback(async (email, password, name, role) => {  // t 제거
  try {
    const res = await authRegister({ email, password, name, role });

    if (res.data.requires_verification) {
      return { requiresVerification: true, email: res.data.email };
    }

    const { user: userData, access_token: tokenData } = res.data;
    setUser(userData);
    setAccessToken(tokenData);
    setStoredToken(tokenData);
    return userData;

  } catch (err) {
    const code = err.response?.data?.code;
    const enrichedError = new Error(err.response?.data?.error ?? "unknown");
    enrichedError.code = code;
    enrichedError.status = err.response?.status;
    throw enrichedError;
  }
}, []);

  const verifyEmail = useCallback(async (email, code) => {
    const res = await authVerifyEmail({
      email,
      code,
    });
    const data = res.data;
      const userData = data.user;
      const tokenData = data.access_token;

      setUser(userData);
      setAccessToken(tokenData);
      setStoredToken(tokenData);

    return userData;
  }, []);

  const resendVerification = useCallback(async (email) => {
    const res = await authResendVerification({
      email,
    });
    return res.data;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return null;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await authForgotPassword({
      email,
    });
    return res.data;
  }, []);

  // Medplum login: the SDK could not refresh the session → treat as signed out.
  useEffect(() => {
    if (!USE_MEDPLUM) return undefined;
    const onSignedOut = () => {
      setUser(null);
      setAccessToken(null);
      clearStoredToken();
    };
    window.addEventListener(MEDPLUM_SIGNED_OUT, onSignedOut);
    return () => window.removeEventListener(MEDPLUM_SIGNED_OUT, onSignedOut);
  }, []);

  // Set up axios response interceptor for 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        // Session expired or invalid — log out
        if (err.response?.status === 401 && user) {
          console.warn("Access token expired or invalid. Logging out.", err);
          // logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, isPatient, loading, login, adminLogin, logout, register, verifyEmail, resendVerification, accessToken, changePassword, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );


}
