import type { ImageMetadata } from 'astro';

/**
 * Mapa nome-do-arquivo → metadados da imagem, para que os arquivos de
 * conteúdo referenciem fotos por string e ainda assim passem pelo
 * otimizador do Astro (webp + width/height, sem layout shift).
 */
const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/*.{jpg,jpeg,png}',
  { eager: true },
);

const mapa: Record<string, ImageMetadata> = {};
for (const caminho in arquivos) {
  const nome = caminho
    .split('/')
    .pop()!
    .replace(/\.(jpe?g|png)$/i, '');
  mapa[nome] = arquivos[caminho].default;
}

export const imagens = mapa;

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
