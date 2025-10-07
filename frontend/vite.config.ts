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
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  },
  build: {
    // Production optimizations
    minify: 'esbuild',
    target: 'es2020',
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@heroicons/react'],
          utils: ['zustand', 'axios'],
        },
        // Clean asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? [];
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      
      // Tree shaking optimization
      treeshake: {
        preset: 'recommended',
      },
    },
    
    // Security: Remove source maps in production
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Performance monitoring
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  
  // Environment variables validation
  envPrefix: ['VITE_'],
  // PWA and SEO optimizations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
