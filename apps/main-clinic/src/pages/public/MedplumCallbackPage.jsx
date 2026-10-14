import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function MedplumCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeMedplumLogin } = useAuth();

  const [error, setError] = useState(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(searchParams.get("error_description") || oauthError);
      return;
    }

    if (!code) {
      setError("OAuth authorization code is missing.");
      return;
    }

    const finishLogin = async () => {
      try {
        const profile = await completeMedplumLogin(code);

        console.log("Medplum login successful:", profile.id);

        window.history.replaceState(
          window.history.state,
          "",
          "/auth/callback"
        );

        navigate("/", { replace: true });
      } catch (err) {
        console.error("Medplum OAuth callback failed:", err);
        setError(err.message || "Medplum login failed.");
      }
    };

    finishLogin();
  }, [searchParams, completeMedplumLogin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2>Medplum login failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/clinic-join")}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Completing Medplum login...</p>
    </div>
  );
}