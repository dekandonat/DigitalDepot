import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendProxy = {
  target: 'http://localhost:3000',
  changeOrigin: true,
  bypass: (req) => {
    if (req.headers.accept?.includes('text/html')) {
      return '/index.html';
    }
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cart': backendProxy,
      '/products': backendProxy,
      '/category': backendProxy,
      '/user': backendProxy,
      '/adminRoute': backendProxy,
      '/uploads': backendProxy,
      '/reviews': backendProxy,
      '/order': backendProxy,
      '/used-products': backendProxy,
      '/news': backendProxy,
      '/coupon': backendProxy,
    },
  },
});
