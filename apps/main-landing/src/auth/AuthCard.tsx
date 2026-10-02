import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import type { JSX, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SiteHeader } from '../SiteHeader';

/** Page frame shared by sign-in, register, verify and forgot-password. */
export function AuthCard(props: {
  readonly title: string;
  readonly subtitle?: ReactNode;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <>
      <SiteHeader />
      <Container size={440} py={48}>
        <Paper withBorder radius="md" p="xl" shadow="xs">
          <Stack gap={4} mb="lg">
            <Title order={2} fz={22} fw={700} ta="center">
              {props.title}
            </Title>
            {props.subtitle && (
              <Text c="dimmed" size="sm" ta="center">
                {props.subtitle}
              </Text>
            )}
          </Stack>
          {props.children}
        </Paper>
      </Container>
    </>
  );
}

/** Shown on /signin and /register when a session already exists. */
export function AlreadySignedIn(props: {
  readonly name: string;
  readonly portalName: string;
  readonly portalUrl: string;
  readonly onSignOut: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <AuthCard title={t('auth.alreadySignedIn')} subtitle={props.name}>
      <Stack gap="sm">
        <Button component="a" href={props.portalUrl} fullWidth>
          {t('header.open', { portal: props.portalName })}
        </Button>
        <Button variant="default" fullWidth onClick={props.onSignOut}>
          {t('auth.signInAsSomeoneElse')}
        </Button>
      </Stack>
    </AuthCard>
  );
}
