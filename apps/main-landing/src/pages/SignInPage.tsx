import { Alert, Anchor, Button, Divider, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { IconAlertCircle, IconStethoscope } from '@tabler/icons-react';
import type { FormEvent, JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AlreadySignedIn, AuthCard } from '../auth/AuthCard';
import { useAuth } from '../auth/AuthProvider';
import { AuthError } from '../auth/authService';
import { errorMessage, normalizeEmail } from '../auth/errors';
import { useAfterSignIn, useCarryParams } from '../auth/useAfterSignIn';
import { config } from '../config';
import {
  clinicJoinUrl,
  clinicMedplumSignInUrl,
  getFeature,
  portalHomeUrl,
  portalKey,
  signsInOnClinic,
} from '../features';

export function SignInPage(): JSX.Element {
  const { signIn, user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const afterSignIn = useAfterSignIn();
  const withParams = useCarryParams();
  const feature = getFeature(params.get('feature'));

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // A clinician tool with Medplum login: sign in on main-clinic instead (then the tool opens there).
  const toClinic = signsInOnClinic(feature) && feature && 'path' in feature.target ? feature.target.path : undefined;
  useEffect(() => {
    if (toClinic) {
      window.location.assign(clinicMedplumSignInUrl(toClinic));
    }
  }, [toClinic]);
  if (toClinic) {
    return <></>;
  }

  // Only show the "already signed in" card when the user arrived signed in, not mid-submit.
  if (user && !loading) {
    return (
      <AlreadySignedIn
        name={user.name || user.email}
        portalName={t(`portals.${portalKey(user)}`)}
        portalUrl={portalHomeUrl(user)}
        onSignOut={() => {
          signOut().catch(console.error);
        }}
      />
    );
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (loading) {
      return;
    }
    setError(undefined);
    setLoading(true);
    const normalized = normalizeEmail(email);
    try {
      const { user } = await signIn(normalized, password);
      afterSignIn(user);
    } catch (err) {
      if (err instanceof AuthError && err.requiresVerification) {
        navigate(withParams('/verify', { email: err.email ?? normalized }));
        return;
      }
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={t('auth.signInTitle')}
      subtitle={
        feature
          ? t('auth.signInToOpen', { feature: t(`features.${feature.id}.title`) })
          : t('auth.signInSubtitle')
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}
          <TextInput
            label={t('auth.email')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <div>
            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholderLogin')}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Group justify="flex-end" mt={6}>
              <Anchor component={Link} to={withParams('/forgot-password', email ? { email } : undefined)} size="xs">
                {t('auth.forgotPassword')}
              </Anchor>
            </Group>
          </div>
          <Button type="submit" fullWidth loading={loading}>
            {t('auth.signInButton')}
          </Button>
          <Text size="sm" ta="center">
            {t('auth.noAccount')}{' '}
            <Anchor component={Link} to={withParams('/register')}>
              {t('auth.createOne')}
            </Anchor>
          </Text>
          <Divider />
          {config.clinicSignInWithMedplum && (
            <Group gap="xs" justify="center" wrap="nowrap">
              <IconStethoscope size={16} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                {t('auth.clinicianSignIn')}{' '}
                <Anchor href={clinicMedplumSignInUrl()} size="xs">
                  {t('auth.clinicianSignInLink')}
                </Anchor>
              </Text>
            </Group>
          )}
          <Group gap="xs" justify="center" wrap="nowrap">
            <IconStethoscope size={16} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {t('auth.clinicianNoAccount')}{' '}
              <Anchor href={clinicJoinUrl()} size="xs">
                {t('auth.joinClinic')}
              </Anchor>
            </Text>
          </Group>
        </Stack>
      </form>
    </AuthCard>
  );
}
