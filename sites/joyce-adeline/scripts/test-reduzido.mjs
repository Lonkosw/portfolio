/**
 * Movimento reduzido no site da Joyce Adeline.
 *
 * O `tools/test-reduced.mjs` genérico procura os seletores do orçamento da
 * DolceCau e acusa falha aqui sem que haja nada quebrado. Este cobre o que
 * ESTE site tem — e o site tem pouca coisa, de propósito:
 *
 *  1. o TÍTULO DO HERO é quebrado em três <span>. Se o `display: block`
 *     ficar preso atrás da classe de animação, as linhas colam numa só
 *     ("O diaque naovolta"). O bug já apareceu duas vezes no portfólio, em
 *     sites diferentes: esta é a trava;
 *  2. as 12 FOTOS DO PORTFÓLIO precisam estar visíveis. Elas entram com
 *     `[data-reveal-grupo]`, que é opacidade zero até o gatilho — sem
 *     animação, um gatilho que não dispara deixaria a galeria inteira em
 *     branco, e a galeria é o site;
 *  3. nada mais pode ficar invisível esperando gatilho.
 *
 * uso: node sites/joyce-adeline/scripts/test-reduzido.mjs <url>
 */
import { spawn } from 'node:child_process';

const url = process.argv[2];
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9820 + Math.floor(Math.random() * 120);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--hide-scrollbars',
    '--force-prefers-reduced-motion',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\ed-red-jo-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    if (j.webSocketDebuggerUrl) {
      wsUrl = j.webSocketDebuggerUrl;
      break;
    }
  } catch {}
  await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    pend.get(m.id)(m.result ?? {});
    pend.delete(m.id);
  }
};
const send = (me, pa = {}, s) =>
  new Promise((r) => {
    const i = ++id;
    pend.set(i, r);
    ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s }));
  });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, pa = {}) => send(m, pa, sessionId);
const js = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true });
  return r.result?.value;
};

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await cdp('Page.navigate', { url });
await sleep(3000);

let falhas = 0;
const checar = (cond, nome, extra = '') => {
  console.log(`  ${cond ? 'ok   ' : 'FALHA'}  ${nome}${extra ? '  → ' + extra : ''}`);
  if (!cond) falhas++;
};

console.log('\n══ MOVIMENTO REDUZIDO ' + '═'.repeat(44));

checar(
  await js(`matchMedia('(prefers-reduced-motion: reduce)').matches`),
  'reduced-motion realmente ativo',
);
checar(
  !(await js(`document.documentElement.classList.contains('js-anim')`)),
  'js-anim removido do <html>',
);

// 1. O título do hero em TRÊS linhas de verdade.
const linhas = JSON.parse(
  await js(`JSON.stringify(
    [...document.querySelectorAll('[data-hero-linha]')].map(e => ({
      display: getComputedStyle(e).display,
      topo: Math.round(e.getBoundingClientRect().top),
      texto: e.textContent.trim(),
    }))
  )`),
);
checar(linhas.length === 3, 'o título tem 3 linhas', String(linhas.length));
checar(
  linhas.every((l) => l.display === 'block'),
  'cada linha é bloco (não colam numa só)',
  linhas.map((l) => l.display).join(', '),
);
checar(
  linhas.length === 3 && linhas[1].topo > linhas[0].topo && linhas[2].topo > linhas[1].topo,
  'cada linha fica ABAIXO da anterior',
  linhas.map((l) => l.topo).join(' → '),
);

// 2. A GALERIA precisa estar toda visível — é o site inteiro.
await js(`document.querySelector('#portfolio').scrollIntoView()`);
await sleep(1000);
const fotos = JSON.parse(
  await js(`JSON.stringify(
    [...document.querySelectorAll('#portfolio figure')].map(e => {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return { op: Number(s.opacity), larg: Math.round(r.width), alt: Math.round(r.height) };
    })
  )`),
);
checar(fotos.length === 12, 'as 12 fotos existem no HTML', String(fotos.length));
checar(
  fotos.every((f) => f.op === 1),
  'TODA foto está visível (opacity 1)',
  fotos.filter((f) => f.op !== 1).length + ' invisível(is)',
);
checar(
  fotos.every((f) => f.larg > 60 && f.alt > 60),
  'toda foto tem tamanho de verdade',
);

const imgs = await js(`
  [...document.querySelectorAll('#portfolio img')].filter(i => i.naturalWidth > 0).length
`);
checar(imgs === 12, 'as 12 imagens carregaram de fato', String(imgs));

// 3. Nada da página ficou invisível esperando um gatilho que não vem.
await js(`window.scrollTo(0, document.body.scrollHeight)`);
await sleep(1200);
const invisiveis = await js(`
  [...document.querySelectorAll('main *')].filter(e => {
    const s = getComputedStyle(e);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (!e.textContent.trim()) return false;
    return Number(s.opacity) < 0.15;
  }).length
`);
checar(invisiveis === 0, 'nenhum texto ficou preso invisível', String(invisiveis));

console.log('\n' + '═'.repeat(66));
console.log(falhas === 0 ? '  Movimento reduzido: tudo legível e utilizável.' : `  ${falhas} FALHA(S)`);
console.log('═'.repeat(66) + '\n');

ws.close();
edge.kill();
process.exit(falhas === 0 ? 0 : 1);
