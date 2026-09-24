/**
 * O QA do usuário chato.
 *
 * Não mede performance nem contraste (há ferramentas próprias para isso).
 * Este procura as coisas que fazem alguém pensar "que site mal feito" sem
 * saber explicar por quê:
 *
 *   · âncora que para atrás do cabeçalho fixo, cortando o título;
 *   · texto que estoura o contêiner ou vaza para fora da tela;
 *   · botão que não leva a lugar nenhum (href="#", vazio ou quebrado);
 *   · alvo de toque menor que 44px;
 *   · imagem sem alt, ou com alt igual ao nome do arquivo;
 *   · texto minúsculo;
 *   · elemento que encosta na borda da tela sem respiro;
 *   · fonte que não carregou (fallback aparecendo no lugar da certa);
 *   · acentuação quebrada.
 *
 * uso: node qa-chato.mjs <url> [largura] [altura]
 */
import { spawn } from 'node:child_process';

const url = process.argv[2];
const largura = Number(process.argv[3]) || 1440;
const altura = Number(process.argv[4]) || 900;

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9000 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-qa-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    if (j.webSocketDebuggerUrl) { wsUrl = j.webSocketDebuggerUrl; break; }
  } catch { /* subindo */ }
  await sleep(250);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? {}); pend.delete(m.id); }
};
const send = (me, pa = {}, s) =>
  new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, pa = {}) => send(m, pa, sessionId);

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', {
  width: largura, height: altura, deviceScaleFactor: 1, mobile: largura < 700,
});
await cdp('Page.navigate', { url });
await sleep(3500);

