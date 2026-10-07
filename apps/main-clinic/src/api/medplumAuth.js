// Medplum account handling for main-clinic.
//
// Sign-in itself is Medplum's official <SignInForm> (pages/public/medplum-signin), which uses the `medplum`
// client below: email → password → two-factor / choose project if needed → tokens kept in localStorage.
// This file turns the signed-in Medplum profile (Practitioner / Patient) into the `user` object the rest of
// main-clinic already uses ({ id, name, email, role }), and holds the other account calls (sign out,
// change password / name, admin: register a doctor).
import { MedplumClient, formatHumanName } from "@medplum/core";
import config from "@/config";

export const medplum = new MedplumClient({
  baseUrl: config.medplumBaseUrl,
  clientId: config.medplumClientId || undefined,
  // Session expired and could not be refreshed: AuthContext listens and signs the user out.
  onUnauthenticated: () => window.dispatchEvent(new Event(MEDPLUM_SIGNED_OUT)),
});

export const MEDPLUM_SIGNED_OUT = "medplum:signed-out";

/** Current access token for our own API calls, refreshed first when it is about to expire. */
export async function getMedplumToken() {
  if (!medplum.getActiveLogin()) return undefined;
  try {
    await medplum.refreshIfExpired();
  } catch {
    // onUnauthenticated has already been called
  }
  return medplum.getAccessToken();
}

function authError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

/** Medplum profile + membership → main-clinic user. */
export function toClinicUser(profile, membership, loginEmail = "") {
  if (!profile) return null;
  const email = profile.telecom?.find((t) => t.system === "email")?.value ?? loginEmail;
  let role = "clinician";
  if (profile.resourceType === "Patient") role = "patient";
  if (membership?.admin) role = "admin";
  return {
    id: profile.id,
    name: profile.name?.[0] ? formatHumanName(profile.name[0]) : email,
    email,
    role,
    authProvider: "medplum",
    medplumProfile: `${profile.resourceType}/${profile.id}`,
  };
}

function currentUser(loginEmail) {
  return toClinicUser(medplum.getProfile(), medplum.getProjectMembership(), loginEmail);
}

/** Restore the session saved by the SDK (localStorage). Resolves null when nobody is signed in. */
export async function medplumRestore() {
  if (!medplum.getActiveLogin()) return null;
  try {
    await medplum.getProfileAsync();
    // The sign-in email lives on the Medplum User, not always on the Practitioner.
    const me = await medplum.get("auth/me").catch(() => undefined);
    const user = currentUser(me?.user?.email);
    return user ? { user, accessToken: medplum.getAccessToken() } : null;
  } catch {
    medplum.clearActiveLogin();
    return null;
  }
}

export async function medplumLogout() {
  try {
    await medplum.signOut();
  } catch {
    medplum.clearActiveLogin();
  }
}

// ---------- Account settings (signed-in user) ----------

/** Settings → change password. Same endpoint as Medplum's own ChangePasswordForm. */
export async function medplumChangePassword(oldPassword, newPassword) {
  await medplum.post("auth/changepassword", { oldPassword, newPassword });
}

/** "Dr. Jane Mary Smith" → { given: ["Jane", "Mary"], family: "Smith" } */
export function toHumanName(fullName) {
  const parts = fullName.trim().replace(/^dr\.?\s+/i, "").split(/\s+/).filter(Boolean);
  const family = parts.length > 1 ? parts.pop() : undefined;
  return { given: parts, ...(family ? { family } : {}) };
}

/** Settings → change name: updates the Practitioner (or Patient) resource in Medplum. */
export async function medplumUpdateName(fullName) {
  const profile = await medplum.getProfileAsync();
  if (!profile) throw authError("Not signed in.", "MEDPLUM_NOT_SIGNED_IN");
  const updated = await medplum.updateResource({ ...profile, name: [toHumanName(fullName)] });
  return toClinicUser(updated, medplum.getProjectMembership());
}

// ---------- Admin ----------

/**
 * Admin dashboard → register a doctor: creates a Practitioner + user in the current Medplum project
 * (POST admin/projects/{id}/invite, needs a project admin). Phone / specialty / clinic go on the Practitioner.
 */
export async function medplumRegisterDoctor({ name, email, password, phone, specialty, clinic_name }) {
  const projectId = medplum.getProject()?.id;
  if (!projectId) throw authError("Not signed in to a Medplum project.", "MEDPLUM_NO_PROJECT");
  const { given, family } = toHumanName(name);
  const membership = await medplum.invite(projectId, {
    resourceType: "Practitioner",
    firstName: given.join(" ") || name.trim(),
    lastName: family ?? "",
    email,
    password: password || undefined,
    sendEmail: !password,
  });
  const ref = membership?.profile?.reference;
  if (ref && (phone || specialty || clinic_name)) {
    const id = ref.split("/")[1];
    const practitioner = await medplum.readResource("Practitioner", id);
    await medplum.updateResource({
      ...practitioner,
      telecom: [
        ...(practitioner.telecom ?? []),
        ...(phone ? [{ system: "phone", value: phone, use: "work" }] : []),
      ],
      qualification: specialty ? [{ code: { text: specialty } }] : practitioner.qualification,
      address: clinic_name ? [{ use: "work", text: clinic_name }] : practitioner.address,
    });
  }
  return { name: name.trim(), email, membership };
}
