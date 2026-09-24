import type { ImageMetadata } from 'astro';

/**
 * Mapa nome-do-arquivo → metadados da imagem, para que os arquivos de conteúdo
 * possam referenciar fotos por string e ainda assim passar pelo otimizador do
 * Astro (webp + width/height, sem layout shift).
 *
 * O `site.ts` guarda só o nome, sem extensão e sem caminho: trocar uma foto é
 * substituir o arquivo na pasta, sem tocar em nada mais.
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

/**
 * Larguras de `srcset` que a foto REALMENTE consegue entregar.
 *
 * ⚠️ Existe porque o acervo deste site é recorte de post do Instagram: os
 * arquivos têm de 458 a 1080px de largura. O Astro **não faz upscale** — pedir
 * 1600px de uma foto de 500 devolve um arquivo de 500px, calado, enquanto o
 * `srcset` anuncia 1600w. O navegador acredita no anúncio, escolhe esse
 * arquivo para uma tela grande e mostra uma foto borrada achando que está
 * fazendo a coisa certa.
 *
 * Então cada componente pede o que gostaria, e isto corta o que não existe e
 * garante que a maior largura oferecida seja a largura real do arquivo.
 * Quando chegarem os originais em alta, os componentes não mudam: a lista
 * cresce sozinha.
 */
export function larguras(foto: ImageMetadata, desejadas: number[]): number[] {
  const cabem = desejadas.filter((w) => w < foto.width);
  return [...cabem, foto.width];
}

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
