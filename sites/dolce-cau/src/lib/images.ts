import type { ImageMetadata } from 'astro';

/**
 * Mapas nome-do-arquivo → metadados da imagem, para que os arquivos de conteúdo
 * possam referenciar fotos por string e ainda assim passar pelo otimizador do
 * Astro (webp + width/height, sem layout shift).
 */
const arquivos = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.jpg', {
  eager: true,
});

const arquivosDoces = import.meta.glob<{ default: ImageMetadata }>('../assets/doces/*.jpg', {
  eager: true,
});

function mapear(mods: Record<string, { default: ImageMetadata }>) {
  const out: Record<string, ImageMetadata> = {};
  for (const caminho in mods) {
    const nome = caminho.split('/').pop()!.replace('.jpg', '');
    out[nome] = mods[caminho].default;
  }
  return out;
}

export const imagens = mapear(arquivos);
export const imagensDoces = mapear(arquivosDoces);

export function img(nome: string): ImageMetadata {
  const found = imagens[nome];
  if (!found) {
    throw new Error(
      `Imagem "${nome}" não encontrada em src/assets/images/. Disponíveis: ${Object.keys(imagens).join(', ')}`,
    );
  }
  return found;
}

/** Foto de um doce do cardápio, pelo slug. */
export function imgDoce(slug: string): ImageMetadata {
  const found = imagensDoces[slug];
  if (!found) {
    throw new Error(
      `Foto do doce "${slug}" não encontrada em src/assets/doces/. Disponíveis: ${Object.keys(imagensDoces).join(', ')}`,
    );
  }
  return found;
}
