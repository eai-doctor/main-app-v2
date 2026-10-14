/**
 * Where everything lives. Defaults match the existing apps' local dev ports (see main-clinic / main-patient vite.config.js).
 * Override any of these in apps/main-landing/.env for staging / production.
 */
function url(value: string | undefined, fallback: string): string {
  return (value || fallback).replace(/\/$/, '');
}

export const config = {
  /**
   * Auth-service base URL as seen by the browser.
   * Dev: "/api/auth" goes through this app's Vite proxy (see vite.config.ts), so no CORS setup is needed.
   * Prod: "/api/auth" is rewritten to the Cloud Run auth-service by vercel.json, same as main-clinic / main-patient.
   */
  authUrl: url(import.meta.env.EAI_AUTH_URL, '/api/auth'),
  clinicPortalUrl: url(import.meta.env.EAI_CLINIC_PORTAL_URL, 'http://localhost:5170'),
  patientPortalUrl: url(import.meta.env.EAI_PATIENT_PORTAL_URL, 'http://localhost:5171'),
  /** Genetic consultation app (Angular) */
  geneticConsultationUrl: url(import.meta.env.EAI_GENETIC_URL, 'http://localhost:4200'),
  /** Nutrition consultation app */
  nutritionConsultationUrl: url(import.meta.env.EAI_NUTRITION_URL, 'http://localhost:5174'),
  /** "medplum": clinicians sign in on main-clinic's Medplum sign-in page instead of here. */
  clinicSignInWithMedplum: import.meta.env.EAI_CLINIC_AUTH === 'medplum',
};
