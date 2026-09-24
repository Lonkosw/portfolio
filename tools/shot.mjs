/**
 * Screenshot com emulação real de device via CDP (sem dependências).
 * uso: node shot.mjs <url> <largura> <altura> <saida.png> [--motion]
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [url, wRaw, hRaw, out, ...rest] = process.argv.slice(2);
const width = Number(wRaw);
const height = Number(hRaw);
const reduceMotion = !rest.includes('--motion');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333 + Math.floor(Math.random() * 400);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edge-cdp-${PORT}`,
  'about:blank',
];
if (reduceMotion) args.unshift('--force-prefers-reduced-motion');

const edge = spawn(EDGE, args, { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {
      /* ainda subindo */
    }
    await sleep(250);
  }
  throw new Error('Edge não respondeu na porta de debug');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? {});
    pending.delete(msg.id);
  }
};

function send(method, params = {}, sessionId) {
  const msgId = ++id;
  return new Promise((res) => {
    pending.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
}

// Abre um alvo e anexa uma sessão
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

await send('Page.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
}, sessionId);

await send('Page.navigate', { url }, sessionId);
await sleep(2500);

// Rola a página em passos controlados pelo Node (nada de awaitPromise, que
// trava em páginas longas) para disparar o lazy-loading das imagens.
const { result: hRes } = await send(
  'Runtime.evaluate',
  { expression: 'document.body.scrollHeight', returnByValue: true },
  sessionId,
);
const pageHeight = Number(hRes.value) || height;
for (let y = 0; y < pageHeight; y += Math.round(height * 0.8)) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` }, sessionId);
  await sleep(150);
}
await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' }, sessionId);
await sleep(1500);

// Mede overflow real com o viewport já emulado
const { result } = await send(
  'Runtime.evaluate',
  {
    expression: `(() => {
      const vw = document.documentElement.clientWidth;
      const offenders = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.right > vw + 1) {
          offenders.push(el.tagName + '.' + String(el.className).slice(0,60) + ' right=' + Math.round(r.right));
        }
      });
      return JSON.stringify({
        viewport: vw,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth - vw,
        offenders: offenders.slice(0, 12)
      }, null, 1);
    })()`,
    returnByValue: true,
  },
  sessionId,
);
console.log(result.value);

const shot = await send(
  'Page.captureScreenshot',
  { format: 'png', captureBeyondViewport: true },
  sessionId,
);
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('salvo ->', out);

ws.close();
edge.kill();
process.exit(0);
