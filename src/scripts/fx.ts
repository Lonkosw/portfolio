// Efeitos leves compartilhados: reveal, contadores, parallax, magnético, header, menu, ano, carrossel.
// Tudo só com transform/opacity e desligado com prefers-reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

// ── Reveal ──
const alvos = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((g) => {
  Array.from(g.querySelectorAll<HTMLElement>(':scope > [data-reveal]')).forEach((el, i) => el.style.setProperty('--d', `${i * 0.08}s`));
});
if (reduce || !('IntersectionObserver' in window)) {
  alvos.forEach((e) => e.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  alvos.forEach((e) => io.observe(e));
}

// ── Contadores ──
const fmt = new Intl.NumberFormat('pt-BR');
function contar(el: HTMLElement) {
  const alvo = Number(el.dataset.count);
  const dec = Number(el.dataset.dec ?? 0);
  const sufixo = el.dataset.sufixo ?? '';
  const out = (v: number) => (dec ? v.toFixed(dec).replace('.', ',') : fmt.format(Math.round(v))) + sufixo;
  if (reduce) return void (el.textContent = out(alvo));
  const t0 = performance.now();
  const dur = 1600;
  const passo = (t: number) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = out(alvo * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
const contadores = document.querySelectorAll<HTMLElement>('[data-count]');
if ('IntersectionObserver' in window) {
  const ioc = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { contar(e.target as HTMLElement); ioc.unobserve(e.target); }
  }), { threshold: 0.6 });
  contadores.forEach((c) => ioc.observe(c));
} else contadores.forEach(contar);

// ── Header ──
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const on = () => header.classList.toggle('is-solid', scrollY > 24);
  addEventListener('scroll', on, { passive: true });
  on();
}

// ── Menu mobile ──
const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
if (btn && menu) {
  const set = (abrir: boolean) => {
    btn.setAttribute('aria-expanded', String(abrir));
    menu.classList.toggle('is-open', abrir);
    document.documentElement.classList.toggle('menu-aberto', abrir);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

// ── Parallax leve (desktop) ──
if (!reduce && fino) {
  const ps = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (ps.length) {
    let tick = false;
    const run = () => {
      tick = false;
      const vh = innerHeight;
      for (const el of ps) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const v = ((r.top + r.height / 2 - vh / 2) / vh) * Number(el.dataset.parallax || 30);
        el.style.transform = `translate3d(0, ${v.toFixed(1)}px, 0)`;
      }
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  // ── Botões magnéticos ──
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });

  // ── Cursor customizado (opcional, só onde há data-cursor no <body>) ──
  if (document.body.hasAttribute('data-cursor')) {
    const c = document.createElement('div');
    c.className = 'od-cursor';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    let x = 0, y = 0, cx = 0, cy = 0, vivo = false;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!vivo) { vivo = true; cx = x; cy = y; c.classList.add('on'); requestAnimationFrame(seguir); }
    });
    const seguir = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      c.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      requestAnimationFrame(seguir);
    };
    document.addEventListener('pointerover', (e) => {
      const alvo = (e.target as HTMLElement).closest('a, button, [role="button"], summary, label');
      c.classList.toggle('hover', !!alvo);
    });
  }
}

// ── Ano automático ──
document.querySelectorAll('[data-ano]').forEach((e) => (e.textContent = String(new Date().getFullYear())));

// ── Vídeo de hero (só se existir e as condições permitirem) ──
document.querySelectorAll<HTMLVideoElement>('video[data-hero-video]').forEach((v) => {
  if (reduce || saveData) { v.remove(); return; }
  v.play().catch(() => v.remove());
});

// ── Carrossel (botões de rolagem) ──
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((c) => {
  const trilho = c.querySelector<HTMLElement>('[data-track]');
  if (!trilho) return;
  const passo = (dir: number) => trilho.scrollBy({ left: dir * Math.max(280, trilho.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
  c.querySelector('[data-prev]')?.addEventListener('click', () => passo(-1));
  c.querySelector('[data-next]')?.addEventListener('click', () => passo(1));
});
