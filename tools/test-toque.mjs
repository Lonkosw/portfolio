/**
 * Testa o site com DEDO, não com mouse — emulando eventos de toque reais via
 * CDP (`Input.dispatchTouchEvent`).
 *
 * O que só aparece aqui:
 *   - o antes/depois disputa o gesto com o scroll da página? Arrastar de lado
 *     tem de mover o divisor, não rolar;
 *   - o carrossel anda com o dedo?
 *   - os rótulos dos formulários são tocáveis (os inputs são sr-only, o alvo
 *     real é o <label>)?
 *   - o menu abre e fecha no toque?
 *   - nada fica preso em :hover depois de tocar (a armadilha clássica de
 *     mobile: o estado de hover cola e não sai mais).
 *
 * uso: node test-toque.mjs <url>
 */
import { spawn } from 'node:child_process';

const url = process.argv[2];
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9100 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-toq-${PORT}`,
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
await cdp('Runtime.enable');
// `hasTouch` é o que faz o navegador se comportar como celular de verdade:
// `pointer: coarse`, `hover: none`, e os eventos de toque disponíveis.
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
});
await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await cdp('Page.navigate', { url });
await sleep(4000);

async function js(expressao) {
  const r = await cdp('Runtime.evaluate', {
    expression: expressao, returnByValue: true, awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'erro');
  return r.result.value;
}

const falhas = [];
const checar = (cond, rotulo, detalhe = '') => {
  console.log(`  ${cond ? 'ok   ' : 'FALHA'} ${rotulo}${!cond && detalhe ? ' — ' + detalhe : ''}`);
  if (!cond) falhas.push(rotulo);
};

/** Simula um arrasto de dedo: toca, move em passos, solta. */
async function arrastar(x0, y0, x1, y1, passos = 10) {
  await cdp('Input.dispatchTouchEvent', {
    type: 'touchStart', touchPoints: [{ x: x0, y: y0 }],
  });
  for (let i = 1; i <= passos; i++) {
    await cdp('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x0 + ((x1 - x0) * i) / passos, y: y0 + ((y1 - y0) * i) / passos }],
    });
    await sleep(16);
  }
  await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function tocar(x, y) {
  await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await sleep(60);
  await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

console.log('\n══ AMBIENTE ' + '═'.repeat(53));
const amb = JSON.parse(await js(`JSON.stringify({
  coarse: matchMedia('(pointer: coarse)').matches,
  semHover: matchMedia('(hover: none)').matches,
  touchPoints: navigator.maxTouchPoints,
  largura: innerWidth,
})`));
checar(amb.coarse, 'o navegador se identifica como toque (pointer: coarse)');
checar(amb.semHover, 'sem hover disponível (hover: none)');
checar(amb.largura === 390, `viewport de 390px`, String(amb.largura));

// ── O QUE ESTA PÁGINA TEM ──────────────────────────────────────────────
// Os três blocos abaixo testam peças que nem todo site do portfólio usa: o
// comparador antes/depois e o carrossel só existem nos salões, e o
// formulário guiado muda de prefixo conforme o negócio (`data-agenda` num
// salão, `data-orc` numa confeitaria). Sem esta sondagem o script estourava
// num `querySelector` nulo e MORRIA na primeira seção ausente — os blocos
// seguintes, que valem para todo mundo (menu, hover preso), nunca rodavam.
const tem = JSON.parse(await js(`(() => {
  const form = document.querySelector('[data-agenda]') ? { raiz: 'data-agenda', cta: 'data-agenda-cta', marca: 'Dia que prefiro' }
             : document.querySelector('[data-orcamento]') ? { raiz: 'data-orcamento', cta: 'data-orc-cta', marca: 'Ocasião' }
             : null;
  return JSON.stringify({
    comparador: !!document.querySelector('[data-comparador]'),
    carrossel: !!document.querySelector('[data-carrossel]'),
    form,
  });
})()`));

console.log('\n══ ANTES/DEPOIS: ARRASTAR COM O DEDO ' + '═'.repeat(29));
if (!tem.comparador) {
  console.log('  --    nenhum comparador nesta página (ok, nem todo site tem)');
} else {
  // Rola até o comparador. O scrollIntoView e a MEDIÇÃO são separados de
  // propósito: com `content-visibility: auto` as seções do caminho só ganham
  // altura real ao chegar perto da tela, e o navegador reajusta a posição
  // logo depois do salto. Medir na mesma tacada capturava esse reajuste e o
  // atribuía ao arrasto — um falso positivo de "o gesto rola a página".
  await js(`document.querySelector('[data-comparador]').scrollIntoView({ block: 'center', behavior: 'instant' })`);
  await sleep(900);

  const pos = JSON.parse(await js(`(() => {
    const c = document.querySelector('[data-comparador]');
    const r = c.getBoundingClientRect();
    return JSON.stringify({
      cx: Math.round(r.left + r.width / 2),
      cy: Math.round(r.top + r.height / 2),
      esq: Math.round(r.left + r.width * 0.12),
      p: getComputedStyle(c).getPropertyValue('--p').trim(),
      scrollY: Math.round(window.scrollY),
    });
  })()`));
  // Arrasta o divisor da direita para a esquerda, na horizontal.
  await arrastar(pos.cx, pos.cy, pos.esq, pos.cy);
  await sleep(400);

  const depois = JSON.parse(await js(`(() => {
    const c = document.querySelector('[data-comparador]');
    return JSON.stringify({
      p: getComputedStyle(c).getPropertyValue('--p').trim(),
      scrollY: Math.round(window.scrollY),
    });
  })()`));

  checar(
    Number(depois.p) < Number(pos.p) - 5,
    'arrastar de lado MOVE o divisor',
    `--p: ${pos.p} → ${depois.p}`,
  );
  checar(
    Math.abs(depois.scrollY - pos.scrollY) < 30,
    'arrastar de lado NÃO rola a página junto',
    `scrollY: ${pos.scrollY} → ${depois.scrollY}`,
  );
}

console.log('\n══ CARROSSEL: ARRASTAR COM O DEDO ' + '═'.repeat(32));
if (!tem.carrossel) {
  console.log('  --    nenhum carrossel nesta página (ok, nem todo site tem)');
} else {
  const car0 = JSON.parse(await js(`(() => {
    const f = document.querySelector('[data-carrossel]');
    f.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = f.getBoundingClientRect();
    return JSON.stringify({
      cy: Math.round(r.top + r.height / 2),
      scrollLeft: Math.round(f.scrollLeft),
      rolavel: f.scrollWidth > f.clientWidth,
    });
  })()`));
  await sleep(400);
  await arrastar(330, car0.cy, 70, car0.cy, 12);
  await sleep(700);
  const car1 = JSON.parse(await js(`JSON.stringify({
    scrollLeft: Math.round(document.querySelector('[data-carrossel]').scrollLeft),
  })`));
  checar(car0.rolavel, 'a fila é mais larga que a tela');
  checar(car1.scrollLeft > car0.scrollLeft + 20, 'arrastar anda com a fila',
    `${car0.scrollLeft} → ${car1.scrollLeft}`);
}

console.log('\n══ FORMULÁRIO: TOCAR NO RÓTULO MARCA A OPÇÃO ' + '═'.repeat(21));
if (!tem.form) {
  console.log('  --    nenhum formulário guiado nesta página');
} else {
  // Os <input> são sr-only (1x1px): o alvo de verdade é o <label>. Se o toque
  // no rótulo não marcar, o formulário está quebrado no celular.
  const rot = JSON.parse(await js(`(() => {
    // O :has(input) importa: o primeiro label da seção pode ser o texto de um
    // select ("O que você quer fazer?"), que não é alvo de toque — os alvos
    // são os rótulos que embrulham um rádio.
    const el = document.querySelector('[${tem.form.raiz}] label:has(input)');
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return JSON.stringify({
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top + r.height / 2),
      alturaRotulo: Math.round(r.height),
      marcado: !!el.querySelector('input')?.checked,
    });
  })()`));
  await sleep(300);
  await tocar(rot.x, rot.y);
  await sleep(400);
  const rotDepois = JSON.parse(await js(`JSON.stringify({
    marcado: !!document.querySelector('[${tem.form.raiz}] label input')?.checked,
    href: document.querySelector('[${tem.form.cta}]').href,
  })`));
  checar(rot.alturaRotulo >= 44, `o rótulo tem ${rot.alturaRotulo}px de altura (mínimo 44)`);
  checar(!rot.marcado && rotDepois.marcado, 'tocar no rótulo marca a opção');
  checar(decodeURIComponent(rotDepois.href).includes(tem.form.marca),
    'a escolha por toque entra na mensagem do WhatsApp');
}

console.log('\n══ MENU NO TOQUE ' + '═'.repeat(49));
const menu = JSON.parse(await js(`(() => {
  window.scrollTo(0, 0);
  const b = document.querySelector('[data-menu-toggle]');
  const r = b.getBoundingClientRect();
  return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2),
    largura: Math.round(r.width), altura: Math.round(r.height) });
})()`));
await sleep(300);
await tocar(menu.x, menu.y);
await sleep(500);
const aberto = await js(`document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded')`);
await tocar(menu.x, menu.y);
await sleep(500);
const fechado = await js(`document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded')`);
checar(menu.largura >= 44 && menu.altura >= 44, `o botão do menu é ${menu.largura}x${menu.altura}`);
checar(aberto === 'true', 'toque abre o menu');
checar(fechado === 'false', 'segundo toque fecha o menu');

