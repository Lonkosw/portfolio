/**
 * Extras de desktop — o único lugar do site que carrega GSAP.
 *
 * Entra por import dinâmico e SÓ quando há mouse e a janela é larga. Num
 * celular nada daqui é sequer pedido: são ~130 KB (GSAP + ScrollTrigger +
 * Lenis) que não saem do servidor.
 *
 * O que justifica GSAP aqui, e não CSS:
 *   - parallax com `scrub`: precisa de valor contínuo amarrado à posição do
 *     scroll, quadro a quadro. É o caso clássico que o CSS não cobre bem.
 *   - cursor e botões magnéticos: alvo muda a cada mousemove, com inércia.
 *   - Lenis: reescreve o scroll da página inteira.
 *
 * O que NÃO está aqui, de propósito: abertura do hero e revelações. As duas
 * são transições de opacity/transform disparadas uma vez, e o CSS faz melhor
 * e de graça — ver `base.ts` e `global.css`.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setupAnchors } from './base';

gsap.registerPlugin(ScrollTrigger);

/** Lê um token de duração do CSS e devolve em segundos, para o GSAP. */
function dur(nome: string, fallback: number): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const ms = parseFloat(v);
  return Number.isFinite(ms) && ms > 0 ? ms / 1000 : fallback;
}

/**
 * Cursor customizado.
 *
 * `quickTo` para TODAS as propriedades, e leitura do ponteiro no rAF: um
 * `gsap.to()` dentro do mousemove criaria uma tween nova a cada evento, e o
 * mousemove dispara mais vezes do que a tela atualiza.
 *
 * O hover vem por DELEGAÇÃO. Antes eram dois listeners em cada <a> e
 * <button> — com 40+ elementos na página, 80+ listeners para fazer o que um
 * `closest()` no documento resolve.
 */
function setupCursor() {
  const dot = document.querySelector<HTMLElement>('[data-cursor]');
  if (!dot) return;

  gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
  const x = gsap.quickTo(dot, 'x', { duration: 0.45, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.45, ease: 'power3' });
  const opacidade = gsap.quickTo(dot, 'opacity', { duration: dur('--dur-base', 0.2) });
  const escala = gsap.quickTo(dot, 'scale', { duration: dur('--dur-slow', 0.3), ease: 'power3' });

  let mx = 0;
  let my = 0;
  let agendado = false;

  const aplicar = () => {
    agendado = false;
    x(mx);
    y(my);
    opacidade(1);
  };

  window.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(aplicar);
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => opacidade(0));

  // `mouseover`/`mouseout` borbulham (mouseenter/mouseleave não), o que é o
  // que permite escutar uma vez só no documento.
  const interativo = (alvo: EventTarget | null) =>
    alvo instanceof Element && alvo.closest('a, button, [role="button"]');

  document.addEventListener('mouseover', (e) => {
    if (interativo(e.target)) escala(2.6);
  });
  document.addEventListener('mouseout', (e) => {
    if (interativo(e.target)) escala(1);
  });
}

/** Botões que "puxam" o cursor. */
function setupMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.25;
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

/**
 * Parallax nas fotos de seção. O elemento marcado é sempre uma foto maior
 * que a moldura (`.parallax-folga`): sem essa folga, deslocar abriria faixa
 * vazia na borda. E nunca é o mesmo nó que o reveal anima.
 */
function setupParallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax) || 5;
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

export function setupDesktop() {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // −88px: a barra fica grudada no topo com 72px de altura, e o Lenis rola
  // por JS — `scroll-margin-top` (que resolve o caso do celular) não vale
  // para `scrollTo` programático. Sem o deslocamento, o título de toda seção
  // parava atrás do cabeçalho.
  setupAnchors((alvo) => lenis.scrollTo(alvo, { offset: -88 }));
  setupCursor();
  setupMagnetic();
  setupParallax();

  // O diagnóstico revela o bloco de resultado e a página cresce: sem remedir,
  // o parallax fica apontando para as posições antigas.
  window.addEventListener('layout:mudou', () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
}
