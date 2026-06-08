import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

function firebaseConfigDevApi(env: Record<string, string>): Plugin {
  return {
    name: 'firebase-config-dev-api',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/firebase-config', (_req, res) => {
        const config = {
          apiKey: env.VITE_FIREBASE_API_KEY || '',
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
          projectId: env.VITE_FIREBASE_PROJECT_ID || '',
          storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: env.VITE_FIREBASE_APP_ID || '',
          measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
          databaseId: env.VITE_FIREBASE_DATABASE_ID || '',
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(config));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), firebaseConfigDevApi(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['.cursorvm.com', '.agentcvm.dev'],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
