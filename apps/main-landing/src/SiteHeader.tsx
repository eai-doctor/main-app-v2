import { AppHeader } from '@eai/ui';
import { Avatar, Button, Group, Menu, Skeleton, Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconChevronDown, IconLayoutDashboard, IconLogout, IconStethoscope, IconWorld } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from './auth/AuthProvider';
import { clinicJoinUrl, portalHomeUrl, portalKey } from './features';
import { currentLanguage, LANGUAGES } from './i18n';

function initials(name: string | undefined, email: string): string {
  const source = name?.trim() || email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** EN / 中文 / Français, same three languages as the portals' LanguageSwitcher. */
function LanguageSwitcher(): JSX.Element {
  const { t, i18n } = useTranslation();
  const current = currentLanguage();
  return (
    <Menu position="bottom-end" withinPortal width={160}>
      <Menu.Target>
        <Button
          variant="default"
          leftSection={<IconWorld size={16} />}
          rightSection={<IconChevronDown size={14} />}
          aria-label={t('header.language')}
          px="sm"
        >
          {LANGUAGES.find((l) => l.code === current)?.short}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {/* Monospace code + name like the portals' switcher; current language bold with a check mark. */}
        {LANGUAGES.map((l) => {
          const active = l.code === current;
          return (
            <Menu.Item
              key={l.code}
              onClick={() => {
                i18n.changeLanguage(l.code).catch(console.error);
              }}
              rightSection={active ? <IconCheck size={14} /> : null}
              fw={active ? 600 : undefined}
            >
              <Text span ff="monospace" mr={8} inherit>
                {l.short}
              </Text>
              {l.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}

export function SiteHeader(): JSX.Element {
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppHeader
      onLogoClick={() => navigate('/')}
      right={
        loading ? (
          <Skeleton h={36} w={220} radius="md" />
        ) : user ? (
          <Group gap="sm" wrap="nowrap">
            <Button
              component="a"
              href={portalHomeUrl(user)}
              variant="default"
              visibleFrom="sm"
              leftSection={<IconLayoutDashboard size={16} />}
            >
              {t(`portalTitles.${portalKey(user)}`)}
            </Button>
            <LanguageSwitcher />
            <Menu position="bottom-end" withinPortal width={240}>
              <Menu.Target>
                <UnstyledButton aria-label={t('header.accountMenu')}>
                  <Group gap={6} wrap="nowrap">
                    <Avatar size={34} radius="xl" color="blue">
                      {initials(user.name, user.email)}
                    </Avatar>
                    <IconChevronDown size={14} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  <Text size="sm" fw={600} c="dark" truncate>
                    {user.name || user.email}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user.email} · {t(`roles.${user.role}`)}
                  </Text>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLayoutDashboard size={14} />} component="a" href={portalHomeUrl(user)}>
                  {t('header.open', { portal: t(`portals.${portalKey(user)}`) })}
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={() => {
                    signOut()
                      .catch(console.error)
                      .finally(() => navigate('/'));
                  }}
                >
                  {t('header.signOut')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ) : (
          <Group gap="sm" wrap="nowrap">
            <Button
              component="a"
              href={clinicJoinUrl()}
              variant="default"
              visibleFrom="md"
              leftSection={<IconStethoscope size={16} />}
            >
              {t('header.forClinics')}
            </Button>
            <LanguageSwitcher />
            <Button variant="default" onClick={() => navigate('/signin')}>
              {t('header.signIn')}
            </Button>
            <Button onClick={() => navigate('/register')} visibleFrom="sm">
              {t('header.createAccount')}
            </Button>
          </Group>
        )
      }
    />
  );
}
