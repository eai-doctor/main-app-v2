import { Box, Container, Group, UnstyledButton } from '@mantine/core';
import type { JSX, ReactNode } from 'react';
import { EaiLogo } from './EaiLogo';

export interface AppHeaderProps {
  readonly onLogoClick?: () => void;
  /** Right-hand side content: nav buttons, language switcher, sign-in / profile menu. */
  readonly right?: ReactNode;
}

/** Top header used by the landing page. */
export function AppHeader({ onLogoClick, right }: AppHeaderProps): JSX.Element {
  return (
    <Box component="header" bg="white" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
      <Container size="lg" h={72}>
        <Group h="100%" justify="space-between" wrap="nowrap">
          <UnstyledButton onClick={onLogoClick} aria-label="Home">
            <EaiLogo />
          </UnstyledButton>
          <Group gap="sm" wrap="nowrap">
            {right}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
