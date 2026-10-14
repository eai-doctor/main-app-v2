# Medplum login (main-clinic)

Clinicians can sign in with Medplum instead of auth-service (MongoDB). Off by default.

## Run

Copy the self-hosted staging template (it contains no secrets):

```bash
cp apps/main-clinic/.env.vps-medplum.example apps/main-clinic/.env.local
```

Then `npm install` and `npm run dev -w main-clinic`. Sign in with a Practitioner
account belonging to the configured self-hosted Medplum project.

The browser connects directly to `https://api.eai-medplum-staging.tech/`.
The **FHIR Management** card on the clinic home page opens the self-hosted web
app configured by `VITE_MEDPLUM_APP_URL` in a separate tab.
The Medplum server must list the exact frontend origin in `MEDPLUM_ALLOWED_ORIGINS`.
For local development that is `http://localhost:5170`; add the eventual production
frontend origin before deploying. Never use `*` and never put a ClientApplication
secret in a Vite environment variable.

This switch currently covers **main-clinic only**. `main-landing` and
`main-patient` continue using the existing EAI auth-service until their account
flows and role mapping are migrated separately.

Landing page: add `EAI_CLINIC_AUTH=medplum` to `apps/main-landing/.env` so "Clinician sign in" goes to the
Medplum sign-in page.