console.log('\n══ NADA FICA PRESO EM HOVER ' + '═'.repeat(38));
// A armadilha clássica: no celular o :hover cola depois do toque e o
// elemento fica com aparência de "sob o mouse" para sempre.
const hoverPreso = await js(`(() => {
  // Conta regras :hover que NÃO estão dentro de @media (hover: hover).
  let soltas = 0;
  for (const folha of document.styleSheets) {
    let regras;
    try { regras = folha.cssRules; } catch { continue; }
    const varrer = (lista, protegido) => {
      for (const r of lista) {
        if (r.media && String(r.media).includes('hover')) { varrer(r.cssRules || [], true); continue; }
        if (r.cssRules) { varrer(r.cssRules, protegido); continue; }
        if (!protegido && r.selectorText && /:hover/.test(r.selectorText)
            && /(transform|scale|translate)/.test(r.style?.cssText || '')) soltas++;
      }
    };
    varrer(regras, false);
  }
  return soltas;
})()`);
checar(hoverPreso === 0, 'nenhum hover que MOVE o elemento fora de @media (hover: hover)',
  `${hoverPreso} regra(s)`);

console.log('\n' + '═'.repeat(66));
if (falhas.length) {
  console.log(`  ${falhas.length} FALHA(S):`);
  falhas.forEach((f) => console.log(`    · ${f}`));
} else {
  console.log('  O site responde ao dedo como deve.');
}
console.log('═'.repeat(66) + '\n');

ws.close();
edge.kill();
process.exit(falhas.length ? 1 : 0);
