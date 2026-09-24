/** Captura seções específicas por âncora, em tela de celular. */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const url = process.argv[2];
const width = 375, height = 812;
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9950 + Math.floor(Math.random() * 40);
const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edge-sec-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('Edge não subiu');
}
const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => ((ws.onopen = res), (ws.onerror = rej)));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); } };
const send = (method, params = {}, sessionId) => new Promise((res) => {
  const n = ++id; pending.set(n, res);
  ws.send(JSON.stringify({ id: n, method, params, sessionId })); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride',
  { width, height, deviceScaleFactor: 2, mobile: true }, sessionId);
const ev = async (x) => (await send('Runtime.evaluate',
  { expression: x, returnByValue: true }, sessionId)).result?.value;

await send('Page.navigate', { url }, sessionId);
await sleep(3000);
await ev(`(() => { const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 500) window.scrollTo(0, y); })()`);
await sleep(2500);

const alvos = [
  ['sobre', '#sobre'],
  ['especialidades', '#especialidades'],
  ['cardapio', '#cardapio'],
  ['criacoes', '#criacoes'],
  ['processo', '#processo'],
  ['depoimentos', '[data-reveal] .border-dashed, section:has(.border-dashed)'],
  ['orcamento', '#orcamento'],
  ['rodape', 'footer'],
];

for (const [nome, sel] of alvos) {
  const achou = await ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)});
    if (!el) return false;
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' });
    return true; })()`);
  if (!achou) { console.log('não achei:', nome); continue; }
  await sleep(700);
  const s = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(`sec-${nome}.png`, Buffer.from(s.data, 'base64'));
  console.log('ok:', nome);
}

// Alvos de toque, agora com o rodapé já corrigido
console.log('\n=== alvos < 44px de altura ===');
console.log(await ev(`(() => {
  const p = [];
  document.querySelectorAll('a, button, input').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.height < 44) p.push((el.textContent || el.getAttribute('aria-label') || '').trim().slice(0,34)
      + ' → ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return JSON.stringify(p, null, 1);
})()`));

ws.close(); edge.kill(); process.exit(0);
