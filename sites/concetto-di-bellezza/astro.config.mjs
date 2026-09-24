// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Precisa ser absoluto para o og:image funcionar: o WhatsApp não resolve
  // caminho relativo ao montar a prévia do link. TROCAR se a URL do deploy
  // for outra — ver DEPLOY.md.
  site: 'https://concetto-demo.netlify.app',

  // A barrinha do Astro só aparece em dev, mas atrapalha ao mostrar o
  // protótipo para o cliente. Desligada de vez.
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],

    // O Vite recusa requisição cujo Host ele não conhece (defesa contra
    // DNS rebinding) e devolve 403. Sem isto, túnel do Cloudflare para
    // conferir no celular não funciona. Vale só em desenvolvimento.
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
  }
});
