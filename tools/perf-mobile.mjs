/**
 * Auditoria de carga para celular: o que a pessoa realmente baixa e quanto
 * tempo leva até ver alguma coisa.
 *
 * Mede com rede E CPU desaceleradas ao mesmo tempo — que é a condição real de
 * quem abre um link de WhatsApp na rua, e a que mais difere de um PC com
 * fibra. Medir só CPU (ou só rede) esconde metade dos problemas.
 *
 * Reporta:
 *   - LCP, FCP, CLS: os três que decidem a primeira impressão
 *   - o que foi baixado ANTES do primeiro quadro útil, por tipo
 *   - imagens baixadas maiores do que o espaço onde são exibidas
 *
 * uso: node perf-mobile.mjs <url> [--rede 4g|3g] [--cpu N]
 */
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const url = args[0];
const rede = args.includes('--rede') ? args[args.indexOf('--rede') + 1] : '4g';
const cpu = args.includes('--cpu') ? Number(args[args.indexOf('--cpu') + 1]) : 4;

// Perfis de rede. Os números são os do painel do DevTools.
const REDES = {
  '4g': { download: (9 * 1024 * 1024) / 8, upload: (9 * 1024 * 1024) / 8, latency: 85 },
  '3g': { download: (1.6 * 1024 * 1024) / 8, upload: (750 * 1024) / 8, latency: 300 },
};

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9300 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-mob-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    if (j.webSocketDebuggerUrl) { wsUrl = j.webSocketDebuggerUrl; break; }
  } catch { /* subindo */ }
  await sleep(250);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? {}); pend.delete(m.id); }
};
const send = (me, pa = {}, s) =>
  new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, pa = {}) => send(m, pa, sessionId);

await cdp('Page.enable');
await cdp('Network.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
});
await cdp('Network.emulateNetworkConditions', { offline: false, ...REDES[rede] });
await cdp('Emulation.setCPUThrottlingRate', { rate: cpu });
// Sem cache: é a primeira visita de quem clicou no link.
await cdp('Network.setCacheDisabled', { cacheDisabled: true });

console.log(`\n${'═'.repeat(66)}`);
console.log(`  CELULAR 390x844 · rede ${rede.toUpperCase()} · CPU ${cpu}x mais lenta · sem cache`);
console.log('═'.repeat(66));

const t0 = Date.now();
await cdp('Page.navigate', { url });
await sleep(9000);

const m = JSON.parse(await (async () => {
  const r = await cdp('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      // LCP e CLS chegam por observer; damos um instante para o último valor.
      let lcp = 0, cls = 0;
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) lcp = Math.max(lcp, e.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) { /* navegador sem suporte */ }

      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0] || {};
        const paint = {};
        performance.getEntriesByType('paint').forEach(p => paint[p.name] = Math.round(p.startTime));
        const rec = performance.getEntriesByType('resource');
        const grupo = (f) => {
          const l = rec.filter(f);
          return { n: l.length, kb: Math.round(l.reduce((a,r)=>a+(r.encodedBodySize||0),0)/1024) };
        };
        // O que chegou ANTES do LCP é o que atrasa a primeira impressão.
        const antesLcp = rec.filter(r => r.responseEnd <= lcp);
        resolve(JSON.stringify({
          fcp: paint['first-contentful-paint'] ?? null,
          lcp: Math.round(lcp),
          cls: Math.round(cls * 1000) / 1000,
          dcl: Math.round(nav.domContentLoadedEventEnd || 0),
          load: Math.round(nav.loadEventEnd || 0),
          js: grupo(r => r.name.endsWith('.js')),
          css: grupo(r => r.name.endsWith('.css')),
          fonte: grupo(r => /\\.(woff2?|ttf)(\\?|$)/.test(r.name)),
          img: grupo(r => /\\.(webp|jpe?g|png|avif|svg)(\\?|$)/.test(r.name)),
          totalKb: Math.round(rec.reduce((a,r)=>a+(r.encodedBodySize||0),0)/1024),
          recursos: rec.length,
          antesLcpN: antesLcp.length,
          antesLcpKb: Math.round(antesLcp.reduce((a,r)=>a+(r.encodedBodySize||0),0)/1024),
        }));
      }, 1200);
    })`,
    awaitPromise: true, returnByValue: true,
  });
  return r.result.value;
})());

const nota = (v, bom, ruim, unidade = 'ms') => {
  const marca = v <= bom ? 'BOM ' : v <= ruim ? 'ok  ' : 'RUIM';
  return `${marca} ${String(v).padStart(6)} ${unidade}`;
};

console.log('\n── PRIMEIRA IMPRESSÃO ' + '─'.repeat(44));
console.log(`  FCP  (primeiro pixel de conteúdo)  ${nota(m.fcp, 1800, 3000)}`);
console.log(`  LCP  (maior elemento pintado)      ${nota(m.lcp, 2500, 4000)}`);
console.log(`  CLS  (o quanto o layout pula)      ${nota(m.cls, 0.1, 0.25, '   ')}`);
console.log(`  DOMContentLoaded                   ${String(m.dcl).padStart(11)} ms`);
console.log(`  load                               ${String(m.load).padStart(11)} ms`);

console.log('\n── O QUE FOI BAIXADO ' + '─'.repeat(45));
const linha = (rot, g) => console.log(`  ${rot.padEnd(24)} ${String(g.n).padStart(3)} arquivo(s)  ${String(g.kb).padStart(5)} KB`);
linha('JavaScript', m.js);
linha('CSS', m.css);
linha('Fontes', m.fonte);
linha('Imagens', m.img);
console.log(`  ${'TOTAL'.padEnd(24)} ${String(m.recursos).padStart(3)} arquivo(s)  ${String(m.totalKb).padStart(5)} KB`);
console.log(`\n  antes do LCP: ${m.antesLcpN} arquivo(s), ${m.antesLcpKb} KB`);

// Imagens servidas maiores do que o espaço onde aparecem: desperdício puro
// de dados no celular, e o erro mais comum em site com foto.
const excesso = JSON.parse((await cdp('Runtime.evaluate', {
  expression: `JSON.stringify([...document.images]
    .filter(i => i.naturalWidth && i.clientWidth)
    .map(i => ({
      nome: i.currentSrc.split('/').pop().slice(0, 34),
      natural: i.naturalWidth,
      exibida: Math.round(i.clientWidth * devicePixelRatio),
    }))
    .filter(i => i.natural > i.exibida * 1.35)
    .sort((a,b) => b.natural - a.natural)
    .slice(0, 8))`,
  returnByValue: true,
})).result.value);

console.log('\n── IMAGENS MAIORES QUE O NECESSÁRIO ' + '─'.repeat(30));
if (!excesso.length) {
  console.log('  nenhuma — todas servidas no tamanho certo');
} else {
  excesso.forEach((i) =>
    console.log(`  ${i.nome.padEnd(36)} ${String(i.natural).padStart(5)}px baixados, ${String(i.exibida).padStart(5)}px usados`));
}

console.log(`\n  tempo total do teste: ${Date.now() - t0}ms\n`);

ws.close();
edge.kill();
process.exit(0);
