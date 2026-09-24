/** Auditoria: âncoras resolvem? links de WhatsApp corretos? cinema montado? */
import { spawn } from 'node:child_process';

const url = process.argv[2];
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9050 + Math.floor(Math.random() * 120);

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-aud-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('sem Edge');
}
const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? {});
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send(
  'Emulation.setDeviceMetricsOverride',
  { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  sessionId,
);
await send('Page.navigate', { url }, sessionId);
await sleep(5000);

const { result } = await send(
  'Runtime.evaluate',
  {
    expression: `(() => {
      const anchors = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href'));
      const quebradas = [...new Set(anchors)].filter(h => h !== '#' && !document.querySelector(h));
      const wa = [...document.querySelectorAll('a[href*="wa.me"]')];
      const waRuins = wa.filter(a => !/wa\\.me\\/55\\d{10,11}\\?text=/.test(a.href));
      const ext = [...document.querySelectorAll('a[target="_blank"]')];
      const semRel = ext.filter(a => !(a.rel||'').includes('noopener'));
      return JSON.stringify({
        totalAncoras: anchors.length,
        ancorasUnicas: [...new Set(anchors)],
        ancorasQuebradas: quebradas,
        totalWhatsApp: wa.length,
        whatsappMalformados: waRuins.map(a => a.href).slice(0,3),
        externosSemNoopener: semRel.length,
        cinemaMontado: !!document.querySelector('.pin-spacer'),
        canvasDesenhado: (() => {
          const c = document.querySelector('[data-cinema-canvas]');
          if (!c) return false;
          const g = c.getContext('2d');
          const d = g.getImageData(c.width/2, c.height/2, 1, 1).data;
          return 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
        })(),
        heroTituloVisivel: (() => {
          const h = document.querySelector('[data-hero-title]');
          if (!h) return false;
          return getComputedStyle(h).opacity;
        })(),
        secoes: ['#topo','#sobre','#cardapio','#criacoes','#processo','#orcamento']
          .map(s => s + '=' + !!document.querySelector(s)).join(' '),
      }, null, 1);
    })()`,
    returnByValue: true,
  },
  sessionId,
);
console.log(result.value);

ws.close();
edge.kill();
process.exit(0);
