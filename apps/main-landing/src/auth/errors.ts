import i18n from '../i18n';
import { AuthError } from './authService';

/** auth-service error codes with a translation (same codes and wording as the portals' auth.json → errors). */
const KNOWN_CODES = [
  'MISSING_REQUIRED_FIELDS',
  'INVALID_ROLE',
  'WEAK_PASSWORD',
  'NAME_REQUIRED',
  'PASSWORD_TOO_SHORT',
  'PASSWORD_NO_UPPERCASE',
  'PASSWORD_NO_NUMBER',
  'PASSWORD_INVALID',
  'UNKNOWN',
];

export function errorMessage(err: unknown): string {
  const t = i18n.t.bind(i18n);
  if (err instanceof AuthError) {
    if (err.code && KNOWN_CODES.includes(err.code)) {
      return t(`errors.${err.code}`);
    }
    if (err.code === 'NETWORK') {
      return t('errors.network');
    }
    if (err.status === 401) {
      return t('errors.incorrect');
    }
    if (err.status === 429) {
      return t('errors.tooMany');
    }
    if (err.status && err.status >= 500) {
      return t('errors.server');
    }
    // Other messages from the auth-service (e.g. "Account is deactivated") are shown as sent.
    if (err.message) {
      return err.message;
    }
  }
  return t('errors.generic');
}

/** Same rules as the portals' sign-up form. `key` → auth.rules.<key>. */
export const PASSWORD_RULES = [
  { key: 'length', test: (p: string) => p.length >= 8 },
  { key: 'uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', test: (p: string) => /\d/.test(p) },
] as const;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
