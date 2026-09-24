/**
 * Mede a fluidez do scroll com a CPU desacelerada, que é o que reproduz a
 * travada de celular num PC de desenvolvimento.
 *
 * O número que importa é o QUADRO MAIS LENTO, não a média: uma média de 55fps
 * com um pico de 300ms ainda é uma travada visível. A média esconde
 * exatamente o que o usuário reclama.
 *
 * uso: node perf-scroll.mjs <url> [--cpu N] [--mobile]
 */
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const url = args[0];
const cpu = Number(args[args.indexOf('--cpu') + 1]) || 4;
const mobile = args.includes('--mobile');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9800 + Math.floor(Math.random() * 400);

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-perf-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {
      /* subindo */
    }
    await sleep(250);
  }
  throw new Error('Edge não respondeu');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? {});
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const msgId = ++id;
    pending.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const ev = (m, p = {}) => send(m, p, sessionId);

await ev('Page.enable');
await ev('Runtime.enable');
await ev('Emulation.setDeviceMetricsOverride', {
  width: mobile ? 390 : 1440,
  height: mobile ? 844 : 900,
  deviceScaleFactor: mobile ? 3 : 1,
  mobile,
});
// A desaceleração é o coração do teste: sem ela um desktop moderno esconde
// qualquer problema de custo de main thread.
await ev('Emulation.setCPUThrottlingRate', { rate: cpu });

const t0 = Date.now();
await ev('Page.navigate', { url });
await sleep(4000);

// Métricas de carga
const carga = await ev('Runtime.evaluate', {
  expression: `(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paint = {};
    performance.getEntriesByType('paint').forEach(p => paint[p.name] = Math.round(p.startTime));
    const rec = performance.getEntriesByType('resource');
    const soma = (f) => Math.round(rec.filter(f).reduce((a,r)=>a+(r.encodedBodySize||0),0)/1024);
    return JSON.stringify({
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      load: Math.round(nav.loadEventEnd || 0),
      firstPaint: paint['first-paint'] ?? null,
      firstContentfulPaint: paint['first-contentful-paint'] ?? null,
      recursos: rec.length,
      kbJS: soma(r => r.name.endsWith('.js')),
      kbCSS: soma(r => r.name.endsWith('.css')),
      kbFonte: soma(r => /\\.(woff2?|ttf)/.test(r.name)),
      kbImagem: soma(r => /\\.(webp|jpe?g|png|avif|svg)/.test(r.name)),
    });
  })()`,
  returnByValue: true,
});
console.log('\n── CARGA ' + '─'.repeat(50));
console.log(`CPU desacelerada ${cpu}x · ${mobile ? 'mobile 390px' : 'desktop 1440px'}`);
const c = JSON.parse(carga.result.value);
for (const [k, v] of Object.entries(c)) console.log(`  ${k.padEnd(22)} ${v}`);

// Scroll medindo cada quadro. Rolamos por rAF, imitando um scroll contínuo.
const fps = await ev('Runtime.evaluate', {
  expression: `new Promise((resolve) => {
    const quadros = [];
    let anterior = performance.now();
    let y = 0;
    const passo = 22;
    const fim = document.body.scrollHeight - window.innerHeight;
    function tick(agora) {
      quadros.push(agora - anterior);
      anterior = agora;
      y += passo;
      window.scrollTo(0, y);
      if (y < fim && quadros.length < 700) requestAnimationFrame(tick);
      else {
        // O primeiro quadro mede o tempo até o rAF engatar, não o scroll.
        const q = quadros.slice(1).sort((a,b) => a-b);
        const p = (n) => Math.round(q[Math.floor(q.length * n)] * 10) / 10;
        resolve(JSON.stringify({
          quadros: q.length,
          medianaMs: p(0.5),
          p95ms: p(0.95),
          piorMs: Math.round(q[q.length-1] * 10) / 10,
          acimaDe16ms: q.filter(v => v > 16.7).length,
          acimaDe50ms: q.filter(v => v > 50).length,
        }));
      }
    }
    requestAnimationFrame(tick);
  })`,
  awaitPromise: true,
  returnByValue: true,
});
console.log('\n── SCROLL ' + '─'.repeat(49));
const f = JSON.parse(fps.result.value);
for (const [k, v] of Object.entries(f)) console.log(`  ${k.padEnd(22)} ${v}`);
const ruim = f.acimaDe50ms > 0 || f.p95ms > 24;
console.log(
  `\n  veredito: ${ruim ? 'TRAVA — quadros longos durante o scroll' : 'fluido'}`,
);
console.log(`  tempo total do teste: ${Date.now() - t0}ms\n`);

ws.close();
edge.kill();
process.exit(0);
