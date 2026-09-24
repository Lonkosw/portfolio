/**
 * Grava um trace do navegador durante o scroll e soma o tempo por tipo de
 * trabalho: script, estilo, layout, pintura, composição.
 *
 * O perf-scroll.mjs diz QUE trava; este diz POR QUÊ. Sem ele a gente fica
 * otimizando por palpite — foi o que quase aconteceu ao cortar o JS e o
 * pior quadro não melhorar.
 *
 * uso: node perf-trace.mjs <url> [--cpu N] [--mobile]
 */
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const url = args[0];
const cpu = Number(args[args.indexOf('--cpu') + 1]) || 4;
const mobile = args.includes('--mobile');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9200 + Math.floor(Math.random() * 400);

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-trace-${PORT}`,
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
const eventos = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === 'Tracing.dataCollected' && m.params?.value) eventos.push(...m.params.value);
  if (m.method === 'Tracing.tracingComplete') pending.get('trace-fim')?.();
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
await ev('Emulation.setCPUThrottlingRate', { rate: cpu });
await ev('Page.navigate', { url });
await sleep(4000);

// Só o trace do scroll: gravar a carga junto polui o total com o parse
// inicial, que não é o que o usuário chama de "travada".
await send('Tracing.start', {
  traceConfig: {
    includedCategories: ['devtools.timeline', 'blink.user_timing', 'disabled-by-default-devtools.timeline'],
  },
});

await ev('Runtime.evaluate', {
  expression: `new Promise((resolve) => {
    let y = 0;
    const fim = document.body.scrollHeight - window.innerHeight;
    function tick() {
      y += 22;
      window.scrollTo(0, y);
      if (y < fim) requestAnimationFrame(tick); else resolve(1);
    }
    requestAnimationFrame(tick);
  })`,
  awaitPromise: true,
});

const fim = new Promise((r) => pending.set('trace-fim', r));
await send('Tracing.end');
await fim;

// Soma por tipo. `dur` vem em microssegundos.
const BALDES = {
  Script: ['FunctionCall', 'EvaluateScript', 'v8.callFunction', 'TimerFire', 'EventDispatch', 'RunMicrotasks'],
  Estilo: ['UpdateLayoutTree', 'ParseAuthorStyleSheet', 'ScheduleStyleRecalculation'],
  Layout: ['Layout', 'InvalidateLayout', 'UpdateLayerTree'],
  Pintura: ['Paint', 'PaintImage', 'Decode Image', 'ImageDecodeTask', 'Rasterize', 'RasterTask', 'DecodeImage'],
  Composicao: ['CompositeLayers', 'Commit'],
};
const totais = {};
const porNome = {};
for (const e of eventos) {
  if (typeof e.dur !== 'number' || !e.name) continue;
  const ms = e.dur / 1000;
  porNome[e.name] = (porNome[e.name] || 0) + ms;
  for (const [balde, nomes] of Object.entries(BALDES)) {
    if (nomes.includes(e.name)) totais[balde] = (totais[balde] || 0) + ms;
  }
}

console.log(`\n── ONDE O TEMPO É GASTO NO SCROLL (cpu ${cpu}x, ${mobile ? 'mobile' : 'desktop'}) ──`);
for (const [k, v] of Object.entries(totais).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(14)} ${Math.round(v).toString().padStart(6)} ms`);
}
console.log('\n  eventos mais caros individualmente:');
Object.entries(porNome)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 14)
  .forEach(([n, v]) => console.log(`    ${n.padEnd(34)} ${Math.round(v).toString().padStart(6)} ms`));

ws.close();
edge.kill();
process.exit(0);
