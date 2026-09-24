import type { ImageMetadata } from 'astro';

/**
 * Mapa nome-do-arquivo → metadados da imagem, para que os arquivos de
 * conteúdo referenciem fotos por string e ainda assim passem pelo
 * otimizador do Astro (webp + width/height, sem layout shift).
 */
const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/fotos/*.{jpg,jpeg,png}',
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

/**
 * Larguras de `srcset` que a foto REALMENTE consegue entregar.
 *
 * ⚠️ Existe porque o acervo é recorte de post do Instagram: os arquivos têm
 * de 572 a 1355px de largura. O Astro **não faz upscale** — pedir 1080px de
 * uma foto de 600 devolve um arquivo de 600px, calado, enquanto o `srcset`
 * anuncia 1080w. O navegador acredita no anúncio, escolhe esse arquivo para
 * uma tela grande e mostra foto borrada achando que acertou.
 *
 * Cada componente pede o que gostaria; isto corta o que não existe e garante
 * que a maior largura oferecida seja a real. Quando a barbearia mandar os
 * originais, os componentes não mudam: a lista cresce sozinha.
 */
export function larguras(foto: ImageMetadata, desejadas: number[]): number[] {
  const cabem = desejadas.filter((w) => w < foto.width);
  return [...cabem, foto.width];
}

export function img(nome: string): ImageMetadata {
  const found = imagens[nome];
  if (!found) {
    throw new Error(
      `Imagem "${nome}" não encontrada em src/assets/fotos/. Disponíveis: ${
        Object.keys(imagens).sort().join(', ') || '(nenhuma)'
      }`,
    );
  }
  return found;
}
