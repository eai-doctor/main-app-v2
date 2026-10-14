import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
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
import medplum from "@/api/medplumApi";

const AuthContext = createContext(null);

async function handleMedplumLogin() {
  await medplum.signInWithRedirect({
    clientId: '768556d8-bc38-4649-86cb-062ed562b956',
    redirectUri: 'http://dev.clinic.e-ai.ca/auth/callback',
  });
}

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

  //mediplum
  const [medplumUser, setMedplumUser] = useState(null);
  const [medplumLoading, setMedplumLoading] = useState(false);

  // console.log("storedToken:", getStoredToken());
  // console.log("accessToken:", accessToken);

  // useEffect(() => {
  //   let isMounted = true;

  //   const initializeAuth = async () => {
  //     try {
  //       const refreshRes = await authRefresh({ withCredentials: true });
  //       const newAccessToken = refreshRes.data.access_token;

  //       if (isMounted) {
  //         setStoredToken(newAccessToken);
  //         setAccessToken(newAccessToken); 
  //       }

  //       const userRes = await authMe({
  //         headers: { Authorization: `Bearer ${newAccessToken}` }
  //       });

  //       if (isMounted && userRes.data?.user) {
  //         setUser(userRes.data.user);
  //       }
  //     } catch (err) {
  //       if (isMounted) {
  //         console.warn("Session recovery failed (No refresh token or expired)");
  //         setUser(null);
  //         setAccessToken(null);
  //       }
  //     } finally {
  //       if (isMounted) setLoading(false);
  //     }
  //   };

  //   initializeAuth();
  //   return () => { isMounted = false; };
  // }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const medplumProfile = await medplum.getProfileAsync();

        if (medplumProfile) {
          if (isMounted) {
            setMedplumUser(medplumProfile);

            setUser({
              id: medplumProfile.id,
              email: 'doctor@aidoctor.com',
              name: 'Saebyeok Chu',
              role: "clinician",
              authProvider: "medplum",
            });
          }
          return;
        }

        const refreshRes = await authRefresh({
          withCredentials: true,
        });

        const newAccessToken = refreshRes.data.access_token;

        if (isMounted) {
          setStoredToken(newAccessToken);
          setAccessToken(newAccessToken);
        }

        const userRes = await authMe({
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        if (isMounted && userRes.data?.user) {
          setUser(userRes.data.user);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Session recovery failed:", err);

          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

// saebyeok - cookie reflected
const login = useCallback(async (email, password) => {

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
      if (user?.authProvider === "medplum") {
        await medplum.signOut();
      } else {
        await authLogout();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }

    setUser(null);
    setMedplumUser(null);
    setAccessToken(null);
    clearStoredToken();

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

  //101426 medipulm
  const completeMedplumLogin = useCallback(async (code) => {
    setMedplumLoading(true);

    try {
      await medplum.processCode(code);

      const profile = await medplum.getProfileAsync();

      if (!profile) {
        throw new Error("Medplum profile not found");
      }

      setMedplumUser(profile);

      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: "clinician", // 임시 UI 값. 실제 권한 검증 필요
        authProvider: "medplum",
      });

      return profile;
    } finally {
      setMedplumLoading(false);
    }
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
      value={{ handleMedplumLogin, completeMedplumLogin, medplumUser, medplumLoading, user, setUser, isAuthenticated, isPatient, loading, login, adminLogin, logout, register, verifyEmail, resendVerification, accessToken, changePassword, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );


}
