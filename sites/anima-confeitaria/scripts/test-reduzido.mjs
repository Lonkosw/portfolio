/**
 * Movimento reduzido na Ânima Confeitaria.
 *
 * O `tools/test-reduced.mjs` genérico procura os seletores do orçamento da
 * DolceCau e acusa falha aqui sem que haja nada quebrado. Este cobre o que
 * ESTE site tem:
 *
 *  1. o TÍTULO DO HERO é quebrado em três <span>. Se o `display: block` ficar
 *     preso atrás da classe de animação, as linhas colam numa só ("Cada
 *     docesai da mãode alguém"). Foi bug real no Concetto, encontrado aqui
 *     também na inversão para o escuro — este teste é a trava contra voltar;
 *  2. o ORÇAMENTO tem de continuar utilizável: usar não é animar;
 *  3. nada da página pode ficar invisível esperando um gatilho que, sem
 *     animação, nunca chega.
 *
 * uso: node sites/anima-confeitaria/scripts/test-reduzido.mjs <url>
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
    `--user-data-dir=${process.env.TEMP}\\ed-red-an-${PORT}`,
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

// 2. O orçamento continua utilizável — usar não é animar.
const orc = JSON.parse(
  await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    if (!raiz) return JSON.stringify({ erro: true });
    raiz.querySelector('[data-orc-ocasiao]').click();
    const itens = raiz.querySelectorAll('[data-orc-item]');
    itens[0].click();
    return JSON.stringify({
      ocasiaoMarcada: raiz.querySelector('[data-orc-ocasiao]').checked,
      itemMarcado: itens[0].checked,
      previa: raiz.querySelector('[data-orc-previa]').textContent.trim().length,
      resumo: raiz.querySelector('[data-orc-resumo]').textContent.trim().length,
      cta: raiz.querySelector('[data-orc-cta]').href.startsWith('https://wa.me/'),
    });
  })()`),
);
checar(!orc.erro, 'a seção de orçamento existe');
checar(orc.ocasiaoMarcada, 'o rótulo de ocasião aceita clique');
checar(orc.itemMarcado, 'o item aceita clique');
checar(orc.previa > 20, 'a prévia da mensagem é escrita', String(orc.previa));
checar(orc.resumo > 5, 'o resumo curto é escrito', String(orc.resumo));
checar(orc.cta, 'o CTA vira link de WhatsApp');

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
