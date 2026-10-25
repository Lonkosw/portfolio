// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // evita que o tsconfig.json da raiz do repositório (sem node_modules) seja usado no build
    tsconfig: './tsconfig.json',
  },
});
