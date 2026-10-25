/**
 * Comportamentos compartilhados pelas três páginas. JS leve, sem framework.
 * Animações usam apenas transform/opacity e respeitam prefers-reduced-motion.
 */

const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, raiz: ParentNode = document) =>
  Array.from(raiz.querySelectorAll<T>(sel));

/* ------------------------------------------------------------------ personalização por URL */

export interface Biz {
  nome: string;
  cidade: string;
  uf: string;
  whats: string;
}

/** Só texto: remove tags, caracteres de controle e limita o tamanho. */
export function limparTexto(valor: string | null, max = 60): string {
  if (!valor) return '';
  return valor
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"`\\{}]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function limparWhats(valor: string | null): string {
  const d = (valor ?? '').replace(/\D/g, '');
  if (d.length < 10 || d.length > 15) return '';
  return d.startsWith('55') ? d : `55${d}`;
}

function formatarTelefone(whats: string): string {
  const d = whats.startsWith('55') ? whats.slice(2) : whats;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

function lerBiz(): Biz {
  const el = document.getElementById('biz-data');
  const base: Biz = el ? JSON.parse(el.textContent || '{}') : { nome: '', cidade: '', uf: '', whats: '' };
  const q = new URLSearchParams(location.search);
  const nome = limparTexto(q.get('empresa'));
  const cidade = limparTexto(q.get('cidade'), 40);
  const whats = limparWhats(q.get('whats'));
  return {
    nome: nome || base.nome,
    cidade: cidade || base.cidade,
    // se a cidade mudou, o estado original deixa de valer
    uf: cidade ? '' : base.uf,
    whats: whats || base.whats,
  };
}

export const biz: Biz = lerBiz();
(window as any).__biz = biz;

export function linkWhats(texto: string): string {
  const msg = texto.replace(/\{nome\}/g, biz.nome);
  return `https://wa.me/${biz.whats}?text=${encodeURIComponent(msg)}`;
}

function aplicarBiz() {
  const original = JSON.parse(document.getElementById('biz-data')?.textContent || '{}') as Biz;
  const mudou = biz.nome !== original.nome || biz.cidade !== original.cidade || biz.whats !== original.whats;

  $$('[data-biz="nome"]').forEach((e) => (e.textContent = biz.nome));
  $$('[data-biz="cidade"]').forEach((e) => (e.textContent = biz.cidade));
  $$('[data-biz="uf"]').forEach((e) => (e.textContent = biz.uf ? `/${biz.uf}` : ''));
  $$('[data-biz="telefone"]').forEach((e) => (e.textContent = formatarTelefone(biz.whats)));
  $$('a[data-biz-tel]').forEach((a) => ((a as HTMLAnchorElement).href = `tel:+${biz.whats}`));
  $$('[data-biz="inicial"]').forEach((e) => (e.textContent = biz.nome.trim().charAt(0).toUpperCase()));
  $$('[data-biz="sigla"]').forEach((e) => {
    const p = biz.nome.split(/\s+/).filter(Boolean);
    e.textContent = (p.length > 1 ? p[0][0] + p[1][0] : biz.nome.slice(0, 2)).toUpperCase();
  });

  $$<HTMLAnchorElement>('a[data-wa]').forEach((a) => {
    a.href = linkWhats(a.dataset.wa || '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  if (!mudou) return;

  // endereço da empresa original não vale para outra cidade
  if (biz.cidade !== original.cidade) $$('[data-biz-local]').forEach((e) => (e.hidden = true));

  // título, descrição, Open Graph e JSON-LD
  document.title = document.title.replace(original.nome, biz.nome).replace(original.cidade, biz.cidade);
  const trocar = (v: string | null) => (v ? v.split(original.nome).join(biz.nome).split(original.cidade).join(biz.cidade) : v);
  for (const sel of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]']) {
    const m = document.querySelector<HTMLMetaElement>(sel);
    if (m) m.content = trocar(m.content) ?? '';
  }
  const ld = document.getElementById('ld-json');
  if (ld) {
    try {
      const j = JSON.parse(ld.textContent || '{}');
      j.name = biz.nome;
      j.telephone = `+${biz.whats}`;
      j.description = trocar(j.description);
      if (j.address) {
        j.address.addressLocality = biz.cidade;
        if (biz.uf === '') delete j.address.addressRegion;
        if (biz.cidade !== original.cidade) {
          delete j.address.streetAddress;
          delete j.address.postalCode;
        }
      }
      ld.textContent = JSON.stringify(j);
    } catch {}
  }
  // alt/title com o nome antigo
  $$('[alt],[title],[aria-label]').forEach((e) => {
    for (const a of ['alt', 'title', 'aria-label']) {
      const v = e.getAttribute(a);
      if (v && (v.includes(original.nome) || v.includes(original.cidade))) e.setAttribute(a, trocar(v) as string);
    }
  });
}

/* ------------------------------------------------------------------ revelar ao rolar */

function reveal() {
  const itens = $$('[data-reveal]');
  if (reduzir || !('IntersectionObserver' in window)) {
    itens.forEach((e) => e.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entradas) => {
      for (const en of entradas) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  itens.forEach((e) => io.observe(e));
}

/* ------------------------------------------------------------------ contadores */

function animarNumero(el: HTMLElement) {
  const alvo = parseFloat(el.dataset.count || '0');
  const dec = parseInt(el.dataset.dec || '0', 10);
  const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const prefixo = el.dataset.prefix || '';
  const sufixo = el.dataset.suffix || '';
  if (reduzir) {
    el.textContent = prefixo + fmt.format(alvo) + sufixo;
    return;
  }
  const dur = 1600;
  const t0 = performance.now();
  const passo = (t: number) => {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = prefixo + fmt.format(alvo * e) + sufixo;
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

function contadores() {
  const itens = $$('[data-count]');
  if (!('IntersectionObserver' in window)) {
    itens.forEach(animarNumero);
    return;
  }
  const io = new IntersectionObserver(
    (en) =>
      en.forEach((x) => {
        if (x.isIntersecting) {
          animarNumero(x.target as HTMLElement);
          io.unobserve(x.target);
        }
      }),
    { threshold: 0.4 },
  );
  itens.forEach((e) => io.observe(e));
}

/* ------------------------------------------------------------------ parallax leve + progresso de rolagem */

function parallaxEProgresso() {
  const par = $$('[data-parallax]');
  const prog = $$('[data-scroll-progress]');
  if (reduzir || (!par.length && !prog.length)) {
    prog.forEach((e) => e.style.setProperty('--p', '1'));
    return;
  }
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const vh = window.innerHeight;
    for (const e of par) {
      const r = e.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const vel = parseFloat(e.dataset.parallax || '0.08');
      const centro = r.top + r.height / 2 - vh / 2;
      e.style.transform = `translate3d(0, ${(-centro * vel).toFixed(1)}px, 0)`;
    }
    for (const e of prog) {
      const r = e.getBoundingClientRect();
      // 0 quando o topo entra pela base da tela; 1 quando passa de 35% da altura
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.95 + r.height * 0.2)));
      e.style.setProperty('--p', p.toFixed(3));
    }
  };
  const aoRolar = () => {
    if (!pendente) {
      pendente = true;
      requestAnimationFrame(atualizar);
    }
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  atualizar();
}

/* ------------------------------------------------------------------ filtros (galeria e catálogo) */

function filtros() {
  $$('[data-filter-group]').forEach((grupo) => {
    const alvo = document.querySelector<HTMLElement>(grupo.dataset.filterGroup || '');
    if (!alvo) return;
    const botoes = $$<HTMLButtonElement>('[data-filter]', grupo);
    botoes.forEach((b) =>
      b.addEventListener('click', () => {
        const f = b.dataset.filter || 'todos';
        botoes.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        $$('[data-cat]', alvo).forEach((card) => {
          const ok = f === 'todos' || (card.dataset.cat || '').split(' ').includes(f);
          card.hidden = !ok;
        });
      }),
    );
  });
}

/* ------------------------------------------------------------------ amostras (diálogo do catálogo) */

function amostras() {
  const dlg = document.getElementById('amostra-dialog') as HTMLDialogElement | null;
  if (!dlg) return;
  const campos = {
    nome: dlg.querySelector<HTMLElement>('[data-a="nome"]'),
    desc: dlg.querySelector<HTMLElement>('[data-a="desc"]'),
    usos: dlg.querySelector<HTMLElement>('[data-a="usos"]'),
    preco: dlg.querySelector<HTMLElement>('[data-a="preco"]'),
    cat: dlg.querySelector<HTMLElement>('[data-a="cat"]'),
    tex: dlg.querySelector<HTMLElement>('[data-a="tex"]'),
    cta: dlg.querySelector<HTMLAnchorElement>('[data-a="cta"]'),
  };
  $$<HTMLElement>('[data-amostra]').forEach((card) =>
    card.addEventListener('click', () => {
      const d = JSON.parse(card.dataset.amostra || '{}');
      if (campos.nome) campos.nome.textContent = d.nome;
      if (campos.desc) campos.desc.textContent = d.descricao;
      if (campos.cat) campos.cat.textContent = d.categoria;
      if (campos.preco) campos.preco.textContent = d.preco;
      if (campos.usos) campos.usos.innerHTML = (d.usos as string[]).map((u) => `<li>${u.replace(/[<>&]/g, '')}</li>`).join('');
      if (campos.tex) campos.tex.style.backgroundImage = `url("${d.textura}")`;
      if (campos.cta) {
        campos.cta.dataset.wa = `Olá, {nome}! Quero um orçamento com ${d.nome}.`;
        campos.cta.href = linkWhats(campos.cta.dataset.wa);
      }
      dlg.dataset.mat = d.id;
      dlg.showModal();
    }),
  );
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
  dlg.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.querySelector('[data-a="usar"]')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('escolher-material', { detail: dlg.dataset.mat }));
    dlg.close();
    document.getElementById('calculadora')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth' });
  });
}

/* ------------------------------------------------------------------ antes/depois */

function antesDepois() {
  $$('[data-ba]').forEach((ba) => {
    const range = ba.querySelector<HTMLInputElement>('input[type="range"]');
    if (!range) return;
    const set = (v: number) => ba.style.setProperty('--ba', String(v));
    set(Number(range.value));
    range.addEventListener('input', () => set(Number(range.value)));
    // arrastar em qualquer ponto da imagem
    let ativo = false;
    const mover = (x: number) => {
      const r = ba.getBoundingClientRect();
      const v = Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100));
      range.value = String(v);
      set(v);
    };
    ba.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement) === range) return;
      ativo = true;
      ba.setPointerCapture(e.pointerId);
      mover(e.clientX);
    });
    ba.addEventListener('pointermove', (e) => ativo && mover(e.clientX));
    ba.addEventListener('pointerup', () => (ativo = false));
    ba.addEventListener('pointercancel', () => (ativo = false));
  });
}

