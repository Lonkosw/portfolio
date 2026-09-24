/**
 * Movimento reduzido no Concetto di Bellezza.
 *
 * O que este site tem de específico e o test-reduced.mjs genérico não cobre:
 *
 *  1. os DEPOIMENTOS são a única seção cuja informação chega por animação.
 *     Se os balões continuarem invisíveis com reduced-motion, a seção vira um
 *     retângulo verde vazio — e o site perde a prova social inteira;
 *  2. o TÍTULO DO HERO é quebrado em dois <span>. Se o `display: block` ficar
 *     preso atrás da classe de animação, as linhas colam ("Beleza nãose
 *     improvisa"). Foi um bug real, e este teste é a trava contra ele voltar;
 *  3. o indicador de "digitando" tem de SUMIR, não ficar parado na tela.
 *
 * uso: node test-reduzido-cb.mjs <url>
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
    `--user-data-dir=${process.env.TEMP}\\ed-red-${PORT}`,
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

// 1. O título do hero em DUAS linhas de verdade.
const linhas = JSON.parse(
  await js(`JSON.stringify(
    [...document.querySelectorAll('[data-hero-linha]')].map(e => ({
      display: getComputedStyle(e).display,
      topo: Math.round(e.getBoundingClientRect().top),
      texto: e.textContent.trim(),
    }))
  )`),
);
checar(linhas.length === 2, 'o título tem 2 linhas', String(linhas.length));
checar(
  linhas.every((l) => l.display === 'block'),
  'cada linha é bloco (não colam numa só)',
  linhas.map((l) => l.display).join(', '),
);
checar(
  linhas.length === 2 && linhas[1].topo > linhas[0].topo,
  'a segunda linha fica ABAIXO da primeira',
  linhas.length === 2 ? `${linhas[0].topo} → ${linhas[1].topo}` : '',
);

// 2. Os depoimentos precisam estar LEGÍVEIS sem nenhuma animação.
await js(`document.querySelector('#depoimentos').scrollIntoView()`);
await sleep(1200);
const baloes = JSON.parse(
  await js(`JSON.stringify(
    [...document.querySelectorAll('[data-balao]')].map(e => {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return { op: Number(s.opacity), tf: s.transform, larg: Math.round(r.width), txt: e.textContent.trim().slice(0, 28) };
    })
  )`),
);
checar(baloes.length === 8, 'os 8 balões existem no HTML', String(baloes.length));
checar(
  baloes.every((b) => b.op === 1),
  'TODO balão está visível (opacity 1)',
  baloes.filter((b) => b.op !== 1).map((b) => b.txt).join(' | '),
);
checar(
  baloes.every((b) => b.tf === 'none' || b.tf === 'matrix(1, 0, 0, 1, 0, 0)'),
  'nenhum balão ficou deslocado',
  baloes.filter((b) => b.tf !== 'none' && b.tf !== 'matrix(1, 0, 0, 1, 0, 0)').length + ' fora do lugar',
);
checar(
  baloes.every((b) => b.larg > 60),
  'todo balão tem largura de verdade',
);

// 3. O indicador de "digitando" sai de cena — parado ele não comunica nada.
const digitando = JSON.parse(
  await js(`JSON.stringify(
    [...document.querySelectorAll('[data-digitando]')].map(e => getComputedStyle(e).display)
  )`),
);
checar(
  digitando.length > 0 && digitando.every((d) => d === 'none'),
  'o "digitando" some (não fica parado de enfeite)',
  digitando.join(', '),
);

// 4. As ferramentas continuam funcionando — usar não é animar.
const ferramentas = JSON.parse(
  await js(`(() => {
    const d = document.querySelector('[data-diag]');
    const p = document.querySelector('[data-prod]');
    const a = document.querySelector('[data-agenda]');
    if (!d || !p || !a) return JSON.stringify({ erro: true });
    d.querySelector('[data-diag-campo]').click();
    p.querySelector('[data-prod-servico]').click();
    const g = p.querySelector('[data-prod-grupo]');
    g.querySelector('[data-prod-mais]').click();
    return JSON.stringify({
      diagMarcado: d.querySelector('[data-diag-campo]').checked,
      prodMarcado: p.querySelector('[data-prod-servico]').checked,
      contador: g.querySelector('[data-prod-valor]').textContent.trim(),
      previa: p.querySelector('[data-prod-previa]').textContent.trim().length,
      cta: p.querySelector('[data-prod-cta]').href.startsWith('https://wa.me/'),
    });
  })()`),
);
checar(!ferramentas.erro, 'as três ferramentas existem');
checar(ferramentas.diagMarcado, 'diagnóstico aceita resposta');
checar(ferramentas.prodMarcado, 'montador aceita serviço');
checar(ferramentas.contador === '1', 'botão "+" do montador conta', ferramentas.contador);
checar(ferramentas.previa > 20, 'a prévia da mensagem é escrita', String(ferramentas.previa));
checar(ferramentas.cta, 'o CTA vira link de WhatsApp');

// 5. Nada da página ficou invisível esperando um gatilho que não vem.
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
