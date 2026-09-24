/**
 * Contraste de texto sobre FOTO — o ponto cego do `contraste.mjs`.
 *
 * O `contraste.mjs` lê `background-color`. Numa abertura com foto de fundo o
 * `background-color` é `transparent`, então ele pula o texto mais arriscado
 * da página inteira e ainda assim imprime "zero reprovados". Foi assim que a
 * abertura do Recanto quase foi ao ar com o eyebrow em 2,2:1.
 *
 * COMO FUNCIONA: esconde o texto, fotografa o que sobrou (foto + véus) e mede
 * a luminância dentro da caixa de cada trecho. Reporta o **pior pixel**, não a
 * média — uma linha de texto claro fica ilegível justamente no pedaço que
 * atravessa o céu, e a média esconde exatamente isso.
 *
 * ⚠️ ELEMENTOS COM FUNDO PRÓPRIO SÃO PULADOS. Um botão preenchido tem a
 * própria cor de fundo; escondê-lo tira o preenchimento junto e a medição
 * passa a ser do texto contra a foto que está ATRÁS do botão — que ninguém
 * vê. Esses o `contraste.mjs` já mede direito.
 *
 * uso: node tools/contraste-foto.mjs <url> [largura] [seletor-da-seção]
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4321/';
const largura = Number(process.argv[3] ?? 390);
/** Onde procurar. Por padrão a abertura, que é onde quase sempre está o caso. */
const alvo = process.argv[4] ?? '[data-hero]';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9800 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edge-ch-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    wsUrl = j.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => ((ws.onopen = res), (ws.onerror = rej)));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? {}); pend.delete(m.id); } };
const send = (method, params = {}, sessionId) => new Promise((res) => { const n = ++id; pend.set(n, res); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride', { width: largura, height: 900, deviceScaleFactor: 1, mobile: largura < 700 }, sessionId);
await send('Page.navigate', { url }, sessionId);
await sleep(2600);

const ev = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId)).result?.value;

const SELETORES = 'p, h1, h2, h3, a, span, li';

// A medição é feita sobre a foto da VIEWPORT, então a seção precisa estar na
// tela de verdade. Sem isto, um alvo lá embaixo devolve caixas fora do
// quadro, o recorte sai vazio e a ferramenta imprime "nenhum reprovado" sem
// ter medido nada — o pior tipo de resultado verde.
await ev(`document.querySelector('${alvo}')?.scrollIntoView({ block: 'start' })`);
await sleep(1200);

// Caixas e cores de cada trecho de texto — só os que de fato ficam sobre a
// foto (sem fundo próprio) e que têm texto.
const alvos = await ev(`(() => {
  const raiz = document.querySelector('${alvo}');
  if (!raiz) return '[]';
  const opaco = (c) => c && c !== 'transparent' && !/rgba\\(0, 0, 0, 0\\)/.test(c);
  const nos = [...raiz.querySelectorAll('${SELETORES}')].filter((n) => {
    if (!n.textContent.trim()) return false;
    // Só folhas: um <div> pai devolveria a caixa de tudo junto.
    if (n.querySelector('${SELETORES}')) return false;
    // Fundo próprio (botão preenchido) → o contraste.mjs já cuida.
    for (let e = n; e && e !== raiz; e = e.parentElement) {
      if (opaco(getComputedStyle(e).backgroundColor)) return false;
    }
    return true;
  });
  return JSON.stringify(nos.map((n) => {
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return {
      texto: n.textContent.trim().replace(/\\s+/g, ' ').slice(0, 34),
      cor: cs.color,
      tamanho: parseFloat(cs.fontSize),
      peso: cs.fontWeight,
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
    };
  }));
})()`);

// Some com TODO o conteúdo da seção, deixando só foto + véus.
await ev(`(() => {
  const raiz = document.querySelector('${alvo}');
  raiz.querySelectorAll('${SELETORES}, svg, img:not([class*="object-cover"])')
    .forEach((n) => (n.style.visibility = 'hidden'));
})()`);
await sleep(300);

const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
const png = Buffer.from(data, 'base64');
const arq = `${process.env.TEMP}\\hero-sem-texto.png`;
writeFileSync(arq, png);

ws.close(); edge.kill();

// Lê o PNG com o Python (que já tem PIL) e devolve o pixel mais claro de cada caixa.
const { execFileSync } = await import('node:child_process');
const script = `
import sys, json, warnings
warnings.filterwarnings('ignore')
from PIL import Image
im = Image.open(r"${arq}").convert('RGB')
alvos = json.loads(sys.stdin.read())
def lum(c):
    def f(v):
        v /= 255
        return v/12.92 if v <= 0.03928 else ((v+0.055)/1.055) ** 2.4
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])
out = []
for a in alvos:
    x0, y0 = max(0, a['x']), max(0, a['y'])
    x1, y1 = min(im.size[0], x0 + a['w']), min(im.size[1], y0 + a['h'])
    if x1 <= x0 or y1 <= y0:
        continue
    px = list(im.crop((x0, y0, x1, y1)).getdata())
    claro = max(px, key=lum)
    a['fundoMaisClaro'] = claro
    a['lumFundo'] = lum(claro)
    out.append(a)
print(json.dumps(out))
`;
const res = execFileSync('python', ['-c', script], { input: alvos, encoding: 'utf8' });

const lum = (c) => {
  const f = (v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

let falhas = 0;
console.log(`\ncontraste sobre FOTO em ${alvo} — pior pixel de cada caixa, ${largura}px\n`);
for (const a of JSON.parse(res)) {
  const lt = lum(rgb(a.cor));
  const lf = a.lumFundo;
  // Teto de 21:1 — é o máximo possível (branco sobre preto). Sem o teto, um
  // trecho sobre o fundo já opaco imprime "2773011670:1" e faz a lista
  // inteira parecer quebrada.
  const razao = Math.min(21, (Math.max(lt, lf) + 0.05) / (Math.min(lt, lf) + 0.05));
  const grande = a.tamanho >= 24 || (a.tamanho >= 18.66 && Number(a.peso) >= 700);
  const min = grande ? 3 : 4.5;
  const ok = razao >= min;
  if (!ok) falhas++;
  console.log(
    `${ok ? 'ok  ' : 'FALHA'} ${razao.toFixed(2)}:1 (mín ${min})  ${String(a.tamanho).padStart(5)}px  ${a.texto}`,
  );
}
console.log(falhas ? `\n${falhas} REPROVADO(S)` : '\nnenhum reprovado');
process.exit(falhas ? 1 : 0);
