import { eaiTheme } from '@eai/ui';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './i18n';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import './index.css';

createRoot(document.getElementById('root') as HTMLDivElement).render(
  <StrictMode>
    <MantineProvider theme={eaiTheme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
