# Receitas de motion

Trechos testados em produção (extraídos e generalizados de um protótipo real
deste portfólio — `sites/dolce-cau/`). Stack de referência: **GSAP 3**
(`ScrollTrigger`, `SplitText`) + **Lenis** para scroll suave. Dá para adaptar
os mesmos princípios para Framer Motion, CSS puro com `@scroll-timeline`, ou
outra stack — o que importa são as regras, não a biblioteca.

Se o projeto já usa Astro + Tailwind 4 + GSAP/Lenis como stack padrão (é o
caso deste portfólio — ver `PROMPT-NOVO-SITE.md` na raiz), siga exatamente
essa combinação em vez de introduzir uma nova.

## Regras que não têm exceção

1. **Só anime `transform` e `opacity`.** Nunca `width`, `height`, `top`,
   `left` — forçam reflow/layout e engasgam no celular. Se precisar "crescer"
   algo, anime `scale`; se precisar "mover", anime `x`/`y` (transform), nunca
   `left`/`top`.
2. **Todo reveal de entrada usa `once: true`** (ou equivalente). Nada deve
   re-disparar ao rolar para cima e descer de novo — isso cansa e parece
   amador, o oposto do efeito desejado.
3. **`prefers-reduced-motion` desliga tudo**, e o conteúdo aparece no estado
   final — nunca escondido esperando um JS que talvez não rode. Ver seção
   [reduced-motion](#reduced-motion).
4. **Cursor customizado, efeito magnético e parallax só em `pointer: fine`.**
   Em touch (`pointer: coarse`), nunca — o gesto do sistema é mais importante
   que o enfeite.
5. **Lenis (scroll suave) só no desktop.** No toque, o scroll nativo do
   sistema evita brigar com "puxar para atualizar" e o gesto de voltar.
6. **Um `ease` e 2-3 durações, como tokens.** Não decida caso a caso — defina
   uma vez (`--ease-out-expo`, `--dur-fast/base/slow` ou equivalente) e reuse.

## Setup base (GSAP + ScrollTrigger + Lenis)

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

async function init() {
  const root = document.documentElement;

  if (prefersReduced) {
    // Sem animação: garante conteúdo visível, não instala nada de motion.
    root.classList.remove('js-anim');
    setupHeader();
    setupMobileMenu();
    setupAnchors();
    return;
  }

  let lenis: Lenis | undefined;
  if (finePointer) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  setupHeader();
  setupMobileMenu(lenis);
  setupAnchors(lenis);
  setupCursor();
  setupMagnetic();
  setupHero();
  setupReveals();
  setupParallax();
  setupCounters();

  ScrollTrigger.refresh();
}

// Espere as fontes: mudam a altura das linhas, e SplitText/ScrollTrigger
// medidos antes disso ficam com gatilhos errados.
if (document.fonts?.ready) document.fonts.ready.then(init);
else window.addEventListener('load', init);
```

## Reveal padrão de seção

Marque qualquer elemento com `data-reveal` no HTML; o CSS esconde o estado
inicial **só quando o JS confirma que vai animar** (classe `js-anim` no
`<html>`), então sem JS ou com reduced-motion o conteúdo nunca fica preso
invisível.

```css
html.js-anim [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
}
```

```ts
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
}
```

## Hero: título por linha + imagem com zoom-out

Efeito "cortina": cada linha do título entra de baixo, dentro de um wrapper
com `overflow: hidden`; a imagem do hero entra com leve zoom-out (escala de
1.08 para 1). Dispara quando o hero entra na tela, com uma rede de segurança
(timeout) caso o `ScrollTrigger` não dispare por algum motivo.

```ts
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

  tl.from('[data-hero-fade]', { opacity: 0, y: 20, duration: 0.9, stagger: 0.1 }, 0.35)
    .from('[data-hero-media]', { opacity: 0, scale: 1.08, duration: 1.4 }, 0.15);

  if (hero) {
    ScrollTrigger.create({ trigger: hero, start: 'top 85%', once: true, onEnter: () => tl.play() });
  } else {
    tl.play();
  }

  // Rede de segurança: hero não pode ficar invisível para sempre.
  window.setTimeout(() => {
    if (!tl.progress()) tl.play();
  }, 6000);
}
```

## Cursor customizado (desktop apenas)

```ts
function setupCursor() {
  if (!finePointer || prefersReduced) return;
  const dot = document.querySelector<HTMLElement>('[data-cursor]');
  if (!dot) return;

  gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
  const x = gsap.quickTo(dot, 'x', { duration: 0.45, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.45, ease: 'power3' });

  window.addEventListener('mousemove', (e) => {
    x(e.clientX);
    y(e.clientY);
    gsap.to(dot, { opacity: 1, duration: 0.25, overwrite: 'auto' });
  }, { passive: true });

  document.querySelectorAll('a, button, [data-cursor-grow]').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(dot, { scale: 2.6, duration: 0.3, overwrite: 'auto' }));
    el.addEventListener('mouseleave', () => gsap.to(dot, { scale: 1, duration: 0.3, overwrite: 'auto' }));
  });
}
```

## Botões magnéticos (desktop apenas)

```ts
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
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}
```

## Parallax leve (desktop apenas)

```ts
function setupParallax() {
  if (window.innerWidth < 1024) return;
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax) || 12;
    gsap.to(el, {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}
```

## Contador animado

O HTML já traz o valor final (para SEO e para quem não roda JS); zera só na
hora de animar, nunca deixe "0" como valor fonte.

```ts
function setupCounters() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const alvo = Number(el.dataset.count) || 0;
    el.textContent = '0';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: alvo,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
    });
  });
}
```

## Marquee/faixa deslizante — CSS puro, nunca JS

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 24s linear infinite;
}
```
(duplique o conteúdo da faixa uma vez para o loop ficar contínuo)

