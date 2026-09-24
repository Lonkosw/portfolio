// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Precisa ser absoluto para o og:image funcionar: o WhatsApp não resolve
  // caminho relativo ao montar a prévia do link.
  //
  // Publicado na Netlify em 05/08/2026, porque o login do Cloudflare exige
  // navegador na mesma máquina e o Théo estava no celular. Ao migrar para o
  // Cloudflare Pages, isto vira
  // `https://demo-stilo-cabeleireiro.pages.dev` — e o build TEM de ser
  // refeito, senão a prévia do WhatsApp aponta para o endereço antigo.
  site: 'https://demo-stilo-cabeleireiro.netlify.app',

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
