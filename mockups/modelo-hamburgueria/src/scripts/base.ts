/**
 * Núcleo do site — SEM NENHUMA DEPENDÊNCIA.
 *
 * Este arquivo é tudo o que um celular baixa e executa. Ele cobre o site
 * inteiro: abertura do hero, revelações de seção, header, menu, âncoras e a
 * ferramenta de pedido.
 *
 * POR QUE SEM GSAP:
 * o bundle era 89 KB, quase todo GSAP, e no celular ele fazia só duas coisas —
 * a abertura do hero e as revelações. As duas são transições de `opacity` e
 * `transform` disparadas uma vez; o CSS faz isso nativamente, no compositor,
 * sem baixar nada. O GSAP continua no site, mas só onde ganha de verdade
 * (parallax com scrub, cursor, scroll suave), e só no desktop — ver
 * `desktop.ts`, que entra por import dinâmico.
 *
 * O SplitText saiu junto, e por um motivo que só apareceu ao olhar o HTML: o
 * título já vem do `site.ts` como um <span> por linha. O plugin estava
 * dividindo em linhas um texto que o build já entregava dividido.
 */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ── Header ─────────────────────────────────────────────────────────────
   IntersectionObserver sobre uma sentinela de 24px, e não listener de
   scroll: ler `scrollY` durante a rolagem força o navegador a resolver o
   layout ali mesmo, a cada evento. O observer avisa duas vezes na vida da
   página.                                                                */
function setupHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const sentinela = document.createElement('div');
  sentinela.setAttribute('aria-hidden', 'true');
  sentinela.style.cssText =
    'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
  document.body.prepend(sentinela);

  new IntersectionObserver(
    ([entrada]) => header.classList.toggle('is-stuck', !entrada.isIntersecting),
    { threshold: 0 },
  ).observe(sentinela);
}

/**
 * Menu do celular. Um botão só: com dois, `querySelector` pega apenas o
 * primeiro e o de fechar fica sem listener.
 */
function setupMobileMenu() {
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
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!aberto());
  });

  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));

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

/**
 * Âncoras. No celular usa `scrollIntoView` nativo — o navegador já rola
 * suave e respeita a preferência de movimento reduzido. No desktop o
 * `desktop.ts` substitui isto pela versão com Lenis.
 */
export function setupAnchors(rolar?: (alvo: HTMLElement) => void) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      if (rolar) rolar(target);
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
}

/**
 * Abertura do hero.
 *
 * O JS aqui faz UMA coisa: pôr a classe. Toda a coreografia — quem entra
 * quando, com que curva, por quanto tempo — está no CSS, em `global.css`.
 *
 * A classe é adicionada no próximo quadro (`requestAnimationFrame`) de
 * propósito: o CSS precisa ter pintado o estado inicial pelo menos uma vez,
 * senão o navegador funde os dois estados e não há transição nenhuma.
 */
function setupHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-pronto')));
}

/**
 * Revelações de seção.
 *
 * Um IntersectionObserver para a página inteira, e o CSS faz o movimento.
 * O stagger dos grupos vem de `--i` (o índice), escrito uma vez por filho —
 * o CSS multiplica pelo passo. Sem JS por item, sem timeline.
 */
function setupReveals() {
  if (prefersReduced) return;

  const io = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        // Revelação é de uma vez só: para de observar na hora, senão o
        // observer continua acompanhando dezenas de elementos até o fim.
        io.unobserve(entrada.target);
        entrada.target.classList.add('is-visivel');
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );

  document
    .querySelectorAll<HTMLElement>(
      // `[data-conversa]` é a seção de depoimentos: um gatilho só para a
      // conversa inteira, porque os balões precisam entrar em ordem a partir
      // de um zero comum. Se cada balão fosse observado por conta própria,
      // eles chegariam conforme o scroll e a sequência se perderia.
      '[data-reveal], [data-reveal-grupo], [data-reveal-img], [data-conversa]',
    )
    .forEach((el) => {
      if (el.hasAttribute('data-reveal-grupo')) {
        // O índice vira variável CSS: é o que dá a cascata sem uma linha de
        // JavaScript por item.
        Array.from(el.children).forEach((filho, i) =>
          (filho as HTMLElement).style.setProperty('--i', String(i)),
        );
      }
      io.observe(el);
    });
}

/** Só o essencial, sem esperar por nada. */
export function setupBase() {
  setupHeader();
  setupMobileMenu();
  setupHero();
  setupReveals();
  // As âncoras sobem já; no desktop o desktop.ts as reconfigura com Lenis.
  if (!finePointer || prefersReduced) setupAnchors();
}

export { finePointer, prefersReduced };
