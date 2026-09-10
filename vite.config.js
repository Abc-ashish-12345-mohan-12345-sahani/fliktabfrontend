import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://flicktap-backend.mohanashish708090.workers.dev',
        changeOrigin: true,
      },
      '/videos': {
        target: 'https://flicktap-backend.mohanashish708090.workers.dev',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://flicktap-backend.mohanashish708090.workers.dev',
        changeOrigin: true,
      },
    },
  },
});
