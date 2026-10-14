import { Badge, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import type { JSX, ReactNode } from 'react';

export interface ModuleCardProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}

/** Mantine version of the old Tailwind FeatureCard. */
export function ModuleCard({ icon, title, description, badge, disabled, onClick }: ModuleCardProps): JSX.Element {
  return (
    <Card
      padding="xl"
      radius="md"
      withBorder
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        height: '100%',
      }}
      className="eai-module-card"
      role="button"
      aria-disabled={disabled}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <ThemeIcon size={48} radius="md" variant="light">
            {icon}
          </ThemeIcon>
          {badge && (
            <Badge variant="light" color={disabled ? 'gray' : 'blue'} size="sm">
              {badge}
            </Badge>
          )}
        </Group>
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Card>
  );
}
