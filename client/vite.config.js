import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        secure: false,
      },
    },
  },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['mapbox-gl'],
  },
});