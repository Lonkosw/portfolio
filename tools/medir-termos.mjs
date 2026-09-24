/**
 * Mede quantos negócios NOVOS cada termo de busca traz, numa cidade-amostra.
 *
 * ── POR QUE MEDIR EM VEZ DE CHUTAR ──────────────────────────────────────
 * Cada termo a mais multiplica a varredura inteira: N termos × 3-9 pontos ×
 * todas as cidades, e com o modo profundo ligado são ~4s por lead. Um termo
 * que só repete a lista custa horas e não acrescenta um lead sequer.
 *
 * O que interessa não é quantos resultados o termo devolve — é quantos ele
 * devolve que os anteriores ainda NÃO tinham trazido. Por isso a ordem
 * importa: cada termo é medido contra a união de todos os que vieram antes.
 *
 * Medido em Campo Mourão (set/2026), o termo isolado "salão de beleza" dava
 * 26 negócios; a lista inteira deu 224 — quase 9× mais. E "espaço de beleza"
 * trouxe 26 resultados com ZERO novos: é exatamente o tipo de termo que só
 * se descobre medindo.
 *
 * ⚠️ Rode numa cidade MÉDIA. Em capital o Google corta a lista e todo termo
 * parece render; em cidade pequena não há negócio suficiente para separar
 * um termo do outro.
 *
 * uso:
 *   node tools/medir-termos.mjs [--cidade "Campo Mourão PR"] [--centro @-24.046,-52.378,13z]
 *                               [--termos arquivo.txt]
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const CIDADE = opt('--cidade', 'Campo Mourão PR');
const CENTRO = opt('--centro', '@-24.046,-52.378,13z');
const arqTermos = opt('--termos', '');

// Lista padrão: as categorias que o Google Maps devolveu nos 347 salões do
// Paraná, mais as vizinhas de ramo. Passe --termos para usar outra.
const TERMOS = arqTermos && existsSync(arqTermos)
  ? readFileSync(arqTermos, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  : [
      'salão de beleza', 'cabeleireiro', 'barbearia', 'manicure e pedicure',
      'esmalteria', 'designer de sobrancelhas', 'extensão de cílios', 'depilação',
      'clínica de estética', 'maquiador', 'studio de beleza', 'espaço de beleza',
      'tratamento capilar', 'progressiva e alisamento', 'podologia',
      'micropigmentação', 'spa de beleza', 'nail designer',
    ];

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9800 + Math.floor(Math.random() * 150);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  '--headless=new', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\edge-termos-${PORT}`,
  '--window-size=1400,900', '--lang=pt-BR', 'about:blank',
], { stdio: 'ignore' });

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return (await r.json()).webSocketDebuggerUrl; } catch {}
    await sleep(500);
  }
  throw new Error('Edge não subiu');
}
const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}, sid) => new Promise((res) => {
  const i = ++seq; pend.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params, ...(sid ? { sessionId: sid } : {}) }));
});
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const evalJs = async (e) => (await send('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true }, sessionId))?.result?.result?.value;

// Rola a lista para não medir só a primeira tela — e detecta o teto do Google.
const COLHER = `(async () => {
  const feed = document.querySelector('div[role="feed"]');
  if (!feed) return JSON.stringify({ nomes: [], fim: false });
  let alturaAnterior = -1;
  for (let i = 0; i < 6; i++) {
    feed.scrollTop = feed.scrollHeight;
    await new Promise(r => setTimeout(r, 1400));
    if (feed.scrollHeight === alturaAnterior) break;
    alturaAnterior = feed.scrollHeight;
  }
  const nomes = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'))
    .map(a => (a.getAttribute('aria-label') || '').trim()).filter(Boolean);
  return JSON.stringify({
    nomes: [...new Set(nomes)],
    fim: /final da lista/i.test(feed.textContent || '')
  });
})()`;

const vistos = new Set();
const linhas = [];

console.log(`\n  cidade-amostra: ${CIDADE}\n`);

for (const termo of TERMOS) {
  const url = 'https://www.google.com/maps/search/' +
    encodeURIComponent(`${termo} ${CIDADE}`) + '/' + CENTRO + '?hl=pt-BR';
  await send('Page.navigate', { url }, sessionId);
  await sleep(7000);
  let r = { nomes: [], fim: false };
  try { r = JSON.parse(await evalJs(COLHER) || '{"nomes":[],"fim":false}'); } catch {}

  const novos = r.nomes.filter((n) => !vistos.has(n));
  novos.forEach((n) => vistos.add(n));
  linhas.push({ termo, total: r.nomes.length, novos: novos.length, fim: r.fim });

  console.log(
    `  ${termo.padEnd(26)} ${String(r.nomes.length).padStart(3)} result.  ` +
    `${String(novos.length).padStart(3)} NOVOS  ${r.fim ? '' : '(lista pode ter sido cortada)'}`,
  );
  await sleep(1200);
}

console.log('\n' + '═'.repeat(72));
console.log(`  ${vistos.size} negócios distintos somando todos os termos`);
console.log('═'.repeat(72));

const uteis = linhas.filter((x) => x.novos >= 3).sort((a, b) => b.novos - a.novos);
const inuteis = linhas.filter((x) => x.novos < 3);

console.log('\n  COLE ISTO NO CAMPO DE TERMOS DA EXTENSÃO:\n');
console.log(uteis.map((l) => l.termo).join('\n'));

if (inuteis.length) {
  console.log('\n  DESCARTADOS (repetem o que os outros já trazem):');
  for (const l of inuteis) console.log(`    ${l.termo.padEnd(26)} +${l.novos}`);
}

const cortados = linhas.filter((l) => !l.fim).length;
if (cortados) {
  console.log(`\n  ⚠️ ${cortados} termo(s) não chegaram ao "final da lista": o Google cortou.`);
  console.log('     Nesses, a varredura por pontos geográficos do Apex rende mais que aqui —');
  console.log('     o número de novos está SUBestimado.');
}
console.log('');

edge.kill();
process.exit(0);
