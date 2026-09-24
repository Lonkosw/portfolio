/**
 * Contraste WCAG de todos os pares texto/fundo da página.
 *
 *   node tools/contraste.mjs http://127.0.0.1:4321/ [largura] [altura]
 *
 * Por que não dá para parsear a cor com regex: o Tailwind 4 emite `oklab(...)`
 * sempre que há modificador de opacidade (`text-cream-dim/70`). Um
 * `cor.match(/\d+/g)` nesse formato devolve lixo e o cálculo sai em bilhões —
 * o que parece "passou com folga" e esconde reprovação de verdade.
 *
 * Aqui a cor é resolvida pintando num canvas 1x1 e lendo o pixel: funciona para
 * qualquer sintaxe que o navegador entenda. A transparência é composta sobre o
 * fundo real, subindo a árvore até achar uma camada opaca.
 *
 * Texto sobre foto é pulado (`[data-hero]` e afins não têm fundo determinável).
 * Confira esses à mão depois de colocar as imagens reais.
 */
import { spawn } from 'node:child_process';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/';
const larg = Number(process.argv[3] ?? 1440);
const alt = Number(process.argv[4] ?? 900);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9000 + Math.floor(Math.random() * 400);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edge-ct-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl; }
  catch { /* ainda subindo */ }
  if (!wsUrl) await sleep(250);
}
if (!wsUrl) { console.error('Edge não subiu'); process.exit(2); }

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => ((ws.onopen = res), (ws.onerror = rej)));
let id = 0; const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
};
const send = (method, params = {}, sessionId) => new Promise((res) => {
  const n = ++id; pending.set(n, res);
  ws.send(JSON.stringify({ id: n, method, params, sessionId }));
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride',
  { width: larg, height: alt, deviceScaleFactor: 1, mobile: larg < 700 }, sessionId);
const ev = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId)).result?.value;

await send('Page.navigate', { url }, sessionId);
await sleep(2500);
// rola a página inteira: seções com reveal só ganham cor depois de aparecer
await ev(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}window.scrollTo(0,0);})()`);
await sleep(2500);

const bruto = await ev(`(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });

  function resolver(cor) {
    cx.fillStyle = '#000';
    cx.fillStyle = cor;
    cx.globalCompositeOperation = 'copy';
    cx.fillRect(0, 0, 1, 1);
    cx.globalCompositeOperation = 'source-over';
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }

  const sobre = (frente, fundo) =>
    frente.slice(0, 3).map((v, i) => v * frente[3] + fundo[i] * (1 - frente[3]));

  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  const BASE = resolver(getComputedStyle(document.body).backgroundColor.replace(/[\\d.]+\\)$/, '1)'));

  function fundoReal(el) {
    const camadas = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const c = resolver(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) { camadas.push(c); if (c[3] >= 0.999) break; }
      n = n.parentElement;
    }
    let acc = BASE;
    for (let i = camadas.length - 1; i >= 0; i--) acc = sobre(camadas[i], acc);
    return acc;
  }

  const vistos = new Map();
  document.querySelectorAll('p,h1,h2,h3,h4,a,span,li,label,legend,figcaption,strong,em,option,button,td,th')
    .forEach((el) => {
      const txt = el.textContent.trim();
      if (!txt || el.children.length) return;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) return;
      if (el.closest('[data-sobre-foto], [data-hero]')) return;

      // Texto visualmente escondido (sr-only / clip de 1x1) existe só para o
      // leitor de tela: não tem requisito de contraste, e medi-lo gera
      // reprovação falsa que esconde as de verdade.
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return;
      if (s.clipPath === 'inset(50%)' || s.clip === 'rect(0px, 0px, 0px, 0px)') return;

      // O inverso do caso acima: ornamento puro, marcado com aria-hidden.
      // A WCAG isenta texto decorativo — as aspas gigantes de um bloco de
      // citação são desenho, não leitura, e exigir 4.5:1 delas obrigaria a
      // estragar o desenho por nada. O aria-hidden é o que faz essa promessa:
      // se está lá, o conteúdo não pode ser essencial.
      // ATENÇÃO: não use aria-hidden para calar uma reprovação legítima. Se o
      // texto informa alguma coisa (o número de um passo, um rótulo), ele
      // precisa passar no contraste.
      if (el.closest('[aria-hidden=true]')) return;

      const fundo = fundoReal(el);
      const frente = sobre(resolver(s.color), fundo);
      const razao = (() => {
        const L1 = lum(frente), L2 = lum(fundo);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      })();

      const px = parseFloat(s.fontSize);
      const grande = px >= 24 || (px >= 18.66 && Number(s.fontWeight) >= 700);
      const minimo = grande ? 3 : 4.5;

      const chave = s.color + '|' + fundo.join(',') + '|' + Math.round(px);
      if (!vistos.has(chave)) vistos.set(chave, {
        razao: Math.round(razao * 100) / 100,
        minimo, passa: razao >= minimo,
        px: s.fontSize, cor: s.color,
        exemplo: txt.slice(0, 28),
      });
    });

  return JSON.stringify([...vistos.values()].sort((a, b) => a.razao - b.razao));
})()`);

ws.close(); edge.kill();

const todos = JSON.parse(bruto);
const reprovados = todos.filter((x) => !x.passa);

console.log(`pares medidos: ${todos.length}`);
console.log(`reprovados:    ${reprovados.length}\n`);

const linha = (x) =>
  `${x.passa ? 'ok   ' : 'FALHA'} ${String(x.razao).padStart(6)}:1  (mín ${x.minimo})  ${x.px.padStart(7)}  ${x.exemplo}`;

if (reprovados.length) {
  console.log('=== REPROVADOS ===');
  reprovados.forEach((x) => console.log(linha(x)));
  console.log('');
}
console.log('=== 6 PIORES ===');
todos.slice(0, 6).forEach((x) => console.log(linha(x)));

console.log('\nTexto sobre foto NÃO é medido aqui — confira à mão.');
process.exit(reprovados.length ? 1 : 0);
