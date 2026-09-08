import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components";
import config from "@/config";

function RouteGuard({
  children,
  requireAuth = true,
  roles = null,
  requireConsent = false,
}) {
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Loading
  if (loading) return <LoadingScreen />;


  // 2. Auth check
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/clinic-join" replace />;
  }

  // 3. Role check
  if (roles && !roles.includes(user?.role)) {
    if (user?.role === "patient") {
      window.location.replace(config.patientPortalUrl);
      return null;
    }
    return <Navigate to="/" replace />;
  }

  // 4. Consent check
  // if (requireConsent && user?.consents?.privacy_policy?.accepted !== true) {
  //   return <Navigate to="/consent" replace />;
  // }

  return children;
}

function PublicOnlyGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    window.location.replace(user.role === "clinician" ? "/clinics" : "/");
    return null;
  }

  return children;
}

 function PatientOnlyGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  // If the user has no credential
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "patient") {
    window.location.replace(user?.role === "clinician" ? "/" : config.patientPortalUrl);
    return null;
  }

  return children;
}

 function AdminOnlyGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  // If the user has no credential
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export {
  RouteGuard,
  PublicOnlyGuard,
  PatientOnlyGuard,
  AdminOnlyGuard
}