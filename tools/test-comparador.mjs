/**
 * Testa o antes/depois arrastável e o carrossel de tipos, no navegador.
 *
 * O que importa verificar aqui não é "o elemento existe", e sim que ele
 * RESPONDE: mover o range tem de mover o recorte, as etiquetas têm de sumir
 * na hora certa, e o carrossel tem de rolar de verdade quando a seta é
 * clicada.
 *
 * uso: node test-comparador.mjs <url>
 */
import { spawn } from 'node:child_process';

const url = process.argv[2];
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9700 + Math.floor(Math.random() * 300);

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-cmp-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {
      /* subindo */
    }
    await sleep(250);
  }
  throw new Error('Edge não respondeu');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? {});
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const msgId = ++id;
    pending.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p = {}) => send(m, p, sessionId);

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
});
await cdp('Page.navigate', { url });
await sleep(3500);

async function js(expressao) {
  const r = await cdp('Runtime.evaluate', {
    expression: expressao, returnByValue: true, awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || 'erro na página');
  }
  return r.result.value;
}

const falhas = [];
const checar = (cond, rotulo, detalhe = '') => {
  console.log(`  ${cond ? 'ok   ' : 'FALHA'} ${rotulo}${!cond && detalhe ? ' — ' + detalhe : ''}`);
  if (!cond) falhas.push(rotulo);
};

console.log('\n══ ANTES/DEPOIS ARRASTÁVEL ' + '═'.repeat(39));

const cmp = JSON.parse(await js(`(() => {
  const todos = document.querySelectorAll('[data-comparador]');
  if (!todos.length) return JSON.stringify({ erro: 'nenhum comparador' });
  const raiz = todos[0];
  const range = raiz.querySelector('[data-comparador-range]');
  const depois = raiz.querySelector('[data-comparador-depois]');
  const tagAntes = raiz.querySelector('[data-comparador-tag=antes]');
  const tagDepois = raiz.querySelector('[data-comparador-tag=depois]');

  const lerP = () => getComputedStyle(raiz).getPropertyValue('--p').trim();
  const clip = () => getComputedStyle(depois).clipPath;
  const mover = (v) => {
    range.value = String(v);
    range.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const inicial = { p: lerP(), clip: clip() };

  mover(90);
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => {
    const em90 = { p: lerP(), clip: clip(), tagDepoisOculta: tagDepois.hasAttribute('data-oculta') };
    mover(5);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const em5 = { p: lerP(), clip: clip(), tagAntesOculta: tagAntes.hasAttribute('data-oculta') };
      resolve(JSON.stringify({
        quantos: todos.length,
        temRange: !!range,
        rotulo: range.getAttribute('aria-label') || '',
        tipoRange: range.type,
        inicial, em90, em5,
        // O recorte tem de vir de clip-path, não de largura. A moldura tem
        // borda de 1px de cada lado, então comparamos com clientWidth (área
        // interna) e não com a largura calculada da caixa externa.
        larguraFixa: Math.round(depois.getBoundingClientRect().width),
        larguraMoldura: raiz.clientWidth,
      }));
    }));
  })));
})()`));

checar(!cmp.erro, 'comparadores existem na página', cmp.erro);
if (!cmp.erro) {
  // Quantidade não é fixada de propósito: a lista de pares muda conforme
  // chegam fotos novas, e um número cravado aqui vira falha falsa a cada
  // adição. O que importa é existir pelo menos um e todos funcionarem.
  checar(cmp.quantos >= 1, `há ${cmp.quantos} par(es) de antes/depois`);
  checar(cmp.tipoRange === 'range', 'o controle é um <input type=range> nativo', cmp.tipoRange);
  checar(cmp.rotulo.length > 0, 'o range tem aria-label para leitor de tela');
  checar(cmp.inicial.p === '50', 'começa no meio (--p = 50)', cmp.inicial.p);
  checar(cmp.em90.p === '90', 'mover o range muda --p para 90', cmp.em90.p);
  checar(cmp.em5.p === '5', 'mover de novo muda --p para 5', cmp.em5.p);
  checar(
    cmp.inicial.clip !== cmp.em90.clip && cmp.em90.clip !== cmp.em5.clip,
    'o RECORTE muda junto (clip-path acompanha)',
    `${cmp.inicial.clip} → ${cmp.em90.clip} → ${cmp.em5.clip}`,
  );
  checar(cmp.em90.clip.includes('inset'), 'o recorte é clip-path: inset (não width)', cmp.em90.clip);
  checar(
    cmp.larguraFixa === cmp.larguraMoldura,
    'a camada de cima NÃO muda de largura (só é recortada)',
    `${cmp.larguraFixa} vs ${cmp.larguraMoldura}`,
  );
  checar(cmp.em90.tagDepoisOculta, 'etiqueta "Depois" some quando o divisor cobre o canto dela');
  checar(cmp.em5.tagAntesOculta, 'etiqueta "Antes" some quando o divisor cobre o canto dela');
}

console.log('\n══ CARROSSEL DE TIPOS DE CABELO ' + '═'.repeat(34));

