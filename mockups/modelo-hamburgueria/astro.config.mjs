// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Precisa ser absoluto para o og:image funcionar: o WhatsApp não resolve
  // caminho relativo ao montar a prévia do link. TROCAR para a URL real do
  // deploy assim que ele existir — ver DEPLOY.md.
  site: 'https://modelo-hamburgueria.netlify.app',

  // A barrinha do Astro só aparece em dev, mas atrapalha ao mostrar o
  // protótipo para o cliente. Desligada de vez.
  devToolbar: { enabled: false },

  build: {
    // CSS DENTRO DO HTML, e isto é medição.
    //
    // O padrão do Astro ('auto') só embute folhas abaixo de 4 KB; a nossa tem
    // 9,3 KB e saía como <link>, que BLOQUEIA a primeira pintura. Pior que os
    // 220 ms dela: o navegador só descobre as FONTES depois de baixar E
    // interpretar esse arquivo — CSS em 755 ms, fontes em 887 e 961 ms, em
    // série. Embutido, tudo isso é descoberto no primeiro pacote do HTML.
    //
    // A troca é perder o cache da folha entre páginas. Aqui o site TEM UMA
    // PÁGINA SÓ, então não há o que reaproveitar — e no contato frio a
    // visita é quase sempre a primeira, sem cache nenhum.
    //
    // ⚠️ Se um dia este modelo ganhar segunda página, reavaliar: com 3+
    // páginas o <link> cacheado passa a ganhar.
    inlineStylesheets: 'always',
  },

  image: {
    // QUALIDADE DAS FOTOS — o padrão do Astro é 80, e para foto de banco isso
    // é caro demais. Ver o comentário em `src/lib/images.ts`: a compressão
    // fica declarada lá, por tipo de uso, e não espalhada por componente.
    //
    // Aqui fica só o teto de pixels do sharp, para o build não engasgar se
    // alguém jogar um arquivo enorme em `src/assets/images/`.
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { limitInputPixels: 268402689 },
    },
  },

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
