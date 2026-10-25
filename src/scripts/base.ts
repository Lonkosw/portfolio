const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (v: number, casas = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

// Revelação ao rolar
const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
const io = new IntersectionObserver(
  (itens) => itens.forEach((i) => { if (i.isIntersecting) { i.target.classList.add('is-in'); io.unobserve(i.target); } }),
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
);
reveals.forEach((el) => {
  const d = el.dataset.delay;
  if (d) el.style.setProperty('--d', d);
  io.observe(el);
});

// Contadores: <span data-contar="1200" data-casas="0" data-prefixo="+" data-sufixo=" mil">
const contar = (el: HTMLElement) => {
  const alvo = Number(el.dataset.contar);
  const casas = Number(el.dataset.casas ?? 0);
  const pre = el.dataset.prefixo ?? '';
  const suf = el.dataset.sufixo ?? '';
  if (reduz) { el.textContent = pre + fmt(alvo, casas) + suf; return; }
  const inicio = performance.now();
  const dur = 1600;
  const passo = (t: number) => {
    const p = Math.min((t - inicio) / dur, 1);
    el.textContent = pre + fmt(alvo * (1 - Math.pow(1 - p, 4)), casas) + suf;
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};
// Odômetro: <span data-odometro="12840"> gera colunas de dígitos que rolam (só transform)
const odometro = (el: HTMLElement) => {
  const alvo = fmt(Number(el.dataset.odometro), Number(el.dataset.casas ?? 0)).split('');
  el.setAttribute('aria-label', alvo.join(''));
  el.innerHTML = '';
  alvo.forEach((c, i) => {
    const col = document.createElement('span');
    col.setAttribute('aria-hidden', 'true');
    col.className = 'odo-col';
    if (/\d/.test(c)) {
      const ref = document.createElement('span');
      ref.className = 'odo-ref';
      ref.textContent = c;
      col.appendChild(ref);
      const fita = document.createElement('span');
      fita.className = 'odo-fita';
      fita.innerHTML = Array.from({ length: 10 }, (_, n) => `<span>${n}</span>`).join('');
      col.appendChild(fita);
      const y = -Number(c) * 10;
      if (reduz) fita.style.transform = `translateY(${y}%)`;
      else {
        fita.style.transition = `transform ${1.4 + i * 0.12}s cubic-bezier(.2,.8,.2,1)`;
        requestAnimationFrame(() => requestAnimationFrame(() => (fita.style.transform = `translateY(${y}%)`)));
      }
    } else col.textContent = c;
    el.appendChild(col);
  });
};
const alvos = document.querySelectorAll<HTMLElement>('[data-contar], [data-odometro]');
const io2 = new IntersectionObserver(
  (itens) => itens.forEach((i) => {
    if (!i.isIntersecting) return;
    const el = i.target as HTMLElement;
    if (el.dataset.contar) contar(el); else odometro(el);
    io2.unobserve(el);
  }),
  { threshold: 0.4 },
);
alvos.forEach((el) => io2.observe(el));

// Parallax leve e variável de rolagem (--rolagem em px), só transform
const paralaxe = [...document.querySelectorAll<HTMLElement>('[data-paralaxe]')];
const usaRolagem = document.querySelector('[data-usa-rolagem]');
if (!reduz && (paralaxe.length || usaRolagem)) {
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const y = window.scrollY;
    if (usaRolagem) document.documentElement.style.setProperty('--rolagem', String(y));
    paralaxe.forEach((el) => {
      if (y > window.innerHeight * 1.5) return;
      el.style.transform = `translate3d(0, ${(y * Number(el.dataset.paralaxe)).toFixed(1)}px, 0)`;
    });
  };
  window.addEventListener('scroll', () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
  atualizar();
}

// Menu móvel
document.querySelectorAll<HTMLButtonElement>('[data-menu-botao]').forEach((b) => {
  const menu = document.getElementById(b.getAttribute('aria-controls') ?? '');
  b.addEventListener('click', () => {
    const aberto = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!aberto));
    menu?.classList.toggle('hidden', aberto);
  });
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { b.setAttribute('aria-expanded', 'false'); menu.classList.add('hidden'); }));
});

// Filtros do portfólio
document.querySelectorAll<HTMLElement>('[data-filtros]').forEach((grupo) => {
  const itens = document.querySelectorAll<HTMLElement>(`[data-galeria="${grupo.dataset.filtros}"] [data-tipo]`);
  grupo.querySelectorAll<HTMLButtonElement>('[data-filtro]').forEach((b) => b.addEventListener('click', () => {
    grupo.querySelectorAll('[data-filtro]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    itens.forEach((i) => { i.hidden = b.dataset.filtro !== 'todos' && i.dataset.tipo !== b.dataset.filtro; });
  }));
});

// Ano do rodapé
document.querySelectorAll('[data-ano]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
