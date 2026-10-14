import { Alert, Anchor, Button, Center, Group, PinInput, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconMailCheck } from '@tabler/icons-react';
import type { FormEvent, JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router';
import { AuthCard } from '../auth/AuthCard';
import { useAuth } from '../auth/AuthProvider';
import { resendVerification } from '../auth/authService';
import { useAfterSignIn, useCarryParams } from '../auth/useAfterSignIn';

const RESEND_COOLDOWN = 60;

/** 6-digit email verification code (POST /verify-email), with resend cooldown like the old LoginModal. */
export function VerifyEmailPage(): JSX.Element {
  const { verifyEmail } = useAuth();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const afterSignIn = useAfterSignIn();
  const withParams = useCarryParams();
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  if (!email) {
    return <Navigate to="/signin" replace />;
  }

  async function submit(value: string): Promise<void> {
    if (loading || value.length !== 6) {
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const { user } = await verifyEmail(email, value);
      afterSignIn(user);
    } catch {
      setError(t('auth.verificationFailed'));
      setLoading(false);
    }
  }

  async function handleResend(): Promise<void> {
    if (cooldown > 0) {
      return;
    }
    setError(undefined);
    try {
      await resendVerification(email);
      setInfo(t('auth.newCodeSent'));
      setCode('');
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setError(t('auth.failedResend'));
    }
  }

  return (
    <AuthCard
      title={t('auth.verifyTitle')}
      subtitle={
        <>
          {t('auth.sentCode')} <b>{email}</b>
        </>
      }
    >
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submit(code).catch(console.error);
        }}
      >
        <Stack gap="md">
          <Center>
            <IconMailCheck size={40} stroke={1.4} color="var(--mantine-color-blue-6)" />
          </Center>
          {error && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}
          {info && !error && (
            <Alert color="blue" variant="light">
              {info}
            </Alert>
          )}
          <Center>
            <PinInput
              length={6}
              type="number"
              oneTimeCode
              autoFocus
              size="md"
              value={code}
              onChange={setCode}
              onComplete={(v) => submit(v).catch(console.error)}
              aria-label={t('auth.codeLabel')}
            />
          </Center>
          <Text size="xs" c="dimmed" ta="center">
            {t('auth.codeExpires')}
          </Text>
          <Button type="submit" fullWidth loading={loading} disabled={code.length !== 6}>
            {t('auth.verify')}
          </Button>
          <Group justify="space-between">
            <Anchor component={Link} to={withParams('/signin', { email })} size="sm">
              {t('auth.backToSignIn')}
            </Anchor>
            <Button variant="subtle" size="compact-sm" disabled={cooldown > 0} onClick={() => handleResend()}>
              {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resend')}
            </Button>
          </Group>
        </Stack>
      </form>
    </AuthCard>
  );
}