const car = JSON.parse(await js(`(() => {
  const fila = document.querySelector('[data-carrossel]');
  if (!fila) return JSON.stringify({ erro: 'carrossel não encontrado' });
  const itens = fila.querySelectorAll('[data-carrossel-item]');
  const proximo = document.querySelector('[data-carrossel-proximo]');
  const anterior = document.querySelector('[data-carrossel-anterior]');
  const est = getComputedStyle(fila);

  // Estado das setas ANTES de qualquer clique: a fila está no começo, então
  // "<" deve estar desabilitada e ">" habilitada.
  const inicio = fila.scrollLeft;
  const anteriorDesabilitadoNoInicio = anterior.disabled;
  const proximoHabilitadoNoInicio = !proximo.disabled;
  proximo.click();

  return new Promise(resolve => setTimeout(() => {
    const depoisDeAvancar = fila.scrollLeft;
    anterior.click();
    setTimeout(() => {
      resolve(JSON.stringify({
        itens: itens.length,
        rolavel: fila.scrollWidth > fila.clientWidth,
        snap: est.scrollSnapType,
        overflowX: est.overflowX,
        focavel: fila.tabIndex >= 0,
        rotulo: fila.getAttribute('aria-label') || '',
        // Todo cartão é um link direto para o WhatsApp com o tipo escrito.
        // O que importa é que o cartão leve ao WhatsApp COM O NOME DO ITEM
        // na mensagem — não a frase exata que o envolve. O Concetto usa
        // "queria fazer: X"; um modelo genérico usa outra. Exigir a frase
        // literal transformava uma diferença de texto legítima em falha.
        todosSaoLinksWa: [...itens].every(a => {
          if (a.tagName !== 'A' || !a.href.includes('wa.me')) return false;
          const msg = decodeURIComponent(a.href).toLowerCase();
          // Qualquer pedaço de texto visível do cartão serve como "o nome":
          // o título fica num <p> no Concetto e poderia ser <h3> noutro
          // site. Procurar a tag certa deixaria o teste preso a um layout.
          const textos = [...a.querySelectorAll('p,h3,h4,span')]
            .map(e => e.textContent.trim().toLowerCase())
            .filter(s => s.length > 2);
          return textos.some(s => msg.includes(s));
        }),
        inicio, depoisDeAvancar, voltou: fila.scrollLeft,
        anteriorDesabilitadoNoInicio, proximoHabilitadoNoInicio,
      }));
    }, 700);
  }, 700));
})()`));

// AUSENTE ≠ QUEBRADO. O carrossel de tipos de cabelo é um componente do
// Concetto; nem todo site que tem antes/depois tem carrossel. Acusar dez
// falhas num site que nunca prometeu isso enche a saída de vermelho e faz a
// falha de verdade passar batido — foi o que aconteceu na primeira rodada
// do Claus.
if (car.erro) {
  console.log('  --    nenhum carrossel nesta página (ok, nem todo site tem)');
} else {
  checar(car.itens >= 3, `há ${car.itens} tipos de cabelo na fila`);
  checar(car.rolavel, 'a fila é mais larga que a tela (dá para arrastar)');
  checar(car.snap.includes('mandatory'), 'usa scroll-snap nativo', car.snap);
  checar(car.overflowX === 'auto' || car.overflowX === 'scroll', 'rola na horizontal', car.overflowX);
  checar(car.focavel && car.rotulo.length > 0, 'é focável por teclado e tem rótulo');
  checar(car.todosSaoLinksWa, 'todo cartão é link de WhatsApp com o tipo escrito na mensagem');
  checar(car.depoisDeAvancar > car.inicio, 'a seta ">" avança a fila',
    `${car.inicio} → ${car.depoisDeAvancar}`);
  checar(car.voltou < car.depoisDeAvancar, 'a seta "<" volta a fila',
    `${car.depoisDeAvancar} → ${car.voltou}`);
  checar(car.anteriorDesabilitadoNoInicio, 'a seta "<" nasce desabilitada no começo');
  checar(car.proximoHabilitadoNoInicio, 'a seta ">" nasce habilitada no começo');
}

console.log('\n══ SEM JAVASCRIPT E COM REDUCED-MOTION ' + '═'.repeat(27));
const degrada = JSON.parse(await js(`(() => {
  const fila = document.querySelector('[data-carrossel]');
  const setas = document.querySelector('[data-carrossel-setas]');
  const est = fila ? getComputedStyle(fila) : null;
  return JSON.stringify({
    temCarrossel: !!fila,
    // Sem JS a classe .js não é aplicada e as setas somem — mas a fila
    // continua arrastável, porque o snap é CSS puro.
    setasMarcadasSoComJs: !!setas && setas.hasAttribute('data-so-com-js'),
    filaFuncionaSemJs: !!est && est.scrollSnapType.includes('mandatory') && est.overflowX !== 'visible',
    comparadorSemJs: !!document.querySelector('[data-comparador] input[type=range]'),
  });
})()`));
if (degrada.temCarrossel) {
  checar(degrada.setasMarcadasSoComJs, 'setas marcadas como "só com JS"');
  checar(degrada.filaFuncionaSemJs, 'a fila continua arrastável sem JavaScript (snap é CSS)');
}
checar(degrada.comparadorSemJs, 'o comparador é um input nativo (arrasta sem JS)');

console.log('\n' + '═'.repeat(66));
if (falhas.length) {
  console.log(`  ${falhas.length} FALHA(S):`);
  falhas.forEach((f) => console.log(`    · ${f}`));
} else {
  console.log('  Antes/depois e carrossel funcionam.');
}
console.log('═'.repeat(66) + '\n');

ws.close();
edge.kill();
process.exit(falhas.length ? 1 : 0);
