import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const virtualPwaPlugin: Plugin = {
  name: 'virtual-pwa-register',
  resolveId(id) {
    if (id === 'virtual:pwa-register') {
      return '\0' + id;
    }
  },
  load(id) {
    if (id === '\0virtual:pwa-register') {
      return `export function registerSW() { return () => Promise.resolve(); }`;
    }
  },
};

export default defineConfig(() => {
  const rootDir = import.meta.dirname || path.resolve();
  return {
    plugins: [react(), virtualPwaPlugin],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    optimizeDeps: {
      include: ['recharts', 'react-is'],
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
