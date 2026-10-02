import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { canLaunch, getFeature, launchFeature, portalHomeUrl } from '../features';
import type { EaiUser } from './authService';

/**
 * Where to go once someone is signed in:
 *  - came from a feature card (?feature=<id>) and is allowed to use it → open that feature
 *  - otherwise → their own portal (clinician → main-clinic, patient → main-patient, admin → admin dashboard)
 */
export function useAfterSignIn(): (user: EaiUser) => void {
  const [params] = useSearchParams();
  const featureId = params.get('feature');

  return useCallback(
    (user: EaiUser) => {
      const feature = getFeature(featureId);
      if (feature && canLaunch(feature, user).ok) {
        launchFeature(feature, { sameTab: true });
        return;
      }
      window.location.assign(portalHomeUrl(user));
    },
    [featureId]
  );
}

/** Keeps ?feature=… when moving between sign-in / register / verify pages. */
export function useCarryParams(): (path: string, extra?: Record<string, string>) => string {
  const [params] = useSearchParams();
  return useCallback(
    (path: string, extra?: Record<string, string>) => {
      const next = new URLSearchParams();
      const feature = params.get('feature');
      if (feature) {
        next.set('feature', feature);
      }
      for (const [k, v] of Object.entries(extra ?? {})) {
        next.set(k, v);
      }
      const qs = next.toString();
      return qs ? `${path}?${qs}` : path;
    },
    [params]
  );
}
