import { createTheme } from '@mantine/core';

/**
 * Shared EAI-Doctor theme, matching medplum-provider's look:
 * Mantine default palette (primary = blue) and medplum-provider's font sizes / heading size.
 * The landing page wraps itself in this; other apps can reuse it for a consistent look.
 */
export const eaiTheme = createTheme({
  primaryColor: 'blue',
  headings: {
    sizes: {
      h1: {
        fontSize: '1.125rem',
        fontWeight: '500',
        lineHeight: '2.0',
      },
    },
  },
  fontSizes: {
    xs: '0.6875rem',
    sm: '0.875rem',
    md: '0.875rem',
    lg: '1.0rem',
    xl: '1.125rem',
  },
});