/* ------------------------------------------------------------------ menu móvel */

function menu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const nav = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !nav) return;
  const alternar = (abrir?: boolean) => {
    const aberto = abrir ?? btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(aberto));
    nav.dataset.open = String(aberto);
    document.documentElement.classList.toggle('menu-aberto', aberto);
  };
  btn.addEventListener('click', () => alternar());
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => alternar(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && alternar(false));
  // cabeçalho que ganha fundo ao rolar
  const topo = document.querySelector<HTMLElement>('[data-header]');
  if (topo) {
    const f = () => topo.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', f, { passive: true });
    f();
  }
}

/* ------------------------------------------------------------------ cartas que viram (modelo 2) */

function cartas() {
  $$('.carta').forEach((c) => {
    const frente = c.querySelector<HTMLElement>('.carta-front');
    const verso = c.querySelector<HTMLElement>('.carta-back');
    const abrir = c.querySelector<HTMLButtonElement>('[data-flip-btn]');
    if (!frente || !verso || !abrir) return;
    const definir = (on: boolean) => {
      c.classList.toggle('is-flipped', on);
      abrir.setAttribute('aria-expanded', String(on));
      (verso as any).inert = !on;
      (frente as any).inert = on;
      (on ? verso.querySelector<HTMLElement>('button, a') : abrir)?.focus({ preventScroll: true });
    };
    (verso as any).inert = true;
    abrir.addEventListener('click', () => definir(true));
    c.querySelector('[data-flip-back]')?.addEventListener('click', () => definir(false));
  });
}

function usarMaterial() {
  $$<HTMLElement>('[data-usar]').forEach((b) =>
    b.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('escolher-material', { detail: b.dataset.usar }));
      document.getElementById('calculadora')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth' });
    }),
  );
}

aplicarBiz();
usarMaterial();
reveal();
contadores();
parallaxEProgresso();
filtros();
amostras();
antesDepois();
menu();
cartas();
