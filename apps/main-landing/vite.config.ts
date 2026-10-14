import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

if (!existsSync(path.join(import.meta.dirname, '.env'))) {
  copyFileSync(path.join(import.meta.dirname, '.env.defaults'), path.join(import.meta.dirname, '.env'));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'EAI_');
  // Same auth-service the other apps use in dev (main-clinic / main-patient src/config.js → http://localhost:7860).
  const authTarget = env.EAI_AUTH_PROXY_TARGET || 'http://localhost:7860';

  return {
    envPrefix: ['EAI_'],
    plugins: [react()],
    resolve: {
      // Monorepo: the old apps pin react-router v7 at the root. Always use this app's own copies.
      dedupe: ['react', 'react-dom', 'react-router', '@mantine/core', '@mantine/hooks'],
    },
    server: {
      host: 'localhost',
      port: 5180,
      proxy: {
        '/api/auth': {
          target: authTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/auth/, ''),
          // Make the refresh cookie a plain "localhost, path /" cookie. Cookies ignore the port, so
          // main-clinic (5170) and main-patient (5171) see the same session when they call the auth-service.
          cookieDomainRewrite: '',
          cookiePathRewrite: { '*': '/' },
        },
      },
    },
    preview: { host: 'localhost', port: 5180 },
  };
});
