/**
 * Inspeção de qualidade mobile: mede alinhamento, alvos de toque, overflow,
 * contraste de tamanho de fonte e captura a página em fatias.
 * uso: node qa-mobile.mjs <url> [largura] [altura]
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [url, wRaw = '375', hRaw = '812'] = process.argv.slice(2);
const width = Number(wRaw);
const height = Number(hRaw);

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9200 + Math.floor(Math.random() * 300);
const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edge-qa-${PORT}`, 'about:blank',
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

const ev = async (expression) => {
  const { result, exceptionDetails } = await send('Runtime.evaluate',
    { expression, returnByValue: true }, sessionId);
  if (exceptionDetails) throw new Error(exceptionDetails.text + ' @ ' + expression.slice(0, 80));
  return result?.value;
};

await send('Page.navigate', { url }, sessionId);
await sleep(3500);

// Força tudo visível (os reveals usam opacity/transform e atrapalham a medição)
await ev(`(() => { const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 500) window.scrollTo(0, y);
  window.scrollTo(0, 0); })()`);
await sleep(2000);

console.log('=== 1. OVERFLOW HORIZONTAL ===');
console.log(await ev(`(() => {
  const vw = document.documentElement.clientWidth;
  const fora = [];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      fora.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0,45)
        + ' [' + Math.round(r.left) + '→' + Math.round(r.right) + ']');
    }
  });
  return JSON.stringify({ viewport: vw, scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth - vw, elementos: fora.slice(0,10) }, null, 1);
})()`));

console.log('\n=== 2. ALVOS DE TOQUE MENORES QUE 44px ===');
console.log(await ev(`(() => {
  const pequenos = [];
  document.querySelectorAll('a, button, input, [role="button"]').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.height < 44 || r.width < 24) {
      pequenos.push((el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0,32)
        + ' → ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  });
  return JSON.stringify(pequenos.slice(0, 20), null, 1);
})()`));

console.log('\n=== 3. TEXTO ABAIXO DE 13px ===');
console.log(await ev(`(() => {
  const m = new Map();
  document.querySelectorAll('p, span, a, li, dd, dt, h1, h2, h3, h4, strong, em').forEach(el => {
    if (!el.textContent.trim() || el.children.length) return;
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    if (px < 13) {
      const k = px + 'px';
      m.set(k, (m.get(k) || 0) + 1);
    }
  });
  return JSON.stringify(Object.fromEntries(m), null, 1);
})()`));

console.log('\n=== 4. ALINHAMENTO: margens esquerda/direita das seções ===');
console.log(await ev(`(() => {
  const vw = innerWidth;
  const linhas = [];
  document.querySelectorAll('section').forEach(sec => {
    const shell = sec.querySelector('.shell') || sec;
    const filhos = [...shell.children].filter(c => {
      const cs = getComputedStyle(c);
      return cs.display !== 'none' && c.getBoundingClientRect().height > 0;
    });
    filhos.forEach(c => {
      const r = c.getBoundingClientRect();
      const esq = Math.round(r.left), dir = Math.round(vw - r.right);
      if (Math.abs(esq - dir) > 6) {
        linhas.push((sec.id || sec.className.slice(0,18)) + ' > ' + c.tagName.toLowerCase()
          + '.' + String(c.className).slice(0,30) + '  esq=' + esq + ' dir=' + dir);
      }
    });
  });
  return JSON.stringify(linhas.slice(0, 24), null, 1);
})()`));

console.log('\n=== 5. CENTRALIZAÇÃO DA MARCA NO TOPO ===');
console.log(await ev(`(() => {
  const logo = document.querySelector('header a[href="#topo"]');
  const r = logo.getBoundingClientRect();
  const centroLogo = (r.left + r.right) / 2;
  return JSON.stringify({ centroLogo: Math.round(centroLogo), centroTela: innerWidth / 2,
    desvio: Math.round(centroLogo - innerWidth / 2), texto: logo.textContent.replace(/\\s+/g,'') }, null, 1);
})()`));

console.log('\n=== 6. MENU: abre, fecha pelo mesmo botão, e é compacto ===');
await ev(`document.querySelector('[data-menu-toggle]').click()`);
await sleep(500);
console.log(await ev(`(() => {
  const p = document.querySelector('[data-menu-panel]');
  const r = p.getBoundingClientRect();
  const cs = getComputedStyle(p);
  return JSON.stringify({ aberto: p.classList.contains('is-open'),
    largura: Math.round(r.width), altura: Math.round(r.height),
    fracaoDaTela: +( (r.width*r.height) / (innerWidth*innerHeight) ).toFixed(2),
    clicavel: cs.pointerEvents !== 'none' && cs.visibility === 'visible',
    dentroDaTela: r.right <= innerWidth + 1 && r.left >= -1,
    iconeX: !document.querySelector('[data-menu-icone="x"]').hidden }, null, 1);
})()`));
let s = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
writeFileSync('qa-menu.png', Buffer.from(s.data, 'base64'));

await ev(`document.querySelector('[data-menu-toggle]').click()`);
await sleep(500);
console.log('fechou pelo mesmo botão: ' +
  await ev(`document.querySelector('[data-menu-panel]').classList.contains('is-open') === false`));

console.log('\n=== 7. CAPTURAS ===');
const alturaTotal = await ev(`document.documentElement.scrollHeight`);
const fatias = Math.min(8, Math.ceil(alturaTotal / height));
for (let i = 0; i < fatias; i++) {
  await ev(`window.scrollTo({ top: ${i * height}, behavior: 'instant' })`);
  await sleep(600);
  s = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(`qa-${String(i).padStart(2, '0')}.png`, Buffer.from(s.data, 'base64'));
}
console.log(`${fatias} fatias de ${height}px (página tem ${alturaTotal}px)`);

ws.close(); edge.kill(); process.exit(0);
