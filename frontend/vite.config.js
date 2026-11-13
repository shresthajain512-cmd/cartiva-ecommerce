import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;

  // Enforce required VITE_API_URL for production builds
  if (mode === 'production' && !apiUrl) {
    throw new Error(
      '\n❌ PRODUCTION BUILD CONFIGURATION ERROR:\n' +
      'VITE_API_URL is required for production builds but was not found.\n' +
      'Please specify a valid production API URL.\n' +
      'Example: VITE_API_URL=https://cartiva-backend.onrender.com npm run build\n' +
      'Or define VITE_API_URL in frontend/.env.production.\n'
    );
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true
        }
      }
    }
  };
});