## Reduced-motion

Duas camadas — uma inline no `<head>` (roda antes da primeira pintura), uma
em CSS:

```html
<script>
  // Antes de qualquer pintura: sem isto, o conteúdo marcado para animar
  // fica em opacity:0 até o JS de motion carregar — ou para sempre, se
  // reduced-motion estiver ligado e você nunca instalar as animações.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-anim');
  }
</script>
```

```css
@media (prefers-reduced-motion: reduce) {
  html.js-anim [data-reveal],
  html.js-anim [data-reveal-img] > * {
    opacity: 1;
    transform: none;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Armadilhas conhecidas (custaram horas em produção)

1. **`position: fixed` dentro de elemento com `backdrop-filter` não é
   fixo.** O filtro cria um bloco de contenção. Um painel fixo dentro de um
   header com blur fica preso no header. Se o header tem blur, o painel
   fixo precisa estar fora dele no DOM.
2. **GSAP escreve `transform` inline.** Se o mesmo elemento também tem zoom
   no hover via CSS, um mata o outro. Separe em dois elementos aninhados:
   GSAP no de fora, CSS no de dentro.
3. **Elemento com `display: none` mede altura zero no `ScrollTrigger`.** Um
   item que nasce escondido (dentro de "mostrar mais", por exemplo) não pode
   ter o atributo de reveal, ou fica travado em `opacity: 0` quando aparece.
4. **A página crescer invalida os gatilhos.** Depois de revelar itens
   dinamicamente, dispare `ScrollTrigger.refresh()`.
5. **`querySelector` pega só o primeiro elemento.** Se houver dois elementos
   com o mesmo atributo de controle (ex.: dois botões de abrir/fechar menu),
   o segundo fica sem listener. Use `querySelectorAll` — ou, melhor, garanta
   que só existe um elemento de controle.
6. **`content-visibility: auto` some com seções fora da tela em capturas
   automatizadas** (e pode interferir em medição de posição/scroll) — role
   até a seção antes de medir ou fotografar.
7. **O número de "fluidez de scroll" oscila entre execuções.** Medição com
   CPU desacelerada é ruidosa; use para comparar antes/depois da mesma
   mudança, não como nota absoluta isolada.
8. **O suspeito óbvio de travamento nem sempre é o culpado.** "JS demais" é
   o primeiro palpite, mas `backdrop-filter` em elemento grande (ex.: um
   header com blur) pode custar mais no frame do que qualquer script — meça
   antes de cortar o que parece óbvio.
