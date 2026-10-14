import { Group, Image, Text } from '@mantine/core';
import type { JSX } from 'react';

export interface EaiLogoProps {
  /** Path to the logo image served by the host app (each app puts logo.png in its /public). */
  readonly src?: string;
  readonly height?: number;
  readonly withText?: boolean;
}

export function EaiLogo({ src = '/logo.png', height = 28, withText = true }: EaiLogoProps): JSX.Element {
  return (
    <Group gap="sm" wrap="nowrap">
      <Image src={src} h={height} w="auto" alt="EAI-Doctor" />
      {withText && (
        <Text fw={700} size="lg" c="dark.8" visibleFrom="xs">
          EAI-DOCTOR
        </Text>
      )}
    </Group>
  );
}
