import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  server: {
    host: '127.0.0.1',
  }
});
