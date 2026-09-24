/**
 * Abertura cinematográfica em canvas, controlada pela rolagem.
 *
 * Duas fontes possíveis para os quadros:
 *
 * 1. **Sequência de quadros** — se existir `/hero-frames/manifest.json`, os
 *    quadros reais (renderizados a partir do vídeo) são pré-carregados e
 *    desenhados conforme o progresso. É o caminho de produção.
 * 2. **Render procedural** — o fallback embutido, desenhado no próprio canvas.
 *    Não depende de nenhum arquivo externo, então a abertura funciona hoje.
 *
 * A troca é automática: basta soltar os quadros em `public/hero-frames/` e o
 * modo 1 assume, sem mexer em código.
 *
 * Coreografia (progresso 0 → 1):
 *   0.00–0.28  o bombom gira lentamente
 *   0.28–0.62  vista explodida: a casca abre em gomos, a camada crocante se
 *              separa, o recheio fica suspenso no centro
 *   0.62–0.85  a casca se reabre como diafragma
 *   0.85–1.00  a câmera atravessa o centro e o quadro escurece
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** easeOutExpo — mesma sensação das outras animações do site. */
const easeOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
/** easeInOutCubic, para o giro não começar nem terminar seco. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const PALETA = {
  noir: '#141010',
  gold: '#c89457',
  goldHi: '#dcb079',
  cream: '#f5efe7',
};

const GOMOS = 8;

interface Particula {
  ang: number;
  raio: number;
  tam: number;
  camada: number;
  brilho: number;
}

/** Partículas de cacau: posições estáveis, sorteadas uma única vez. */
function criarParticulas(qtd: number): Particula[] {
  const out: Particula[] = [];
  for (let i = 0; i < qtd; i++) {
    out.push({
      ang: Math.random() * Math.PI * 2,
      raio: 0.55 + Math.random() * 1.5,
      tam: 0.4 + Math.random() * 1.4,
      camada: i % 3,
      brilho: 0.25 + Math.random() * 0.6,
    });
  }
  return out;
}

/** Textura de grão, gerada uma vez e reaplicada — evita o "vazio digital". */
function criarGrao(): HTMLCanvasElement {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 128;
  const c = tile.getContext('2d')!;
  const img = c.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 46;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return tile;
}

export interface CinemaOpts {
  /** Quantas alturas de tela a abertura consome em rolagem. */
  distancia?: number;
}

