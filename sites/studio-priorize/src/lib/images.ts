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
