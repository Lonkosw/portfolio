/**
 * Motor de animação do site.
 *
 * Princípios:
 * - Só anima transform/opacity (nunca width/height/top) → 60fps em celular.
 * - prefers-reduced-motion desliga tudo e mostra o conteúdo em estado final.
 * - Cursor e efeito magnético só em ponteiro fino (mouse), nunca em toque.
 * - Lenis não sequestra o scroll do touch: mobile continua com scroll nativo.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { setupOrcamento } from './orcamento';

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/** Rola até uma âncora respeitando o Lenis (ou nativo, se ele não existir). */
function setupAnchors(lenis?: Lenis) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -12 });
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
}

/** Header ganha fundo sólido depois que sai do topo. */
function setupHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Menu mobile. Funciona sem GSAP — é só classe + aria. */
function setupMobileMenu() {
  // Um botão só, de propósito: com dois, `querySelector` pegava só o primeiro
  // e o segundo ficava sem listener (armadilha herdada do primeiro site).
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return;

  const barras = toggle.querySelector<HTMLElement>('[data-menu-icone="barras"]');
  const xis = toggle.querySelector<HTMLElement>('[data-menu-icone="x"]');
  const rotulo = toggle.querySelector<HTMLElement>('[data-menu-label]');

  const aberto = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (barras) barras.hidden = open;
    if (xis) xis.hidden = !open;
    if (rotulo) rotulo.textContent = open ? 'Fechar menu' : 'Abrir menu';
    // O leque é pequeno e não cobre a página: o scroll continua liberado.
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!aberto());
  });

  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));

  // Toque em qualquer lugar fora fecha — num leque isso é o esperado.
  document.addEventListener('click', (e) => {
    if (!aberto()) return;
    if (!panel.contains(e.target as Node)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aberto()) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/** Cursor customizado — só mouse, e nunca captura eventos. */
function setupCursor() {
  if (!finePointer || prefersReduced) return;
  const dot = document.querySelector<HTMLElement>('[data-cursor]');
  if (!dot) return;

  gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
  const x = gsap.quickTo(dot, 'x', { duration: 0.45, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.45, ease: 'power3' });

  window.addEventListener(
    'mousemove',
    (e) => {
      x(e.clientX);
      y(e.clientY);
      gsap.to(dot, { opacity: 1, duration: 0.25, overwrite: 'auto' });
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => gsap.to(dot, { opacity: 0, duration: 0.2 }));

  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () =>
      gsap.to(dot, { scale: 2.6, duration: 0.3, ease: 'power3.out', overwrite: 'auto' }),
    );
    el.addEventListener('mouseleave', () =>
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power3.out', overwrite: 'auto' }),
    );
  });
}

/** Botões que "puxam" o cursor. Desktop apenas. */
function setupMagnetic() {
  if (!finePointer || prefersReduced) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.3;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/** Entrada do hero: título por linhas (cortina) + imagem revelada em escala. */
function setupHero() {
  const titulo = document.querySelector<HTMLElement>('[data-hero-title]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

  if (titulo) {
    const split = new SplitText(titulo, { type: 'lines', linesClass: 'split-line' });
    split.lines.forEach((line) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'block';
      wrap.style.overflow = 'hidden';
      line.parentNode?.insertBefore(wrap, line);
      wrap.appendChild(line);
    });
    tl.from(split.lines, { yPercent: 115, duration: 1.15, stagger: 0.09 }, 0);
  }

  tl.from('[data-hero-fade]', { opacity: 0, y: 20, duration: 0.9, stagger: 0.1 }, 0.35).from(
    '[data-hero-media]',
    { opacity: 0, scale: 1.08, duration: 1.4 },
    0.15,
  );

  if (hero) {
    ScrollTrigger.create({ trigger: hero, start: 'top 85%', once: true, onEnter: () => tl.play() });
  } else {
    tl.play();
  }

  // Rede de segurança: se por qualquer motivo o gatilho não disparar, o hero
  // não pode ficar invisível para sempre.
  window.setTimeout(() => {
    if (!tl.progress()) tl.play();
  }, 6000);
}

/** Reveal padrão de todas as seções. */
function setupReveals() {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'expo.out',
      delay: Number(el.dataset.revealDelay) || 0,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Imagens entram com um leve zoom-out (a moldura tem overflow-hidden).
  // O GSAP escreve transform inline no filho; por isso o hover de zoom do CSS
  // vive num elemento aninhado, nunca no mesmo nó.
  document.querySelectorAll<HTMLElement>('[data-reveal-img]').forEach((frame) => {
    const img = frame.firstElementChild;
    if (!img) return;
    gsap.to(img, {
      scale: 1,
      duration: 1.5,
      ease: 'expo.out',
      scrollTrigger: { trigger: frame, start: 'top 90%', once: true },
    });
  });
}

/**
 * Parallax suave nas fotos de seção.
 *
 * O elemento marcado é sempre uma foto MAIOR que a moldura (ver `.parallax-*`
 * no global.css): sem essa folga, deslocar a imagem abriria uma faixa vazia na
 * borda. E ele nunca é o mesmo nó que o reveal anima — dois `transform` no
 * mesmo elemento se sobrescrevem.
 *
 * Desligado abaixo de 1024px: no toque o scrub briga com o scroll nativo e
 * custa quadro à toa num aparelho fraco.
 */
function setupParallax() {
  if (window.innerWidth < 1024) return;
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax) || 6;
    const moldura = el.closest<HTMLElement>('[data-parallax-frame]') ?? el.parentElement ?? el;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: moldura, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    );
  });
}

/** Contadores dos números da seção "O lugar". */
function setupCounters() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const alvo = Number(el.dataset.count) || 0;
    // O HTML já traz o valor final; só zeramos porque vamos animar até ele.
    // Sem isso, quem estiver sem JS veria "0" para sempre.
    el.textContent = '0';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: alvo,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.v));
      },
    });
  });
}

async function init() {
  const root = document.documentElement;

  if (prefersReduced) {
    // Sem animação: garante o conteúdo visível e não instala nada.
    root.classList.remove('js-anim');
    setupHeader();
    setupMobileMenu();
    setupAnchors();
    return;
  }

  let lenis: Lenis | undefined;
  // Lenis só no desktop: no touch o scroll nativo é mais previsível e leve.
  if (finePointer) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  setupHeader();
  setupMobileMenu();
  setupAnchors(lenis);
  setupCursor();
  setupMagnetic();

  setupHero();
  setupReveals();
  setupParallax();
  setupCounters();

  ScrollTrigger.refresh();
}

// O simulador não é enfeite: sobe já, sem esperar fonte, e vale também com
// prefers-reduced-motion (que faz o init() abaixo sair mais cedo).
setupOrcamento();

// As fontes mudam a altura das linhas: esperar evita split/trigger errados.
if (document.fonts?.ready) document.fonts.ready.then(init);
else window.addEventListener('load', init);
