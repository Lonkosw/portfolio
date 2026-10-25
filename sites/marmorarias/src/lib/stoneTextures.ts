/**
 * Texturas de pedra geradas em SVG (feTurbulence). Não dependem de foto, não repetem entre
 * modelos e nunca deixam o catálogo com espaço vazio. Cada pedra tem semente própria.
 */
import type { TexturaReceita } from '../data/marmoraria-config.ts';

const S = 900;

/** Tabela de transferência com um pico estreito (gera linhas finas a partir do ruído). */
function pico(centro: number, largura: number, n = 48): string {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    const v = Math.max(0, 1 - Math.abs(x - centro) / largura);
    out.push(Math.round(v * 100) / 100);
  }
  return out.join(' ');
}

function flood(cor: string) {
  const h = cor.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return { r, g, b };
}

/** Camada de salpicos: ruído de alta frequência limiar -> alpha, pintado com uma cor. */
function camadaSalpico(id: string, cor: string, seed: number, freq: number, corte: number): string {
  const { r, g, b } = flood(cor);
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${r.toFixed(3)}  0 0 0 0 ${g.toFixed(3)}  0 0 0 0 ${b.toFixed(3)}  14 0 0 0 ${(-14 * corte).toFixed(2)}"/>
</filter><rect width="${S}" height="${S}" filter="url(#${id})"/>`;
}

function granito(t: TexturaReceita): string {
  const d = t.densidade ?? 0.5;
  // quanto maior a densidade, menor o corte (mais área coberta)
  const cortes = [0.62 - d * 0.14, 0.6 - d * 0.1, 0.64 - d * 0.12];
  const cores = t.cores.length ? t.cores : ['#888'];
  const camadas = cores
    .slice(0, 3)
    .map((c, i) => camadaSalpico(`g${t.seed}_${i}`, c, t.seed + i * 7, 0.55 + i * 0.22, cortes[i]))
    .join('');
  return `<rect width="${S}" height="${S}" fill="${t.base}"/>${camadas}`;
}

function veio(t: TexturaReceita): string {
  const f = t.freq ?? 0.005;
  const d = t.densidade ?? 0.5;
  const largura = 0.02 + d * 0.035;
  const grosso = t.cores[0];
  const secundario = t.cores[1];
  const fino = t.veioFino ?? '#bbb';
  const c1 = flood(grosso);
  const c2 = flood(secundario ?? grosso);
  const c3 = flood(fino);
  // nuvem suave de fundo (variação tonal)
  const nuvem = `<filter id="n${t.seed}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${f * 0.8}" numOctaves="3" seed="${t.seed + 3}"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${c3.r.toFixed(3)}  0 0 0 0 ${c3.g.toFixed(3)}  0 0 0 0 ${c3.b.toFixed(3)}  0 1.6 0 0 -0.55"/></filter>
<rect width="${S}" height="${S}" filter="url(#n${t.seed})" opacity="0.5"/>`;
  const linha = (id: string, c: { r: number; g: number; b: number }, seed: number, freq: number, larg: number, op: number) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${(freq * 0.55).toFixed(5)} ${(freq * 1.5).toFixed(5)}" numOctaves="5" seed="${seed}"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${c.r.toFixed(3)}  0 0 0 0 ${c.g.toFixed(3)}  0 0 0 0 ${c.b.toFixed(3)}  1 0 0 0 0"/>
<feComponentTransfer><feFuncA type="table" tableValues="${pico(0.5, larg)}"/></feComponentTransfer>
</filter><g transform="rotate(-32 ${S / 2} ${S / 2})" opacity="${op}"><rect x="-300" y="-300" width="${S + 600}" height="${S + 600}" filter="url(#${id})"/></g>`;
  return `<rect width="${S}" height="${S}" fill="${t.base}"/>${nuvem}
${linha(`vf${t.seed}`, c3, t.seed + 11, f * 2.4, largura * 0.9, 0.75)}
${linha(`vg${t.seed}`, c1, t.seed, f, largura, 0.95)}
${secundario ? linha(`vs${t.seed}`, c2, t.seed + 29, f * 1.3, largura * 0.55, 0.8) : ''}`;
}

function travertino(t: TexturaReceita): string {
  const claro = flood(t.cores[1] ?? '#eee');
  const escuro = flood(t.cores[0] ?? '#a98');
  return `<rect width="${S}" height="${S}" fill="${t.base}"/>
<filter id="tb${t.seed}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.003 0.022" numOctaves="4" seed="${t.seed}"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${escuro.r.toFixed(3)}  0 0 0 0 ${escuro.g.toFixed(3)}  0 0 0 0 ${escuro.b.toFixed(3)}  0 3 0 0 -1.35"/></filter>
<rect width="${S}" height="${S}" filter="url(#tb${t.seed})"/>
<filter id="tc${t.seed}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.005 0.04" numOctaves="3" seed="${t.seed + 5}"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${claro.r.toFixed(3)}  0 0 0 0 ${claro.g.toFixed(3)}  0 0 0 0 ${claro.b.toFixed(3)}  0 3 0 0 -1.4"/></filter>
<rect width="${S}" height="${S}" filter="url(#tc${t.seed})" opacity="0.8"/>
<filter id="tp${t.seed}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.05 0.22" numOctaves="2" seed="${t.seed + 9}"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.24  16 0 0 0 -10.9"/></filter>
<rect width="${S}" height="${S}" filter="url(#tp${t.seed})" opacity="0.55"/>`;
}

export function stoneSvg(t: TexturaReceita): string {
  const corpo = t.tipo === 'granito' ? granito(t) : t.tipo === 'veio' ? veio(t) : t.tipo === 'travertino' ? travertino(t) : `<rect width="${S}" height="${S}" fill="${t.base}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" preserveAspectRatio="xMidYMid slice">${corpo}</svg>`;
}

export function stoneDataUri(t: TexturaReceita): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(stoneSvg(t))}`;
}
