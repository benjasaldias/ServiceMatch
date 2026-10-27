import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Mismo origen en desarrollo y en producción (en Vercel, rewrite de /api al contenedor),
    // para que la cookie de refresh funcione con SameSite=Lax.
    proxy: { '/api': 'http://localhost:3000' },
  },
});
