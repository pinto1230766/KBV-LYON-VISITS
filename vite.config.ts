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
    base: './',
    plugins: [react(), virtualPwaPlugin],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    optimizeDeps: {
      include: ['recharts', 'react-is'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
                return 'vendor-charts';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react-router-dom') || id.includes('@remix-run')) {
                return 'vendor-router';
              }
              if (id.includes('@radix-ui') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
                return 'vendor-ui';
              }
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
