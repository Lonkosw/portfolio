// Refinos de animação do Modelo 2: só transform/opacity, rAF, passivo; desligado com prefers-reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduce) {
  // Barra de progresso de leitura
  const bar = document.createElement('div');
  bar.className = 'rf-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let tick = false;
  const upd = () => {
    tick = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0})`;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}

if (!reduce && fino) {
  // Brilho que segue o ponteiro nos cards de especialidade e equipe
  document.querySelectorAll<HTMLElement>('.m2-bc, .m2-member, .m2-proto .hud').forEach((el) => {
    const g = document.createElement('span');
    g.className = 'rf-glow';
    g.setAttribute('aria-hidden', 'true');
    el.appendChild(g);
    let f = 0, x = 0, y = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (!f) f = requestAnimationFrame(() => { f = 0; g.style.transform = `translate3d(${x - 160}px, ${y - 160}px, 0)`; });
      g.classList.add('on');
    });
    el.addEventListener('pointerleave', () => g.classList.remove('on'));
  });

  // Profundidade no hero: etiquetas e dente em malha seguem o ponteiro em camadas
  const hero = document.querySelector<HTMLElement>('.m2-hero');
  const camadas = hero ? Array.from(hero.querySelectorAll<HTMLElement>('.m2-tag, .wt-box')) : [];
  if (hero && camadas.length) {
    let f = 0, nx = 0, ny = 0, vivo = false;
    const ir = () => {
      f = 0;
      camadas.forEach((el, i) => {
        const k = 8 + i * 6;
        el.style.translate = `${(nx * k).toFixed(1)}px ${(ny * k).toFixed(1)}px`;
      });
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      vivo = true;
      if (!f) f = requestAnimationFrame(ir);
    });
    hero.addEventListener('pointerleave', () => { nx = ny = 0; if (vivo) f = requestAnimationFrame(ir); });
  }
}
