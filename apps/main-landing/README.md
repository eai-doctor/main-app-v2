# main-landing: EAI-Doctor landing page

Public entry page, next to `main-clinic` and `main-patient`. Users sign in with the existing auth-service and are sent to the right portal:

| Role | After sign-in |
|---|---|
| patient | main-patient (http://localhost:5171) |
| clinician | main-clinic (http://localhost:5170) |
| admin | main-clinic `/admin/dashboard` |

Tool cards open the real features in the portals (or the genetic / nutrition apps). Tools that need an account ask the user to sign in first.

Pages: `/`, `/signin`, `/register`, `/verify`, `/forgot-password`.

## Run

```bash
npm install                # from the repo root
npm run dev -w main-landing     # http://localhost:5180
```

Needs the auth-service on http://localhost:7860 (same as the portals). To use another one, set `EAI_AUTH_PROXY_TARGET` in `apps/main-landing/.env` (created from `.env.defaults` on first run).

## Login sharing with the portals

- The page calls `/api/auth/*` on its own origin: proxied by Vite in dev, rewritten by `vercel.json` in production.
- In dev the refresh cookie is rewritten to `localhost`, path `/`, so main-clinic and main-patient see the same session.
- In production the landing page must be served under `e-ai.ca`, because the auth-service sets the cookie on `.e-ai.ca`. Set `VITE_LANDING_URL` in the portals so logout returns here.

## Languages

English / 中文 / Français with the same i18next setup as the portals (`src/i18n/locales`). Links into the portals add `?lng=`, so they open in the same language.

## Code map

- `src/auth/authService.ts`: every call to the auth-service
- `src/auth/AuthProvider.tsx`: keeps the signed-in user, restores the session on page load
- `src/pages/`: landing, sign-in, register, verify email, forgot password
- `src/features.tsx`: the tool cards and where each one opens
- `packages/ui`: shared header, logo, card and theme