export async function setupCinema({ distancia = 3.2 }: CinemaOpts = {}) {
  const secao = document.querySelector<HTMLElement>('[data-cinema]');
  const palco = document.querySelector<HTMLElement>('[data-cinema-stage]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-cinema-canvas]');
  const cue = document.querySelector<HTMLElement>('[data-cinema-cue]');
  if (!secao || !palco || !canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // A partir daqui a abertura vai rodar: pode aparecer.
  palco.hidden = false;

  const particulas = criarParticulas(90);
  const grao = criarGrao();
  // Pattern criado uma vez só — recriar a cada quadro alocaria lixo por frame.
  const padraoGrao = ctx.createPattern(grao, 'repeat');

  let w = 0;
  let h = 0;
  let progresso = 0;

  /** Quadros reais, se existirem. */
  let quadros: HTMLImageElement[] = [];

  function dimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    const rect = palco!.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas!.width = Math.round(w * dpr);
    canvas!.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ── Modo 1: sequência de quadros ────────────────────────────────────────
  try {
    const res = await fetch('/hero-frames/manifest.json', { cache: 'force-cache' });
    if (res.ok) {
      const manifest: { frames: string[] } = await res.json();
      if (Array.isArray(manifest.frames) && manifest.frames.length > 1) {
        quadros = await Promise.all(
          manifest.frames.map(
            (src) =>
              new Promise<HTMLImageElement>((resolve, reject) => {
                const im = new Image();
                im.onload = () => resolve(im);
                im.onerror = reject;
                im.src = src;
              }),
          ),
        );
      }
    }
  } catch {
    // Sem manifesto (o caso normal hoje): segue no render procedural.
  }

  function desenharQuadros(p: number) {
    const i = Math.min(quadros.length - 1, Math.round(p * (quadros.length - 1)));
    const im = quadros[i];
    if (!im) return;
    // cover: preenche o palco sem distorcer
    const escala = Math.max(w / im.width, h / im.height);
    const dw = im.width * escala;
    const dh = im.height * escala;
    ctx!.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  // ── Modo 2: render procedural ───────────────────────────────────────────

  /**
   * Um gomo da casca de chocolate.
   *
   * `rInt` é o segredo da leitura: fechado (rInt≈0) cada gomo é uma fatia
   * maciça e os oito juntos formam uma esfera sólida — o recheio fica
   * escondido atrás, como num bombom de verdade. Conforme abre, rInt cresce
   * e a fatia vira casca fina, revelando o interior.
   */
  function gomo(
    cx: number,
    cy: number,
    R: number,
    rInt: number,
    a0: number,
    a1: number,
    luz: number,
    alpha: number,
  ) {
    ctx!.save();
    ctx!.globalAlpha = alpha;

    ctx!.beginPath();
    ctx!.arc(cx, cy, R, a0, a1);
    if (rInt > R * 0.02) ctx!.arc(cx, cy, rInt, a1, a0, true);
    else ctx!.lineTo(cx, cy);
    ctx!.closePath();

    // Gradiente na direção da luz-chave (canto superior esquerdo)
    const g = ctx!.createLinearGradient(cx - R * 0.7, cy - R * 0.8, cx + R * 0.6, cy + R * 0.9);
    g.addColorStop(0, '#5a3623');
    g.addColorStop(0.35, '#33200f');
    g.addColorStop(0.75, '#1c1109');
    g.addColorStop(1, '#0d0806');
    ctx!.fillStyle = g;
    ctx!.fill();

    // Luz de contorno âmbar: só na borda externa e mais forte no lado oposto
    // à luz-chave — é o que dá volume e separa o doce do fundo preto.
    ctx!.beginPath();
    ctx!.arc(cx, cy, R * 0.985, a0, a1);
    ctx!.strokeStyle = `rgba(200,148,87,${(0.12 + luz * 0.68) * alpha})`;
    ctx!.lineWidth = Math.max(1, R * 0.022);
    ctx!.stroke();

    // Sulco entre os gomos, visível só quando começam a separar
    ctx!.beginPath();
    ctx!.moveTo(cx + Math.cos(a0) * rInt, cy + Math.sin(a0) * rInt);
    ctx!.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
    ctx!.strokeStyle = `rgba(0,0,0,${0.5 * alpha})`;
    ctx!.lineWidth = Math.max(1, R * 0.012);
    ctx!.stroke();

    ctx!.restore();
  }

  /** Brilho especular da esfera fechada: elipse suave que gira com o doce. */
  function especular(cx: number, cy: number, R: number, ang: number, alpha: number) {
    if (alpha <= 0.01) return;
    const hx = cx + Math.cos(ang) * R * 0.34;
    const hy = cy + Math.sin(ang) * R * 0.34;
    const g = ctx!.createRadialGradient(hx, hy, 0, hx, hy, R * 0.42);
    g.addColorStop(0, `rgba(226,190,142,${0.55 * alpha})`);
    g.addColorStop(0.5, `rgba(190,140,92,${0.16 * alpha})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx!.save();
    ctx!.beginPath();
    ctx!.arc(cx, cy, R, 0, Math.PI * 2);
    ctx!.clip();
    ctx!.fillStyle = g;
    ctx!.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx!.restore();
  }

  function desenharProcedural(p: number) {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.19;

    const pGiro = clamp01(p / 0.28);
    const pExp = clamp01((p - 0.28) / 0.34);
    const pIris = clamp01((p - 0.62) / 0.23);
    const pThru = clamp01((p - 0.85) / 0.15);

    const eExp = easeOut(pExp);
    const eIris = easeOut(pIris);
    const eThru = easeInOut(pThru);

    // Câmera: a passagem pelo diafragma é um zoom forte com fade
    const zoom = 1 + eThru * 3.4;
    const opacidade = 1 - eThru * 0.96;

    ctx!.save();
    ctx!.globalAlpha = opacidade;
    ctx!.translate(cx, cy);
    ctx!.scale(zoom, zoom);
    ctx!.translate(-cx, -cy);

    // Halo quente bem discreto: sugere o estúdio escuro sem virar um "sol".
    const halo = ctx!.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 3.4);
    halo.addColorStop(0, `rgba(122,74,43,${0.1 + eExp * 0.06})`);
    halo.addColorStop(1, 'rgba(20,16,16,0)');
    ctx!.fillStyle = halo;
    ctx!.fillRect(0, 0, w, h);

    const giro = easeInOut(pGiro) * Math.PI * 0.85 + eExp * 0.3 + eIris * 0.55;

    // ── Partículas de cacau, organizadas em camadas alinhadas ──────────
    for (const pt of particulas) {
      const alvo = 1.25 + pt.camada * 0.42; // as três camadas do "exploded view"
      const raio = R * (pt.raio + (alvo - pt.raio) * eExp + eIris * 0.55 + eThru * 2.2);
      const ang = pt.ang + giro * 0.35;
      const x = cx + Math.cos(ang) * raio;
      const y = cy + Math.sin(ang) * raio * 0.82;
      const a = pt.brilho * (0.25 + eExp * 0.75) * (1 - eThru);
      ctx!.beginPath();
      ctx!.arc(x, y, pt.tam * (R * 0.016), 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(200,148,87,${a})`;
      ctx!.fill();
    }

    // ── Camada crocante: anel de flocos que se separa ───────────────────
    const raioCroc = R * (0.72 + eExp * 0.62 + eIris * 0.5);
    const flocos = 54;
    for (let i = 0; i < flocos; i++) {
      const a = (i / flocos) * Math.PI * 2 + giro * 0.6;
      const jitter = ((i * 37) % 11) / 11;
      const rr = raioCroc + (jitter - 0.5) * R * 0.1;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      ctx!.beginPath();
      ctx!.arc(x, y, R * (0.022 + jitter * 0.018), 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(150,98,58,${(0.5 + jitter * 0.5) * (1 - eThru)})`;
      ctx!.fill();
    }

    // ── Recheio cremoso: corte transversal, não uma bola de luz ─────────
    // Fica atrás da casca; enquanto ela está fechada, não aparece.
    // Na travessia o recheio cresce e some: é por dentro dele que a câmera
    // passa. O fade é mais rápido que o crescimento (expoente > 1) — senão
    // ele vira uma parede bege cobrindo a tela em vez de ser atravessado.
    const rCore = R * (0.62 + eExp * 0.04) * (1 + eThru * 1.4);
    ctx!.save();
    ctx!.globalAlpha = opacidade * Math.pow(1 - eThru, 2.2);
    const gc = ctx!.createRadialGradient(
      cx - rCore * 0.32,
      cy - rCore * 0.38,
      rCore * 0.08,
      cx,
      cy,
      rCore,
    );
    gc.addColorStop(0, '#f0dcc0');
    gc.addColorStop(0.5, '#d7ab77');
    gc.addColorStop(0.86, '#a06f3e');
    gc.addColorStop(1, '#5d3a1e');
    ctx!.beginPath();
    ctx!.arc(cx, cy, rCore, 0, Math.PI * 2);
    ctx!.fillStyle = gc;
    ctx!.fill();

    // Borda do recheio — a "parede" do corte
    ctx!.beginPath();
    ctx!.arc(cx, cy, rCore, 0, Math.PI * 2);
    ctx!.strokeStyle = 'rgba(60,34,17,0.85)';
    ctx!.lineWidth = Math.max(1, R * 0.03);
    ctx!.stroke();
    ctx!.restore();

    // ── Casca: gomos simétricos que abrem e viram diafragma ─────────────
    const desloc = R * (eExp * 1.15 + eIris * 1.75);
    const abertura = eIris * 0.42; // rotação tangencial das "pás" do diafragma
    // Fechado: fatia maciça (rInt≈0). Aberto: casca fina.
    const rInterno = R * (0.02 + eExp * 0.7);
    const alphaCasca = 1 - eThru * 0.9;

    for (let i = 0; i < GOMOS; i++) {
      const passo = (Math.PI * 2) / GOMOS;
      const base = i * passo + giro;
      // Sem folga no início: os oito gomos fecham a esfera sem costura.
      const folga = passo * eExp * 0.09;
      const a0 = base + folga + abertura;
      const a1 = base + passo - folga + abertura;
      const meio = (a0 + a1) / 2;

      const ox = cx + Math.cos(meio) * desloc;
      const oy = cy + Math.sin(meio) * desloc;

      // A luz varia com a posição angular: é o que dá a leitura de rotação.
      const luz = 0.5 + 0.5 * Math.cos(meio - Math.PI * 0.75);
      // Desenhado a partir do centro já deslocado — o gomo inteiro se afasta
      // radialmente, sem deformar.
      gomo(ox, oy, R, rInterno, a0, a1, luz, alphaCasca);
    }

    // Especular só enquanto a esfera ainda está fechada
    especular(cx, cy, R, giro - Math.PI * 0.75, (1 - eExp) * alphaCasca);

    ctx!.restore();

    // vinheta fecha conforme atravessa
    const vin = ctx!.createRadialGradient(
      cx,
      cy,
      Math.min(w, h) * (0.42 - eThru * 0.34),
      cx,
      cy,
      Math.max(w, h) * 0.78,
    );
    vin.addColorStop(0, 'rgba(20,16,16,0)');
    vin.addColorStop(1, `rgba(20,16,16,${0.75 + eThru * 0.25})`);
    ctx!.fillStyle = vin;
    ctx!.fillRect(0, 0, w, h);
  }

  function render(p: number) {
    progresso = p;
    ctx!.fillStyle = PALETA.noir;
    ctx!.fillRect(0, 0, w, h);

    if (quadros.length > 1) desenharQuadros(p);
    else desenharProcedural(p);

    // grão por cima de tudo, bem sutil
    if (padraoGrao) {
      ctx!.save();
      ctx!.globalAlpha = 0.035;
      ctx!.globalCompositeOperation = 'overlay';
      ctx!.fillStyle = padraoGrao;
      ctx!.fillRect(0, 0, w, h);
      ctx!.restore();
    }
  }

  dimensionar();
  render(0);

  // ── Pin + scrub ─────────────────────────────────────────────────────────
  const st = ScrollTrigger.create({
    trigger: palco,
    start: 'top top',
    end: () => '+=' + window.innerHeight * distancia,
    pin: palco,
    pinSpacing: true,
    scrub: 0.6,
    invalidateOnRefresh: true,
    onUpdate: (self) => render(self.progress),
    onRefresh: () => {
      dimensionar();
      render(progresso);
    },
  });

  // A dica de rolagem some assim que a sequência começa
  if (cue) {
    gsap.to(cue, {
      opacity: 0,
      y: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: palco,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 0.6,
        scrub: true,
      },
    });
  }

  window.addEventListener('resize', () => {
    dimensionar();
    render(progresso);
  });

  return st;
}
