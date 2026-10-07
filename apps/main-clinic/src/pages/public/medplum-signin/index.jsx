// /signin — Medplum's official sign-in form (@medplum/react <SignInForm>), used when VITE_AUTH_PROVIDER=medplum.
// Same screens and steps as app.medplum.com: email → password → two-factor (set up / enter code) → choose
// project when the account is in several. /signin?admin=1 is the admin sign-in (project administrators only).
// /signin?next=/functions/ask-ebo-ai opens that page after signing in (used by the landing page's clinician tools).
//
// This page loads Mantine (Medplum's UI library) and its global styles. It is only loaded on this route and
// we leave it with a full page load, so Mantine's styles never reach the rest of main-clinic (Tailwind).
import { MantineProvider, Text, Title } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { MedplumProvider, SignInForm } from "@medplum/react";
import "@medplum/react/styles.css";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import config from "@/config";
import { medplum, medplumLogout, medplumRestore } from "@/api/medplumAuth";

// Medplum's sign-in form is English only, so this page is in English too (not translated).
const TEXT = {
  title: "Sign in to EAI Clinic",
  adminTitle: "Admin sign in",
  notAdmin: "This account is not an administrator of the EAI project.",
  failed: "Sign-in could not be completed. Please try again.",
  back: "Back",
};

// Same font sizes as Medplum's apps (medplum-provider).
const theme = {
  primaryColor: "blue",
  fontSizes: { xs: "0.6875rem", sm: "0.875rem", md: "0.875rem", lg: "1.0rem", xl: "1.125rem" },
};

export default function MedplumSignInPage() {
  const [params] = useSearchParams();
  const isAdmin = params.get("admin") === "1";
  // Only paths inside main-clinic ("/..." but not "//other-site").
  const next = params.get("next");
  const nextPath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const [error, setError] = useState("");
  // The form is remounted (key) to start again from the email screen after a refused admin sign-in.
  const [attempt, setAttempt] = useState(0);

  const handleSuccess = async () => {
    const session = await medplumRestore();
    if (isAdmin && session?.user?.role !== "admin") {
      await medplumLogout();
      setError(TEXT.notAdmin);
      setAttempt((n) => n + 1);
      return;
    }
    // Full page load: main-clinic restores the Medplum session from localStorage (AuthContext).
    window.location.replace(isAdmin ? "/admin/dashboard" : nextPath);
  };

  return (
    <MedplumProvider medplum={medplum}>
      <MantineProvider theme={theme}>
        <Notifications position="bottom-right" />
        <div style={{ minHeight: "100vh", background: "var(--mantine-color-gray-0)", paddingTop: 64 }}>
          <SignInForm
            key={attempt}
            projectId={config.medplumProjectId || undefined}
            clientId={config.medplumClientId || undefined}
            onSuccess={() => {
              handleSuccess().catch(() => setError(TEXT.failed));
            }}
          >
            <img src="/images/logo.png" alt="EAI Doctor" style={{ height: 32, width: "auto" }} />
            <Title order={3} py="lg">
              {isAdmin ? TEXT.adminTitle : TEXT.title}
            </Title>
            {error && (
              <Text c="red" size="sm" mb="md" ta="center">
                {error}
              </Text>
            )}
          </SignInForm>
          <Text ta="center" size="sm" mt="lg">
            <a href="/clinic-join" style={{ color: "var(--mantine-color-dimmed)" }}>
              {TEXT.back}
            </a>
          </Text>
        </div>
      </MantineProvider>
    </MedplumProvider>
  );
}
