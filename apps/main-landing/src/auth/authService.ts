/**
 * The ONLY file that knows which account system the landing page uses.
 *
 * Today: the existing EAI auth-service (same endpoints as apps/main-clinic and apps/main-patient → src/api/authApi.js).
 * Later (Medplum user management): re-implement these functions with MedplumClient and nothing else changes.
 *
 * Session model (same as main-clinic / main-patient):
 *  - /login, /register, /verify-email return { user, access_token } and set an httpOnly refresh cookie.
 *  - /refresh uses that cookie to issue a new access token, /me returns the user.
 *  - The access token is kept in memory only, never in localStorage.
 */
import { config } from '../config';

export type Role = 'patient' | 'clinician' | 'admin';

export interface EaiUser {
  readonly id?: string | number;
  readonly email: string;
  readonly name?: string;
  readonly role: Role;
  readonly [key: string]: unknown;
}

export interface AuthResult {
  readonly user: EaiUser;
  readonly accessToken: string;
}

/** Error carrying the auth-service's error code (e.g. PASSWORD_TOO_SHORT) and HTTP status. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
    /** Set when the account exists but the email is not verified yet. */
    readonly requiresVerification = false,
    readonly email?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

let accessToken: string | undefined;

export function getAccessToken(): string | undefined {
  return accessToken;
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.authUrl}${path}`, {
      method,
      credentials: 'include', // send / receive the refresh cookie
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AuthError('Cannot reach the sign-in service. Check your connection and try again.', 'NETWORK');
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new AuthError(
      (data.error as string) || (data.message as string) || `Request failed (${res.status})`,
      data.code as string | undefined,
      res.status,
      res.status === 403 && Boolean(data.requires_verification),
      data.email as string | undefined
    );
  }
  return data as T;
}

function remember(data: { user: EaiUser; access_token: string }): AuthResult {
  accessToken = data.access_token;
  return { user: data.user, accessToken: data.access_token };
}

/** Restore a session from the refresh cookie. Resolves undefined when nobody is signed in. */
export async function restoreSession(): Promise<AuthResult | undefined> {
  try {
    const refreshed = await request<{ access_token: string }>('POST', '/refresh');
    accessToken = refreshed.access_token;
    const me = await request<{ user: EaiUser }>('GET', '/me');
    return me.user ? { user: me.user, accessToken } : undefined;
  } catch {
    accessToken = undefined;
    return undefined;
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  return remember(await request('POST', '/login', { email, password }));
}

export type RegisterResult = { readonly requiresVerification: true; readonly email: string } | AuthResult;

export async function register(email: string, password: string, name: string, role: Role): Promise<RegisterResult> {
  const data = await request<{ requires_verification?: boolean; email?: string; user: EaiUser; access_token: string }>(
    'POST',
    '/register',
    { email, password, name, role }
  );
  if (data.requires_verification) {
    return { requiresVerification: true, email: data.email ?? email };
  }
  return remember(data);
}

export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  return remember(await request('POST', '/verify-email', { email, code }));
}

export async function resendVerification(email: string): Promise<void> {
  await request('POST', '/resend-verification', { email });
}

export async function forgotPassword(email: string): Promise<void> {
  await request('POST', '/pw/forgot-password', { email });
}

export async function signOut(): Promise<void> {
  try {
    await request('POST', '/logout');
  } finally {
    accessToken = undefined;
  }
}
