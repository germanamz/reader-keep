import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import tailwindcss from '@tailwindcss/vite'



export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    webExtension(),
  ],
});
