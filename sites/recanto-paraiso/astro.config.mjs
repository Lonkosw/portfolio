// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Precisa ser absoluto para o og:image funcionar: o WhatsApp não resolve
  // caminho relativo ao montar a prévia do link. TROCAR se a URL do deploy
  // for outra — ver DEPLOY.md.
  site: 'https://recantoparaiso-demo.netlify.app',

  // A barrinha flutuante do Astro só aparece em desenvolvimento, mas atrapalha
  // na hora de mostrar o protótipo para o cliente. Desligada de vez.
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()]
  }
});
