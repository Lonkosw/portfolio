import type { ImageMetadata } from 'astro';

/**
 * Mapa nome-do-arquivo → metadados da imagem, para que os arquivos de conteúdo
 * referenciem fotos por string e ainda assim passem pelo otimizador do Astro
 * (webp + width/height, sem layout shift).
 */
const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/*.{jpg,jpeg,png}',
  { eager: true },
);

function mapear(mods: Record<string, { default: ImageMetadata }>) {
  const out: Record<string, ImageMetadata> = {};
  for (const caminho in mods) {
    const nome = caminho
      .split('/')
      .pop()!
      .replace(/\.(jpe?g|png)$/i, '');
    out[nome] = mods[caminho].default;
  }
  return out;
}

export const imagens = mapear(arquivos);

export function img(nome: string): ImageMetadata {
  const found = imagens[nome];
  if (!found) {
    throw new Error(
      `Imagem "${nome}" não encontrada em src/assets/images/. Disponíveis: ${
        Object.keys(imagens).sort().join(', ') || '(nenhuma)'
      }`,
    );
  }
  return found;
}

/* ══════════════════════════════════════════════════════════════════════
   COMPRESSÃO E ESCADA DE LARGURAS

   As duas coisas ficam aqui, e não espalhadas por componente, porque as
   duas são a MESMA decisão tomada uma vez: quanto de foto vale a pena
   baixar. Ao mexer em uma, olhar a outra.

   ── Qualidade ────────────────────────────────────────────────────────
   O padrão do Astro é 80. Medido nas fotos deste acervo (ver o RMSE contra
   o original sem perda, degrau a degrau), a curva de tamanho ACHATA por
   volta de 68 enquanto o erro mal se move:

     hero-ondas-luz 900w   q80: 103 KB (RMSE 3,63)   q72: 78 KB (4,27)
                           q68:  75 KB (4,40)        q62: 67 KB (4,66)

   Ou seja: de 80 para 72 são 25 KB numa foto só, por um erro que continua
   abaixo do limiar em que o olho separa as duas lado a lado. De 72 para
   baixo o desconto encolhe e o risco de banding em degradê de loiro sobe —
   e metade deste acervo é exatamente isso.

   ⚠️ NÃO baixar o hero abaixo de 72: é o elemento de LCP e a foto que a
   pessoa fica olhando enquanto lê o título.

   ── Larguras ─────────────────────────────────────────────────────────
   ⚠️ TODO ARQUIVO FONTE TEM NO MÁXIMO 1000px DE LARGURA (teto herdado da
   decisão de peso — foto de banco comprime muito pior que print). Pedir
   `widths={[640, 1024, 1600]}` não gera 1024 nem 1600: o Astro descarta o
   que passa do original e sobra um srcset de DOIS degraus, 640 e 1000.
   Foi assim que uma foto exibida a 723px baixava a de 1000px — 44 KB
   jogados fora numa imagem só.

   As escadas abaixo têm degraus de ~25%, todos dentro do teto de 1000.
   ══════════════════════════════════════════════════════════════════════ */

/** Hero: elemento de LCP. A única que não desce de 72. */
export const Q_HERO = 72;
/** Fotos de conteúdo — as que a pessoa para para olhar. */
export const Q_FOTO = 68;
/** Miniaturas de grade e carrossel: nunca passam de meia tela. */
export const Q_MINI = 62;

/** Foto grande: hero, destaque de seção, o que ocupa metade da tela ou mais. */
export const W_GRANDE = [420, 560, 720, 860, 1000];
/** Foto média: coluna de duas, cartão largo. */
export const W_MEDIA = [360, 480, 640, 820, 1000];
/** Miniatura: grade de três, item de carrossel. */
export const W_MINI = [280, 380, 500, 640];
