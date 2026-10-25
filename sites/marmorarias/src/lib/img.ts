import dims from '../data/images-dim.json';

type Dims = Record<string, Record<string, { w: number; h: number }>>;
const D = dims as Dims;

export interface ImgAttrs {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

/** Atributos de imagem responsiva (640/1280/1920 w) para uma foto de public/img/<modelo>/. */
export function imgAttrs(modelo: string, nome: string): ImgAttrs {
  const d = D[modelo]?.[nome];
  if (!d) throw new Error(`Imagem não encontrada: ${modelo}/${nome}`);
  const base = `/img/${modelo}/${nome}`;
  return {
    src: `${base}-1280.webp`,
    srcset: `${base}-640.webp 640w, ${base}-1280.webp 1280w, ${base}-1920.webp 1920w`,
    width: d.w,
    height: d.h,
  };
}
