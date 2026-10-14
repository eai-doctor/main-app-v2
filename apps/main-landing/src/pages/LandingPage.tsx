import { ModuleCard } from '@eai/ui';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  List,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconArrowRight, IconCheck, IconHeartbeat, IconStethoscope } from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import type { EaiUser } from '../auth/authService';
import type { Audience, Feature } from '../features';
import {
  canLaunch,
  clinicJoinUrl,
  clinicMedplumSignInUrl,
  FEATURES,
  launchFeature,
  portalHomeUrl,
  portalKey,
  signsInOnClinic,
} from '../features';
import { config } from '../config';
import { SiteHeader } from '../SiteHeader';

export function LandingPage(): JSX.Element {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [audience, setAudience] = useState<Audience>('patient');
  // The session restores asynchronously; once we know who is signed in, show their tools first.
  useEffect(() => {
    if (user) {
      setAudience(user.role === 'patient' ? 'patient' : 'clinician');
    }
  }, [user]);
  const [blocked, setBlocked] = useState<Feature>();

  const features = FEATURES.filter((f) => f.audience === audience);

  function open(feature: Feature): void {
    const check = canLaunch(feature, user);
    if (check.ok) {
      launchFeature(feature);
    } else if (check.reason === 'signin' && signsInOnClinic(feature) && 'path' in feature.target) {
      // Clinician tool + Medplum login: sign in on main-clinic, then open the tool there.
      window.location.assign(clinicMedplumSignInUrl(feature.target.path));
    } else if (check.reason === 'signin') {
      navigate(`/signin?feature=${feature.id}`);
    } else {
      setBlocked(feature);
    }
  }

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const portalInline = user ? t(`portals.${portalKey(user)}`) : '';

  return (
    <>
      <SiteHeader />
      <Container size="lg" py={56}>
        {/* ---------- Hero ---------- */}
        <Stack align="center" gap="xs" mb={40}>
          <Title order={1} ta="center" fz={40} fw={700} lh={1.2}>
            {user
              ? firstName
                ? t('landing.welcomeBackName', { name: firstName })
                : t('landing.welcomeBack')
              : t('landing.heroTitle')}
          </Title>
          <Text c="dimmed" ta="center" size="lg" maw={640}>
            {user ? t('landing.signedInSubtitle', { portal: portalInline }) : t('landing.heroSubtitle')}
          </Text>
          {user && (
            <Button
              component="a"
              href={portalHomeUrl(user)}
              size="md"
              mt="sm"
              rightSection={<IconArrowRight size={18} />}
            >
              {t('header.open', { portal: portalInline })}
            </Button>
          )}
        </Stack>

        {/* ---------- Portals ---------- */}
        {!user && (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb={56}>
            <PortalCard
              icon={<IconHeartbeat size={28} />}
              title={t('portalTitles.patient')}
              description={t('landing.patientPortal.description')}
              points={t('landing.patientPortal.points', { returnObjects: true }) as string[]}
              primary={{ label: t('landing.patientPortal.primary'), onClick: () => navigate('/signin') }}
              secondary={{ label: t('landing.patientPortal.secondary'), onClick: () => navigate('/register') }}
            />
            <PortalCard
              icon={<IconStethoscope size={28} />}
              title={t('portalTitles.clinic')}
              description={t('landing.clinicPortal.description')}
              points={t('landing.clinicPortal.points', { returnObjects: true }) as string[]}
              primary={{
                label: t('landing.clinicPortal.primary'),
                onClick: () =>
                  config.clinicSignInWithMedplum
                    ? window.location.assign(clinicMedplumSignInUrl())
                    : navigate('/signin'),
              }}
              secondary={{ label: t('landing.clinicPortal.secondary'), href: clinicJoinUrl() }}
            />
          </SimpleGrid>
        )}

        {/* ---------- Individual tools ---------- */}
        <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap">
          <Box>
            <Title order={2} fz={24} fw={600}>
              {t('landing.toolsTitle')}
            </Title>
            <Text c="dimmed" size="sm">
              {t('landing.toolsSubtitle')}
            </Text>
          </Box>
          <SegmentedControl
            value={audience}
            onChange={(v) => setAudience(v as Audience)}
            data={[
              { label: t('landing.forPatients'), value: 'patient' },
              { label: t('landing.forClinicians'), value: 'clinician' },
            ]}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((f) => (
            <ModuleCard
              key={f.id}
              icon={f.icon}
              title={t(`features.${f.id}.title`)}
              description={t(`features.${f.id}.description`)}
              badge={badgeFor(f, user, t)}
              onClick={() => open(f)}
            />
          ))}
        </SimpleGrid>
      </Container>

      <Modal
        opened={!!blocked}
        onClose={() => setBlocked(undefined)}
        title={blocked ? t(`features.${blocked.id}.title`) : ''}
        centered
      >
        <Stack>
          <Text size="sm">
            {t('landing.wrongRole', {
              audience: t(blocked?.audience === 'clinician' ? 'landing.audienceClinicians' : 'landing.audiencePatients'),
              role: user ? t(`roles.${user.role}`) : '',
            })}
          </Text>
          {user && (
            <Button component="a" href={portalHomeUrl(user)}>
              {t('landing.goToPortal', { portal: portalInline })}
            </Button>
          )}
        </Stack>
      </Modal>
    </>
  );
}

function badgeFor(feature: Feature, user: EaiUser | undefined, t: TFunction): string | undefined {
  if ('external' in feature.target) {
    return t('landing.badgeNewTab');
  }
  const check = canLaunch(feature, user);
  if (!check.ok && check.reason === 'signin') {
    return t('landing.badgeSignIn');
  }
  return undefined;
}

function PortalCard(props: {
  readonly icon: JSX.Element;
  readonly title: string;
  readonly description: string;
  readonly points: readonly string[];
  readonly primary: { readonly label: string; readonly onClick: () => void };
  readonly secondary: { readonly label: string; readonly onClick?: () => void; readonly href?: string };
}): JSX.Element {
  return (
    <Card withBorder radius="md" padding="xl">
      <Group align="flex-start" wrap="nowrap" gap="lg">
        <ThemeIcon size={52} radius="md">
          {props.icon}
        </ThemeIcon>
        <Stack gap={6} style={{ flex: 1 }}>
          <Text fw={700} size="xl">
            {props.title}
          </Text>
          <Text c="dimmed" size="sm">
            {props.description}
          </Text>
          <List
            size="sm"
            spacing={2}
            mt={4}
            icon={
              <ThemeIcon size={16} radius="xl" variant="light">
                <IconCheck size={11} />
              </ThemeIcon>
            }
          >
            {props.points.map((p) => (
              <List.Item key={p}>{p}</List.Item>
            ))}
          </List>
          <Group mt="md" gap="sm">
            <Button onClick={props.primary.onClick}>{props.primary.label}</Button>
            {props.secondary.href ? (
              <Button component="a" href={props.secondary.href} variant="default">
                {props.secondary.label}
              </Button>
            ) : (
              <Button variant="default" onClick={props.secondary.onClick}>
                {props.secondary.label}
              </Button>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
