// frontend/vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <-- ДОБАВЛЕН ИМПОРТ

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // --- ДОБАВЛЕНА СЕКЦИЯ RESOLVE ---
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- КОНЕЦ ДОБАВЛЕННОЙ СЕКЦИИ ---
});