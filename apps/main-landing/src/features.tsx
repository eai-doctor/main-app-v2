import {
  IconBooks,
  IconBrain,
  IconClipboardHeart,
  IconDna2,
  IconEye,
  IconFileAnalytics,
  IconMessageChatbot,
  IconMicrophone,
  IconPill,
  IconSalad,
  IconScan,
  IconSearch,
  IconShieldPlus,
  IconStethoscope,
  IconUsers,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import type { EaiUser, Role } from './auth/authService';
import { getAccessToken } from './auth/authService';
import { config } from './config';
import { withLang } from './i18n';

export type Audience = 'patient' | 'clinician';

type Target =
  | { readonly app: 'patient' | 'clinic'; readonly path: string }
  | { readonly external: string };

export interface Feature {
  /** Also the translation key: features.<id>.title / features.<id>.description (src/i18n/locales). */
  readonly id: string;
  readonly icon: JSX.Element;
  readonly audience: Audience;
  readonly target: Target;
  /** Roles allowed to open it. Undefined = anyone, signed in or not. */
  readonly roles?: readonly Role[];
}

const CLINICIAN: readonly Role[] = ['clinician', 'admin'];
const PATIENT: readonly Role[] = ['patient'];
const s = 26;

/** Every card on the landing page opens a real, existing feature in main-patient / main-clinic / an external app. */
export const FEATURES: Feature[] = [
  // ---------- Patients (apps/main-patient) ----------
  {
    id: 'health-consultation',
    icon: <IconMessageChatbot size={s} />,
    audience: 'patient',
    target: { app: 'patient', path: '/health-consultation' },
  },
  {
    id: 'self-triage',
    icon: <IconShieldPlus size={s} />,
    audience: 'patient',
    target: { app: 'patient', path: '/triage-engine' },
    roles: PATIENT,
  },
  {
    id: 'medical-profile',
    icon: <IconClipboardHeart size={s} />,
    audience: 'patient',
    target: { app: 'patient', path: '/medical-profile' },
    roles: PATIENT,
  },
  {
    id: 'report-analysis',
    icon: <IconFileAnalytics size={s} />,
    audience: 'patient',
    target: { app: 'patient', path: '/medical-report-analysis' },
  },
  {
    id: 'genetic',
    icon: <IconDna2 size={s} />,
    audience: 'patient',
    target: { external: config.geneticConsultationUrl },
  },
  {
    id: 'nutrition',
    icon: <IconSalad size={s} />,
    audience: 'patient',
    target: { external: config.nutritionConsultationUrl },
  },

  // ---------- Clinicians (apps/main-clinic) ----------
  {
    id: 'patients',
    icon: <IconUsers size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/patients' },
    roles: CLINICIAN,
  },
  {
    id: 'transcribe',
    icon: <IconMicrophone size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/transcribe' },
    roles: CLINICIAN,
  },
  {
    id: 'ask-ebo-ai',
    icon: <IconBrain size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/ask-ebo-ai' },
    roles: CLINICIAN,
  },
  {
    id: 'skin-cancer',
    icon: <IconScan size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/skin-cancer-detection' },
    roles: CLINICIAN,
  },
  {
    id: 'retinal',
    icon: <IconEye size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/retinal-disease-detection' },
    roles: CLINICIAN,
  },
  {
    id: 'pubmed',
    icon: <IconSearch size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/pubmed' },
    roles: CLINICIAN,
  },
  {
    id: 'merck',
    icon: <IconBooks size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/merck-manual' },
    roles: CLINICIAN,
  },
  {
    id: 'drug-bank',
    icon: <IconPill size={s} />,
    audience: 'clinician',
    target: { app: 'clinic', path: '/functions/drug-bank' },
    roles: CLINICIAN,
  },
  {
    id: 'genetic-clinician',
    icon: <IconStethoscope size={s} />,
    audience: 'clinician',
    target: { external: config.geneticConsultationUrl },
  },
];

export function getFeature(id: string | null | undefined): Feature | undefined {
  return FEATURES.find((f) => f.id === id);
}

/** Where a signed-in user lands by default (with ?lng= so the portal opens in the same language). */
export function portalHomeUrl(user: EaiUser): string {
  switch (user.role) {
    case 'clinician':
      return withLang(`${config.clinicPortalUrl}/`);
    case 'admin':
      return withLang(`${config.clinicPortalUrl}/admin/dashboard`);
    default:
      return withLang(`${config.patientPortalUrl}/`);
  }
}

/** Translation key for the user's portal: t(`portalTitles.${key}`) or t(`portals.${key}`). */
export function portalKey(user: EaiUser): 'patient' | 'clinic' {
  return user.role === 'patient' ? 'patient' : 'clinic';
}

/** The clinic onboarding page in main-clinic. */
export function clinicJoinUrl(): string {
  return withLang(`${config.clinicPortalUrl}/clinic-join`);
}

export type LaunchCheck =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'signin' }
  | { readonly ok: false; readonly reason: 'wrong-role' };

export function canLaunch(feature: Feature, user: EaiUser | undefined): LaunchCheck {
  if (!feature.roles) {
    return { ok: true };
  }
  if (!user) {
    return { ok: false, reason: 'signin' };
  }
  return feature.roles.includes(user.role) ? { ok: true } : { ok: false, reason: 'wrong-role' };
}

/**
 * Open the real feature. Portal features open in this tab. External apps open in a new tab from a click
 * (as the portals do today), or in this tab when called after an async sign-in, where a popup would be blocked.
 */
export function launchFeature(feature: Feature, options?: { readonly sameTab?: boolean }): void {
  const t = feature.target;
  if ('external' in t) {
    const token = getAccessToken();
    const url = token ? `${t.external}?token=${encodeURIComponent(token)}` : t.external;
    if (options?.sameTab) {
      window.location.assign(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }
  const base = t.app === 'clinic' ? config.clinicPortalUrl : config.patientPortalUrl;
  window.location.assign(withLang(`${base}${t.path}`));
}
