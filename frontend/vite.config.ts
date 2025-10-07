import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    // SEO optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@heroicons/react'],
        },
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
  },
  // PWA and SEO optimizations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
