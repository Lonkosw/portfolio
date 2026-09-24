// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Precisa ser absoluto para o og:image funcionar: o WhatsApp não resolve
  // caminho relativo ao montar a prévia do link, e é por WhatsApp que este
  // site vai ser mostrado. TROCAR pela URL real do deploy — ver DEPLOY.md.
  site: 'https://demo-ana-bistro.vercel.app',

  // A barrinha do Astro só aparece em dev, mas atrapalha ao mostrar o
  // protótipo para o cliente. Desligada de vez.
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },
});
