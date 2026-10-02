import { Alert, Anchor, Button, List, PasswordInput, Stack, Text, TextInput, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import type { FormEvent, JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { AlreadySignedIn, AuthCard } from '../auth/AuthCard';
import { useAuth } from '../auth/AuthProvider';
import { errorMessage, normalizeEmail, PASSWORD_RULES } from '../auth/errors';
import { useAfterSignIn, useCarryParams } from '../auth/useAfterSignIn';
import { portalHomeUrl, portalKey } from '../features';
import { config } from '../config';

/**
 * Patient self sign-up (POST /register, role "patient"), same as main-patient's LoginModal.
 * Clinician accounts are created through the clinic onboarding flow, not here.
 */
export function RegisterPage(): JSX.Element {
  const { register, setSignedIn, user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const afterSignIn = useAfterSignIn();
  const withParams = useCarryParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const passwordOk = PASSWORD_RULES.every((r) => r.test(password));

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
    if (!name.trim()) {
      setError(t('errors.NAME_REQUIRED'));
      return;
    }
    if (!passwordOk) {
      setError(t('errors.PASSWORD_INVALID'));
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const res = await register(normalizeEmail(email), password, name.trim(), 'patient');
      if ('requiresVerification' in res) {
        navigate(withParams('/verify', { email: res.email }));
        return;
      }
      setSignedIn(res);
      afterSignIn(res.user);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}
          <TextInput
            label={t('auth.fullName')}
            placeholder={t('auth.namePlaceholder')}
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
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
              placeholder={t('auth.passwordPlaceholderNew')}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <List size="xs" spacing={2} mt={8}>
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(password);
                return (
                  <List.Item
                    key={r.key}
                    c={ok ? 'teal.7' : 'dimmed'}
                    icon={
                      <ThemeIcon size={14} radius="xl" color={ok ? 'teal' : 'gray'} variant="light">
                        {ok ? <IconCheck size={10} /> : <IconX size={10} />}
                      </ThemeIcon>
                    }
                  >
                    {t(`auth.rules.${r.key}`)}
                  </List.Item>
                );
              })}
            </List>
          </div>
          <Text size="xs" c="dimmed">
            {t('auth.agreement')}{' '}
            <Anchor href={`${config.patientPortalUrl}/PRIVACY_POLICY.pdf`} target="_blank" size="xs">
              {t('auth.privacyPolicy')}
            </Anchor>
            .
          </Text>
          <Button type="submit" fullWidth loading={loading}>
            {t('auth.createAccountButton')}
          </Button>
          <Text size="sm" ta="center">
            {t('auth.haveAccount')}{' '}
            <Anchor component={Link} to={withParams('/signin')}>
              {t('auth.signInLink')}
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthCard>
  );
}