async function js(expressao) {
  const r = await cdp('Runtime.evaluate', {
    expression: expressao, returnByValue: true, awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'erro');
  return r.result.value;
}

// Rola a página inteira para acordar o lazy-load e o content-visibility.
const alturaPagina = await js('document.body.scrollHeight');
for (let y = 0; y < alturaPagina; y += Math.round(altura * 0.8)) {
  await js(`window.scrollTo(0,${y})`);
  await sleep(120);
}
await js('window.scrollTo(0,0)');
await sleep(800);

let problemas = 0;
const bloco = (titulo) => console.log(`\n── ${titulo} ${'─'.repeat(Math.max(0, 58 - titulo.length))}`);
const ok = (t) => console.log(`  ok    ${t}`);
const erro = (t, detalhes = []) => {
  console.log(`  ERRO  ${t}`);
  detalhes.slice(0, 6).forEach((d) => console.log(`          · ${d}`));
  problemas++;
};

/* ── 1. Âncoras atrás do cabeçalho ─────────────────────────────────── */
bloco('1. ÂNCORAS PARAM NO LUGAR CERTO');
const anc = JSON.parse(await js(`(async () => {
  const alvos = [...document.querySelectorAll('a[href^="#"]')]
    .map(a => a.getAttribute('href'))
    .filter(h => h && h !== '#');
  const unicos = [...new Set(alvos)];
  const header = document.querySelector('[data-header]');
  const hAltura = header ? header.getBoundingClientRect().height : 0;
  const ruins = [], faltando = [];
  for (const href of unicos) {
    const el = document.querySelector(href);
    if (!el) { faltando.push(href); continue; }
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    await new Promise(r => setTimeout(r, 260));
    const top = el.getBoundingClientRect().top;
    // O topo da seção tem de ficar ABAIXO do cabeçalho, com folga.
    if (top < hAltura - 4) ruins.push(href + ' (topo em ' + Math.round(top) + 'px, cabeçalho ocupa ' + Math.round(hAltura) + 'px)');
  }
  window.scrollTo(0,0);
  return JSON.stringify({ testadas: unicos.length, ruins, faltando, hAltura: Math.round(hAltura) });
})()`));
if (anc.faltando.length) erro(`${anc.faltando.length} âncora(s) apontam para id inexistente`, anc.faltando);
else ok(`as ${anc.testadas} âncoras existem`);
if (anc.ruins.length) erro(`${anc.ruins.length} seção(ões) param atrás do cabeçalho`, anc.ruins);
else ok(`nenhuma seção fica escondida atrás do cabeçalho (${anc.hAltura}px)`);

/* ── 2. Links e botões que não fazem nada ──────────────────────────── */
bloco('2. TODO BOTÃO LEVA A ALGUM LUGAR');
const links = JSON.parse(await js(`(() => {
  const mortos = [], semRel = [], vazios = [];
  document.querySelectorAll('a').forEach(a => {
    const h = a.getAttribute('href');
    const txt = (a.textContent || '').trim() || a.getAttribute('aria-label') || '';
    if (!h || h === '#' || h === 'javascript:void(0)') mortos.push(txt.slice(0,40) || '(sem texto)');
    if (a.target === '_blank' && !(a.rel||'').includes('noopener')) semRel.push(txt.slice(0,40));
    if (!txt) vazios.push(h || '(sem href)');
  });
  const botoesMortos = [];
  document.querySelectorAll('button').forEach(b => {
    const txt = (b.textContent||'').trim() || b.getAttribute('aria-label') || '';
    if (!txt) botoesMortos.push('(botão sem rótulo nem aria-label)');
  });
  return JSON.stringify({ mortos, semRel, vazios, botoesMortos,
    totalLinks: document.querySelectorAll('a').length });
})()`));
if (links.mortos.length) erro(`${links.mortos.length} link(s) sem destino`, links.mortos);
else ok(`os ${links.totalLinks} links têm destino`);
if (links.semRel.length) erro(`${links.semRel.length} link(s) abrem aba nova sem noopener`, links.semRel);
else ok('todo link de aba nova tem rel="noopener"');
if (links.vazios.length) erro(`${links.vazios.length} link(s) sem texto nem rótulo`, links.vazios);
else ok('todo link tem texto ou aria-label');
if (links.botoesMortos.length) erro(`${links.botoesMortos.length} botão(ões) sem rótulo`, links.botoesMortos);
else ok('todo botão tem rótulo');

/* ── 3. Alvos de toque ─────────────────────────────────────────────── */
bloco('3. DÁ PARA ACERTAR COM O DEDO');
const toque = JSON.parse(await js(`(() => {
  const pequenos = [];
  document.querySelectorAll('a, button, input, select, [role=tab]').forEach(el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    // sr-only: o alvo real é o rótulo que embrulha, não o input de 1px.
    if (r.width <= 1 || r.height <= 1) return;
    if (r.height < 44 || r.width < 44) {
      const txt = (el.textContent||'').trim().slice(0,28) || el.getAttribute('aria-label') || el.tagName;
      pequenos.push(txt + ' → ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  });
  return JSON.stringify(pequenos);
})()`));
if (toque.length) erro(`${toque.length} alvo(s) abaixo de 44px`, toque);
else ok('todo alvo interativo tem pelo menos 44px');

/* ── 4. Imagens ────────────────────────────────────────────────────── */
bloco('4. IMAGENS DESCRITAS E NO TAMANHO CERTO');
const imgs = JSON.parse(await js(`(() => {
  const semAlt = [], altRuim = [], semDimensao = [];
  document.querySelectorAll('img').forEach(i => {
    const alt = i.getAttribute('alt');
    const arq = (i.currentSrc||'').split('/').pop().split('.')[0];
    if (alt === null) semAlt.push(arq);
    else if (alt && arq && alt.toLowerCase().replace(/[^a-z]/g,'') === arq.toLowerCase().replace(/[^a-z]/g,''))
      altRuim.push(arq + ' (alt = nome do arquivo)');
    if (!i.getAttribute('width') && !i.getAttribute('height')
        && getComputedStyle(i).aspectRatio === 'auto') semDimensao.push(arq);
  });
  return JSON.stringify({ semAlt, altRuim, semDimensao, total: document.images.length });
})()`));
if (imgs.semAlt.length) erro(`${imgs.semAlt.length} imagem(ns) sem alt`, imgs.semAlt);
else ok(`as ${imgs.total} imagens têm alt`);
if (imgs.altRuim.length) erro('alt repetindo o nome do arquivo', imgs.altRuim);
else ok('nenhum alt é só o nome do arquivo');
if (imgs.semDimensao.length) erro(`${imgs.semDimensao.length} imagem(ns) sem dimensão reservada (causa CLS)`, imgs.semDimensao);
else ok('toda imagem reserva o próprio espaço');

/* ── 5. Texto que vaza ou some ─────────────────────────────────────── */
bloco('5. NADA VAZA NEM ENCOSTA NA BORDA');
const layout = JSON.parse(await js(`(() => {
  const vw = document.documentElement.clientWidth;
  const vazando = [], colado = [];
  // Um elemento dentro de contêiner com overflow escondido (marquee,
  // carrossel) passar da borda é o COMPORTAMENTO PRETENDIDO — a faixa
  // rolante é mais larga que a tela por definição. O que importa é se a
  // PÁGINA rola na horizontal, e isso é medido à parte.
  const recortado = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };
  // Texto visualmente escondido (skip link antes do foco) não está na tela.
  const invisivelAteFoco = (el) => {
    const s = getComputedStyle(el);
    return s.clipPath === 'inset(50%)' || s.clip === 'rect(0px, 0px, 0px, 0px)'
      || el.closest('.sr-only') !== null;
  };

  document.querySelectorAll('h1,h2,h3,h4,p,li,span,a,button').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (invisivelAteFoco(el)) return;
    if (r.right > vw + 1 && !recortado(el))
      vazando.push(el.tagName + ' "' + (el.textContent||'').trim().slice(0,26) + '" até ' + Math.round(r.right));
    // Encostar na borda esquerda sem respiro só é problema em texto.
    if (r.left < 4 && el.textContent && el.textContent.trim().length > 3
        && !el.closest('[aria-hidden=true]') && !recortado(el)) {
      colado.push(el.tagName + ' "' + el.textContent.trim().slice(0,26) + '"');
    }
  });
  return JSON.stringify({
    vazando: vazando.slice(0,8), colado: colado.slice(0,8),
    overflow: document.documentElement.scrollWidth - vw, vw
  });
})()`));
if (layout.overflow > 0) erro(`a página rola ${layout.overflow}px na horizontal`);
else ok(`sem rolagem horizontal em ${layout.vw}px`);
if (layout.vazando.length) erro(`${layout.vazando.length} elemento(s) passam da borda direita`, layout.vazando);
else ok('nada passa da borda direita');
if (layout.colado.length) erro(`${layout.colado.length} texto(s) encostam na borda esquerda`, layout.colado);
else ok('nenhum texto encosta na borda');

/* ── 6. Tipografia ─────────────────────────────────────────────────── */
bloco('6. DÁ PARA LER');
const tipo = JSON.parse(await js(`(() => {
  const miudos = {}, fontes = new Set();
  document.querySelectorAll('p,li,span,a,button,h1,h2,h3,h4,label,legend,figcaption,dt,dd').forEach(el => {
    if (!el.textContent.trim() || el.children.length) return;
    const s = getComputedStyle(el);
    if (s.display === 'none') return;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return;
    const px = parseFloat(s.fontSize);
    if (px < 12) miudos[px] = (miudos[px]||0)+1;
    fontes.add(s.fontFamily.split(',')[0].replace(/['"]/g,'').trim());
  });
  // A acentuação chegou inteira até a tela?
  const corpo = document.body.innerText;
  const mojibake = /Ã[\\u0080-\\u00bf]|â€|Â[\\u0080-\\u00bf]/.test(corpo);
  const temAcento = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(corpo);
  return JSON.stringify({ miudos, fontes: [...fontes], mojibake, temAcento });
})()`));
const chavesMiudas = Object.keys(tipo.miudos);
if (chavesMiudas.length) erro('texto abaixo de 12px', chavesMiudas.map(k => `${k}px em ${tipo.miudos[k]} elemento(s)`));
else ok('nenhum texto abaixo de 12px');
if (tipo.mojibake) erro('ACENTUAÇÃO CORROMPIDA na página');
else ok('acentuação íntegra' + (tipo.temAcento ? ' (e há acentos na página)' : ''));
console.log(`  info  fontes em uso: ${tipo.fontes.join(', ')}`);

/* ── 7. Estrutura ──────────────────────────────────────────────────── */
bloco('7. ESTRUTURA DA PÁGINA');
const est = JSON.parse(await js(`(() => {
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
  const pulos = [];
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i-1] > 1) pulos.push('h' + hs[i-1] + ' → h' + hs[i]);
  const idsDuplicados = [];
  const vistos = new Set();
  document.querySelectorAll('[id]').forEach(el => {
    if (vistos.has(el.id)) idsDuplicados.push(el.id);
    vistos.add(el.id);
  });
  return JSON.stringify({
    h1: document.querySelectorAll('h1').length,
    pulos, idsDuplicados,
    temMain: !!document.querySelector('main'),
    lang: document.documentElement.lang || '(vazio)',
    titulo: document.title.length,
  });
})()`));
if (est.h1 !== 1) erro(`a página tem ${est.h1} <h1> (deve ter exatamente 1)`);
else ok('exatamente um <h1>');
if (est.pulos.length) erro('hierarquia de títulos pula nível', est.pulos);
else ok('hierarquia de títulos sem pulos');
if (est.idsDuplicados.length) erro('id duplicado no HTML', est.idsDuplicados);
else ok('nenhum id duplicado');
if (!est.temMain) erro('não há <main>');
else ok(`<main> presente, lang="${est.lang}", título com ${est.titulo} caracteres`);

console.log('\n' + '═'.repeat(66));
console.log(problemas ? `  ${problemas} PROBLEMA(S) — corrigir antes de mostrar` : '  Nada a reclamar.');
console.log('═'.repeat(66) + '\n');

ws.close();
edge.kill();
process.exit(problemas ? 1 : 0);
