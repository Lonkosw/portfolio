/**
 * Cliente da calculadora: lê o formulário, calcula (src/lib/calc.ts), desenha a peça em SVG,
 * monta o comparador e o link do WhatsApp. Sem dependências.
 */
import {
  ALTURA_RODABANCA,
  BORDAS,
  CUBAS,
  MATERIAIS,
  TIPOS_PECA,
  type TipoBorda,
  type TipoCuba,
  type TipoPeca,
} from '../data/marmoraria-config.ts';
import {
  calcularPeca,
  calcularTotal,
  formatBRL,
  formatFaixa,
  formatM2,
  getMaterial,
  pecaPadrao,
  pecaValida,
  tipoInfo,
  totalComMaterial,
  type Peca,
} from '../lib/calc.ts';
import { biz, linkWhats } from './site.ts';

const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const raiz = document.querySelector<HTMLElement>('[data-calc]');

if (raiz) iniciar(raiz);

function iniciar(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const $$ = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const form = $<HTMLFormElement>('[data-calc-form]');
  const wizard = root.dataset.wizard === 'true';

  const estado = {
    pecas: [] as Peca[],
    draft: pecaPadrao('bancada', MATERIAIS[0].id),
    sujo: true, // o rascunho entra na soma enquanto não for "adicionado"
    instalacao: true,
    passo: 0,
  };

  /* ---------------------------------------------------------------- leitura do formulário */

  const num = (nome: string) => {
    const el = form.elements.namedItem(nome) as HTMLInputElement | null;
    const v = parseFloat((el?.value ?? '').replace(',', '.'));
    return Number.isFinite(v) ? v : 0;
  };
  const radio = (nome: string) => (form.querySelector<HTMLInputElement>(`input[name="${nome}"]:checked`)?.value ?? '') as string;
  const marcado = (nome: string) => !!(form.elements.namedItem(nome) as HTMLInputElement | null)?.checked;

  function lerRascunho(): Peca {
    const tipo = radio('tipo') as TipoPeca;
    const info = tipoInfo(tipo);
    const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
    return {
      tipo,
      comprimento: clamp(num('comprimento'), 2000),
      largura: clamp(num('largura'), 1000),
      degraus: Math.round(clamp(num('degraus'), 60)),
      espelho: marcado('espelho'),
      material: radio('material') || MATERIAIS[0].id,
      borda: (info.borda ? radio('borda') : 'reta') as TipoBorda,
      saia: info.saia ? num('saia') : 0,
      frontao: info.saia ? num('frontao') : 0,
      rodabanca: info.rodabanca && marcado('rodabanca'),
      cuba: (info.cubaFixa ?? (info.cuba ? radio('cuba') : 'nenhuma')) as TipoCuba,
      cooktop: info.cooktop && marcado('cooktop'),
    };
  }

  function escreverCampo(nome: string, valor: string | number | boolean) {
    const el = form.elements.namedItem(nome);
    if (!el) return;
    if (el instanceof RadioNodeList) {
      el.forEach((r) => ((r as HTMLInputElement).checked = (r as HTMLInputElement).value === String(valor)));
    } else if ((el as HTMLInputElement).type === 'checkbox') {
      (el as HTMLInputElement).checked = !!valor;
    } else {
      (el as HTMLInputElement).value = String(valor);
    }
  }

  /** Mostra só as opções que fazem sentido para o tipo de peça. */
  function ajustarTipo(tipo: TipoPeca, reiniciar: boolean) {
    const info = tipoInfo(tipo);
    const esc = tipo === 'escada';
    $$('[data-show-for="escada"]').forEach((e) => (e.hidden = !esc));
    $$('[data-hide-for="escada"]').forEach((e) => (e.hidden = esc));
    $$<HTMLElement>('[data-howto]').forEach((e) => (e.hidden = (e.dataset.howto === 'escada') !== esc));
    const lc = $('[data-lbl="comprimento"]');
    lc.textContent = esc ? 'Largura da escada (cm)' : 'Comprimento (cm)';
    $('[data-calc-ajuda]').textContent = info.ajuda;

    const vis = (opt: string, on: boolean) => ($(`[data-opt="${opt}"]`).hidden = !on);
    vis('borda', info.borda);
    vis('saia', info.saia);
    vis('frontao', info.saia);
    vis('rodabanca', info.rodabanca);
    vis('cuba', info.cuba);
    vis('cooktop', info.cooktop);
    $('[data-calc-sem-opcoes]').hidden = info.borda || info.saia || info.cuba || info.cooktop;
    // lavatório esculpido: mostrar aviso de cuba incluída
    if (reiniciar) {
      escreverCampo('comprimento', info.padrao[0]);
      escreverCampo('largura', info.padrao[1]);
      escreverCampo('degraus', esc ? 10 : 0);
      escreverCampo('espelho', true);
      escreverCampo('borda', 'reta');
      escreverCampo('saia', 0);
      escreverCampo('frontao', 0);
      escreverCampo('rodabanca', false);
      escreverCampo('cuba', info.cubaFixa ?? 'nenhuma');
      escreverCampo('cooktop', false);
    }
  }

  /* ---------------------------------------------------------------- números animados */

  const valores = new WeakMap<HTMLElement, number>();
  function numero(el: HTMLElement | null, alvo: number, fmt: (n: number) => string) {
    if (!el) return;
    const de = valores.get(el) ?? 0;
    valores.set(el, alvo);
    if (reduzir || de === alvo) {
      el.textContent = fmt(alvo);
      return;
    }
    const t0 = performance.now();
    const dur = 480;
    const id = Symbol();
    (el as any).__t = id;
    const passo = (t: number) => {
      if ((el as any).__t !== id) return;
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(de + (alvo - de) * e);
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  /* ---------------------------------------------------------------- desenho SVG */

  const esc = (s: string) => s.replace(/[<>&"]/g, '');

  function desenhar(p: Peca): string {
    const mat = getMaterial(p.material);
    const tex = `/tex/${mat.id}.svg`;
    const defs = `<defs>
      <pattern id="viz-tex" width="240" height="240" patternUnits="userSpaceOnUse"><image href="${tex}" width="240" height="240" preserveAspectRatio="xMidYMid slice"/></pattern>
      <linearGradient id="viz-sombra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
      <marker id="viz-seta" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" class="viz-dim-fill"/></marker>
    </defs>`;

    if (p.tipo === 'escada') {
      const n = Math.max(1, p.degraus || 1);
      const k = Math.min(n, 14);
      const largura = 320;
      const alturaMax = 130;
      const dx = largura / k;
      const dy = Math.min(alturaMax / k, dx * 0.6);
      const x0 = 40;
      const yBase = 200;
      let d = `M${x0} ${yBase}`;
      for (let i = 0; i < k; i++) {
        d += ` V${yBase - dy * (i + 1)} H${x0 + dx * (i + 1)}`;
      }
      d += ` V${yBase} Z`;
      const topo = yBase - dy * k;
      return `${defs}
      <path d="${d}" fill="url(#viz-tex)" class="viz-slab"/>
      <path d="${d}" fill="url(#viz-sombra)"/>
      <path d="M${x0} ${yBase + 18}H${x0 + largura}" class="viz-dim" marker-start="url(#viz-seta)" marker-end="url(#viz-seta)"/>
      <text x="${x0 + largura / 2}" y="${yBase + 36}" text-anchor="middle" class="viz-txt">${n} degraus${n > k ? ` (mostrando ${k})` : ''} · largura ${fmt(p.comprimento)} cm</text>
      <text x="${x0 + largura / 2}" y="${Math.max(24, topo - 14)}" text-anchor="middle" class="viz-txt viz-txt--soft">${esc(mat.nome)}</text>`;
    }

    // planta (vista de cima)
    const c = Math.max(p.comprimento, 1);
    const l = Math.max(p.largura, 1);
    const s = Math.min(320 / c, 140 / l);
    const w = Math.max(c * s, 24);
    const h = Math.max(l * s, 14);
    const x = (400 - w) / 2;
    const fh = p.frontao > 0 ? Math.max(5, p.frontao * s * 0.7) : p.rodabanca ? Math.max(4, ALTURA_RODABANCA * s * 0.7) : 0;
    const sh = p.saia > 0 ? Math.max(4, p.saia * s * 0.9) : 0;
    const topoY = 62 + fh;
    const y = Math.max(topoY, (270 - h) / 2 - 8);
    const r = p.borda === 'boleada' ? Math.min(14, h / 2) : 2;

    let slab: string;
    if (p.borda === 'chanfrada') {
      const k = Math.min(12, h / 3, w / 6);
      slab = `<path d="M${x + k} ${y} H${x + w - k} L${x + w} ${y + k} V${y + h - k} L${x + w - k} ${y + h} H${x + k} L${x} ${y + h - k} V${y + k} Z" fill="url(#viz-tex)" class="viz-slab"/>`;
    } else {
      slab = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#viz-tex)" class="viz-slab"/>`;
    }
    const meia = p.borda === 'meia-esquadria' ? `<path d="M${x + 3} ${y + h - 5}H${x + w - 3}" class="viz-edge"/>` : '';

    const fr = fh ? `<rect x="${x}" y="${y - fh}" width="${w}" height="${fh}" fill="url(#viz-tex)" class="viz-slab viz-slab--wall"/><rect x="${x}" y="${y - fh}" width="${w}" height="${fh}" fill="url(#viz-sombra)" opacity=".5"/>` : '';
    const sa = sh ? `<rect x="${x}" y="${y + h}" width="${w}" height="${sh}" fill="url(#viz-tex)" class="viz-slab viz-slab--skirt"/><rect x="${x}" y="${y + h}" width="${w}" height="${sh}" fill="url(#viz-sombra)"/>` : '';

    let cuba = '';
    if (p.cuba !== 'nenhuma' && h > 24) {
      const cw = Math.min(55 * s, w * 0.42);
      const ch = Math.min(40 * s, h * 0.62);
      const cx = x + w * 0.3 - cw / 2;
      const cy = y + (h - ch) / 2;
      if (p.cuba === 'embutida') cuba = `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="4" class="viz-cuba"/><circle cx="${cx + cw / 2}" cy="${cy + ch / 2}" r="2.500" class="viz-ralo"/>`;
      else if (p.cuba === 'sobrepor') cuba = `<ellipse cx="${cx + cw / 2}" cy="${cy + ch / 2}" rx="${cw / 2}" ry="${ch / 2}" class="viz-bowl"/><ellipse cx="${cx + cw / 2}" cy="${cy + ch / 2}" rx="${cw / 2 - 5}" ry="${ch / 2 - 5}" class="viz-bowl-in"/>`;
      else {
        const ew = Math.min(w * 0.7, 70 * s + 20);
        const eh = Math.min(h * 0.72, 44 * s + 10);
        cuba = `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${ew / 2}" ry="${eh / 2}" class="viz-cuba"/><ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${ew / 2 - 8}" ry="${eh / 2 - 7}" class="viz-bowl-in"/>`;
      }
    }

    let cook = '';
    if (p.cooktop && h > 30) {
      const kw = Math.min(58 * s, w * 0.34);
      const kh = Math.min(50 * s, h * 0.7);
      const kx = x + w * 0.74 - kw / 2;
      const ky = y + (h - kh) / 2;
      const rr = Math.max(2.5, Math.min(kw, kh) * 0.16);
      cook = `<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="3" class="viz-cook"/>` +
        [[0.28, 0.3], [0.72, 0.3], [0.28, 0.72], [0.72, 0.72]].map(([a, b]) => `<circle cx="${kx + kw * a}" cy="${ky + kh * b}" r="${rr}" class="viz-burner"/>`).join('');
    }

    const grade = p.tipo === 'piso'
      ? Array.from({ length: Math.floor(c / 60) }, (_, i) => `<path d="M${x + (i + 1) * 60 * s} ${y}V${y + h}" class="viz-grid"/>`).join('') +
        Array.from({ length: Math.floor(l / 60) }, (_, i) => `<path d="M${x} ${y + (i + 1) * 60 * s}H${x + w}" class="viz-grid"/>`).join('')
      : '';

    const dimY = y - fh - 16;
    const legenda = `<text x="200" y="${Math.min(262, y + h + sh + 38)}" text-anchor="middle" class="viz-txt viz-txt--soft">${esc(mat.nome)}</text>`;
    return `${defs}${fr}${slab}${grade}${meia}${sa}${cuba}${cook}
      <path d="M${x} ${dimY}H${x + w}" class="viz-dim" marker-start="url(#viz-seta)" marker-end="url(#viz-seta)"/>
      <text x="200" y="${dimY - 6}" text-anchor="middle" class="viz-txt">${fmt(p.comprimento)} cm</text>
      <path d="M${x + w + 14} ${y}V${y + h}" class="viz-dim" marker-start="url(#viz-seta)" marker-end="url(#viz-seta)"/>
      <text x="${x + w + 22}" y="${y + h / 2}" class="viz-txt" dominant-baseline="middle">${fmt(p.largura)}</text>
      ${legenda}`;
  }

  const fmtNum = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const fmt = (n: number) => fmtNum.format(n);

  /* ---------------------------------------------------------------- comparador */

  const COMPARA = [
    { id: 'sao-gabriel', rotulo: 'Granito', pros: ['Resiste a calor e risco', 'Melhor custo-benefício'], contras: ['Pode manchar sem selagem', 'Padrão varia entre chapas'] },
    { id: 'quartzo-branco', rotulo: 'Quartzo', pros: ['Não mancha, dispensa selagem', 'Padrão uniforme'], contras: ['Não aceita panela quente direto', 'Preço mais alto'] },
    { id: 'carrara', rotulo: 'Mármore', pros: ['Beleza única de pedra natural', 'Toque frio e elegante'], contras: ['Mancha e risca com facilidade', 'Pede selagem e cuidado com ácidos'] },
  ];
  const NOTAS: [keyof ReturnType<typeof getMaterial>['notas'], string][] = [
    ['mancha', 'Mancha'],
    ['risco', 'Risco'],
    ['calor', 'Calor'],
    ['manutencao', 'Manutenção'],
  ];

  function comparador(pecas: Peca[], atual: string) {
    const alvo = $('[data-calc-compare]');
    const categoriaAtual = getMaterial(atual).categoria;
    alvo.innerHTML = COMPARA.map((c) => {
      const mat = getMaterial(c.id);
      const t = totalComMaterial(pecas, c.id, estado.instalacao);
      const sua = mat.id === atual || mat.categoria === categoriaAtual;
      const dots = NOTAS.map(([k, nome]) => {
        const v = mat.notas[k];
        return `<li><span>${nome}</span><span class="calc-dots" role="img" aria-label="${v} de 5">${'●'.repeat(v)}<i>${'●'.repeat(5 - v)}</i></span></li>`;
      }).join('');
      return `<article class="calc-cmp${sua ? ' is-atual' : ''}">
        <header><span class="calc-cmp-tex" style="background-image:url(/tex/${mat.id}.svg)"></span><div><h4>${c.rotulo}</h4><p>${esc(mat.nome)}</p></div></header>
        <p class="calc-cmp-price">${formatFaixa(t.total)}</p>
        <ul class="calc-notas">${dots}</ul>
        <ul class="calc-pc calc-pc--pro">${c.pros.map((x) => `<li>${x}</li>`).join('')}</ul>
        <ul class="calc-pc calc-pc--con">${c.contras.map((x) => `<li>${x}</li>`).join('')}</ul>
        ${sua ? '<span class="calc-cmp-tag">Sua escolha</span>' : ''}
      </article>`;
    }).join('');
  }

  /* ---------------------------------------------------------------- WhatsApp */

  const listaAcab = (p: Peca): string[] => {
    const info = tipoInfo(p.tipo);
    const a: string[] = [];
    if (info.borda && p.borda !== 'reta') a.push(`borda ${BORDAS[p.borda].nome.toLowerCase()}`);
    if (info.saia && p.saia > 0) a.push(`saia de ${p.saia} cm`);
    if (info.saia && p.frontao > 0) a.push(`frontão de ${p.frontao} cm`);
    else if (info.rodabanca && p.rodabanca) a.push('rodabanca');
    if (info.cooktop && p.cooktop) a.push('recorte para cooktop');
    const cuba = info.cubaFixa ?? (info.cuba ? p.cuba : 'nenhuma');
    if (cuba !== 'nenhuma') a.push(`cuba ${CUBAS[cuba].nome.toLowerCase()}`);
    return a;
  };

  const medidas = (p: Peca) =>
    p.tipo === 'escada'
      ? `${p.degraus} degraus × ${fmt(p.comprimento)} cm de largura${p.espelho ? ' (com espelho)' : ''}`
      : `${fmt(p.comprimento)} × ${fmt(p.largura)} cm`;

  function mensagem(pecas: Peca[]): string {
    const t = calcularTotal(pecas, estado.instalacao);
    const linhas = [`Olá, {nome}! Fiz uma simulação no site e gostaria de um orçamento.`, '', '*Peças*'];
    pecas.forEach((p, i) => {
      linhas.push(`${i + 1}) ${tipoInfo(p.tipo).nome} — ${medidas(p)}`);
      linhas.push(`   Material: ${getMaterial(p.material).nome}`);
      const a = listaAcab(p);
      linhas.push(`   Acabamentos: ${a.length ? a.join(', ') : 'padrão'}`);
    });
    linhas.push(
      '',
      `Área total: ${formatM2(t.areaTotal)} (cerca de ${formatM2((t.areaComPerda.min + t.areaComPerda.max) / 2)} com perda de material)`,
      `Instalação: ${estado.instalacao ? 'inclusa' : 'não inclusa'}`,
      `*Faixa estimada: ${formatFaixa(t.total)}*`,
      '',
      'Valor estimado, a confirmar após a medição no local.',
    );
    return linhas.join('\n');
  }

  /* ---------------------------------------------------------------- render */

  let timerSr: number | undefined;

  function pecasAtivas(): Peca[] {
    const lista = [...estado.pecas];
    if (estado.sujo && pecaValida(estado.draft)) lista.push(estado.draft);
    return lista;
  }

  function render() {
    const pecas = pecasAtivas();
    const total = calcularTotal(pecas, estado.instalacao);
    const vazio = pecas.length === 0;

    numero($('[data-calc-min]'), total.total.min, formatBRL);
    numero($('[data-calc-max]'), total.total.max, formatBRL);
    numero($('[data-calc-area]'), total.areaTotal, formatM2);
    $('[data-calc-perda]').textContent = vazio ? '—' : `${formatM2(total.areaComPerda.min)} a ${formatM2(total.areaComPerda.max)}`;
    $('[data-calc-material]').textContent = vazio ? '—' : formatFaixa(total.material);
    $('[data-calc-acab]').textContent = vazio ? '—' : total.acabamentos.max === 0 ? 'Sem acabamentos extras' : formatFaixa(total.acabamentos);
    $('[data-calc-inst]').textContent = vazio ? '—' : estado.instalacao ? formatFaixa(total.instalacao) : 'Não inclusa';

    // lista de peças
    const ul = $('[data-calc-list]');
    ul.innerHTML = '';
    const linhaPeca = (p: Peca, i: number, rascunho: boolean) => {
      const r = calcularPeca(p);
      const li = document.createElement('li');
      li.className = 'calc-li' + (rascunho ? ' is-draft' : '');
      li.innerHTML = `<span class="calc-li-main"><strong>${i + 1}. ${tipoInfo(p.tipo).nome}${rascunho ? ' <em>em edição</em>' : ''}</strong><span>${medidas(p)} · ${esc(getMaterial(p.material).nome)}</span></span>
        <span class="calc-li-val">${formatFaixa(r.subtotal)}</span>`;
      if (!rascunho) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'calc-li-del';
        b.setAttribute('aria-label', `Remover peça ${i + 1}: ${tipoInfo(p.tipo).nome}`);
        b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
        b.addEventListener('click', () => {
          estado.pecas.splice(i, 1);
          estado.sujo = estado.pecas.length === 0 ? true : estado.sujo;
          render();
        });
        li.append(b);
      }
      return li;
    };
    estado.pecas.forEach((p, i) => ul.append(linhaPeca(p, i, false)));
    if (estado.sujo && pecaValida(estado.draft)) ul.append(linhaPeca(estado.draft, estado.pecas.length, true));
    if (vazio) {
      const li = document.createElement('li');
      li.className = 'calc-li calc-li--vazio';
      li.textContent = 'Informe as medidas para ver a estimativa.';
      ul.append(li);
    }

    // desenho: rascunho (ou última peça adicionada)
    const mostrar = estado.sujo && pecaValida(estado.draft) ? estado.draft : estado.pecas[estado.pecas.length - 1] ?? estado.draft;
    $('[data-calc-svg]').innerHTML = pecaValida(mostrar) ? desenhar(mostrar) : '';
    $('[data-calc-viz-cap]').textContent = pecaValida(mostrar)
      ? `${tipoInfo(mostrar.tipo).nome} · ${medidas(mostrar)} · desenho em proporção`
      : 'Informe as medidas para ver o desenho.';

    comparador(vazio ? [estado.draft].filter(pecaValida) : pecas, estado.draft.material);

    // WhatsApp
    const wa = $<HTMLAnchorElement>('[data-calc-wa]');
    if (vazio) {
      wa.setAttribute('aria-disabled', 'true');
      wa.href = linkWhats('Olá, {nome}! Gostaria de um orçamento em pedra.');
    } else {
      wa.removeAttribute('aria-disabled');
      wa.href = linkWhats(mensagem(pecas));
    }

    // leitor de tela, sem repetir a cada tecla
    clearTimeout(timerSr);
    timerSr = window.setTimeout(() => {
      $('[data-calc-sr]').textContent = vazio ? '' : `Faixa estimada de ${formatFaixa(total.total)} para ${formatM2(total.areaTotal)}.`;
    }, 700);
  }

  /* ---------------------------------------------------------------- passos (modo etapas) */

  function mostrarPasso(n: number) {
    estado.passo = Math.max(0, Math.min(4, n));
    $$<HTMLElement>('[data-step]').forEach((s) => (s.hidden = wizard && Number(s.dataset.step) !== estado.passo));
    $$<HTMLElement>('[data-goto]').forEach((b) => {
      const i = Number(b.dataset.goto);
      b.toggleAttribute('data-done', i < estado.passo);
      if (i === estado.passo) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    const barra = root.querySelector<HTMLElement>('[data-calc-progress]');
    barra?.style.setProperty('--passo', String(estado.passo));
    const prev = root.querySelector<HTMLButtonElement>('[data-calc-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-calc-next]');
    if (prev) prev.disabled = estado.passo === 0;
    if (next) next.hidden = estado.passo === 4;
  }

  /* ---------------------------------------------------------------- eventos */

  form.addEventListener('change', (e) => {
    const alvo = e.target as HTMLInputElement;
    if (alvo.name === 'tipo') {
      ajustarTipo(alvo.value as TipoPeca, true);
    }
    if (alvo.name === 'instalacao') estado.instalacao = alvo.value === 'sim';
    estado.draft = lerRascunho();
    estado.sujo = true;
    render();
  });
  form.addEventListener('input', (e) => {
    const alvo = e.target as HTMLInputElement;
    if (alvo.type === 'number') {
      estado.draft = lerRascunho();
      estado.sujo = true;
      render();
    }
  });

  // filtro de categoria dos materiais
  $$<HTMLButtonElement>('[data-calc-chips] button').forEach((b) =>
    b.addEventListener('click', () => {
      $$<HTMLButtonElement>('[data-calc-chips] button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.cat;
      $$<HTMLElement>('.calc-mat').forEach((m) => (m.hidden = f !== 'todos' && m.dataset.matCat !== f));
    }),
  );

  $('[data-calc-add]').addEventListener('click', () => {
    estado.draft = lerRascunho();
    if (!pecaValida(estado.draft)) {
      (form.elements.namedItem('comprimento') as HTMLInputElement).focus();
      return;
    }
    if (estado.sujo) estado.pecas.push({ ...estado.draft });
    estado.sujo = false;
    ajustarTipo(estado.draft.tipo, true);
    estado.draft = lerRascunho();
    mostrarPasso(0);
    render();
    root.querySelector('.calc-out')?.dispatchEvent(new CustomEvent('peca-adicionada'));
  });

  root.querySelector('[data-calc-prev]')?.addEventListener('click', () => mostrarPasso(estado.passo - 1));
  root.querySelector('[data-calc-next]')?.addEventListener('click', () => mostrarPasso(estado.passo + 1));
  $$<HTMLButtonElement>('[data-goto]').forEach((b) => b.addEventListener('click', () => mostrarPasso(Number(b.dataset.goto))));

  document.addEventListener('escolher-material', (e) => {
    const id = (e as CustomEvent<string>).detail;
    escreverCampo('material', id);
    estado.draft = lerRascunho();
    estado.sujo = true;
    render();
  });

  $('[data-calc-wa]').addEventListener('click', (e) => {
    if ((e.currentTarget as HTMLElement).getAttribute('aria-disabled') === 'true') {
      // sem peças válidas: abre a conversa genérica mesmo assim
    }
  });

  /* ---------------------------------------------------------------- início */

  ajustarTipo('bancada', false);
  estado.draft = lerRascunho();
  mostrarPasso(0);
  render();
  void biz;
}
