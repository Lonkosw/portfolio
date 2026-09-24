/** O orçamento tem de funcionar com prefers-reduced-motion, onde o init()
 *  de motion.ts sai antes de instalar as animações. */
import { spawn } from 'node:child_process';

const url = process.argv[2];
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9800 + Math.floor(Math.random() * 150);
const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--force-prefers-reduced-motion',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edge-rm-${PORT}`, 'about:blank',
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
  { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
const ev = async (expression) => (await send('Runtime.evaluate',
  { expression, returnByValue: true }, sessionId)).result?.value;

await send('Page.navigate', { url }, sessionId);
await sleep(3000);

const r = [];
const ok = (n, c, x = '') => r.push(`${c ? 'PASS' : 'FALHA'}  ${n}${x ? '  ' + x : ''}`);

ok('reduced-motion realmente ativo',
  await ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`));
ok('conteúdo visível (js-anim removido)',
  await ev(`!document.documentElement.classList.contains('js-anim')`));

await ev(`document.querySelector('[data-orc-add]').click()`);
await sleep(300);
ok('adicionar funciona com reduced-motion',
  (await ev(`document.querySelector('[data-orc-qtd]').value`)) === '25');
ok('botão flutuante aparece',
  (await ev(`document.querySelector('[data-orc-abrir]').hidden`)) === false);

await ev(`document.querySelector('[data-orc-abrir]').click()`);
await sleep(500);
ok('painel abre', await ev(`document.querySelector('[data-orc-painel]').open === true`));
ok('link do WhatsApp montado',
  String(await ev(`document.querySelector('[data-orc-enviar]').href`)).includes('wa.me'));

console.log(r.join('\n'));
console.log('\n' + r.filter((x) => x.startsWith('PASS')).length + '/' + r.length + ' ok');
ws.close(); edge.kill();
process.exit(r.some((x) => x.startsWith('FALHA')) ? 1 : 0);
