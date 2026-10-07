# Medplum login (main-clinic)

Clinicians can sign in with Medplum instead of auth-service (MongoDB). Off by default.

## Run

Create `apps/main-clinic/.env.local`:

```
VITE_AUTH_PROVIDER=medplum
VITE_MEDPLUM_BASE_URL=https://api.medplum.com/
```

Then `npm install` and `npm run dev -w main-clinic`. Sign in with a Medplum account (Practitioner).

Landing page: add `EAI_CLINIC_AUTH=medplum` to `apps/main-landing/.env` so "Clinician sign in" goes to the
Medplum sign-in page.