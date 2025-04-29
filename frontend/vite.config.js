import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    build: {
      outDir: 'dist',   // <-- ADD THIS LINE to explicitly set output directory
      emptyOutDir: true // <-- OPTIONAL: Clean the output directory before building
    }
  };
});
