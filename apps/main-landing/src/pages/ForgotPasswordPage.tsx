import { Alert, Anchor, Button, Center, Stack, Text, TextInput } from '@mantine/core';
import { IconAlertCircle, IconMail } from '@tabler/icons-react';
import type { FormEvent, JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { AuthCard } from '../auth/AuthCard';
import { forgotPassword } from '../auth/authService';
import { normalizeEmail } from '../auth/errors';
import { useCarryParams } from '../auth/useAfterSignIn';

/** POST /pw/forgot-password. The emailed link goes to the existing reset page in the portals. */
export function ForgotPasswordPage(): JSX.Element {
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const withParams = useCarryParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (loading || !email.trim()) {
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await forgotPassword(normalizeEmail(email));
      setSent(true);
    } catch {
      setError(t('auth.forgotFailed'));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard title={t('auth.checkEmailTitle')}>
        <Stack gap="md" align="center">
          <IconMail size={40} stroke={1.4} color="var(--mantine-color-blue-6)" />
          <Text size="sm" ta="center">
            {t('auth.resetLinkSent')} <b>{normalizeEmail(email)}</b>
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            {t('auth.checkSpam')}
          </Text>
          <Button component={Link} to={withParams('/signin', { email: normalizeEmail(email) })} fullWidth>
            {t('auth.backToSignIn')}
          </Button>
        </Stack>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('auth.forgotTitle')} subtitle={t('auth.forgotDesc')}>
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
          <Button type="submit" fullWidth loading={loading}>
            {t('auth.sendResetLink')}
          </Button>
          <Center>
            <Anchor component={Link} to={withParams('/signin')} size="sm">
              {t('auth.backToSignIn')}
            </Anchor>
          </Center>
        </Stack>
      </form>
    </AuthCard>
  );
}
