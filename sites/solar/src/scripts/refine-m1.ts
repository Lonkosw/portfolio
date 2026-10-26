// Refinos de animação do Modelo 1: só transform/opacity, rAF, passivo; off com prefers-reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduce) {
  const bar = document.createElement('div');
  bar.className = 'rf-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let t = false;
  const upd = () => {
    t = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0})`;
  };
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}

if (!reduce && fino) {
  // Brilho solar que segue o ponteiro nos cards de vidro
  document.querySelectorAll<HTMLElement>('article.group, #depoimentos article, #como-funciona li').forEach((el) => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    const g = document.createElement('span');
    g.className = 'rf-glow';
    g.setAttribute('aria-hidden', 'true');
    el.appendChild(g);
    let f = 0, x = 0, y = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (!f) f = requestAnimationFrame(() => { f = 0; g.style.transform = `translate3d(${x - 170}px, ${y - 170}px, 0)`; });
      g.classList.add('on');
    });
    el.addEventListener('pointerleave', () => g.classList.remove('on'));
  });

  // Hero: o sol e o card de geração derivam com o ponteiro, em camadas
  const hero = document.getElementById('topo');
  const camadas = hero ? Array.from(hero.querySelectorAll<HTMLElement>('.sol-nasce, aside')) : [];
  if (hero && camadas.length) {
    let f = 0, nx = 0, ny = 0;
    const ir = () => {
      f = 0;
      camadas.forEach((el, i) => (el.style.translate = `${(nx * (i ? 14 : -26)).toFixed(1)}px ${(ny * (i ? 10 : -18)).toFixed(1)}px`));
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!f) f = requestAnimationFrame(ir);
    });
    hero.addEventListener('pointerleave', () => { nx = ny = 0; f = requestAnimationFrame(ir); });
  }
}

// Inclinação 3D nos cards (propriedade `rotate`, compõe com os transforms existentes; perspectiva no pai)
if (!reduce && fino) {
  document.querySelectorAll<HTMLElement>('article.group, #depoimentos article').forEach((el) => {
    if (el.parentElement) el.parentElement.style.perspective = '1100px';
    let f = 0, ax = 0, ay = 0, ang = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      ax = -ny; ay = nx; ang = Math.hypot(nx, ny) * 10;
      el.classList.add('rf-tilt');
      if (!f) f = requestAnimationFrame(() => { f = 0; el.style.rotate = `${ax.toFixed(3)} ${ay.toFixed(3)} 0 ${ang.toFixed(2)}deg`; });
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('rf-tilt'); el.style.rotate = ''; });
  });
}
