/**
 * Testa as duas ferramentas do site com o navegador de verdade, e com
 * DEDO — eventos de toque reais, não clique de mouse.
 *
 *   1. Cardápio em abas: troca de seção, teclado, e o comportamento sem JS
 *   2. Montador de reserva: monta a mensagem, reescreve o link do WhatsApp
 *
 * Roda a bateria inteira DUAS VEZES: com animação normal e com
 * `prefers-reduced-motion` forçado. Usar não é animar — quem pede menos
 * movimento continua precisando reservar mesa.
 *
 * uso: node scripts/test-site.mjs <url>
 */
import { spawn } from 'node:child_process';

const url = process.argv[2] || 'http://127.0.0.1:4530/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let falhas = 0;
let total = 0;

async function rodar(reduzido) {
  const PORT = 9600 + Math.floor(Math.random() * 300);
  const args = [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-ana-${PORT}`,
    'about:blank',
  ];
  if (reduzido) args.unshift('--force-prefers-reduced-motion');
  const edge = spawn(EDGE, args, { stdio: 'ignore' });

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
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
  });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.navigate', { url });
  await sleep(3500);

  const js = async (e) => {
    const r = await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'erro');
    return r.result.value;
  };

  const checar = (cond, rotulo, detalhe = '') => {
    total++;
    if (!cond) falhas++;
    console.log(`  ${cond ? 'PASS' : 'FALHA'}  ${rotulo}${!cond && detalhe ? ' — ' + detalhe : ''}`);
  };

  async function tocar(x, y) {
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(60);
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(220);
  }

  /** Rola até o elemento e devolve o centro dele na tela. */
  async function centroDe(seletor) {
    await js(`document.querySelector('${seletor}').scrollIntoView({block:'center',behavior:'instant'})`);
    await sleep(700); // content-visibility reassenta as alturas depois do salto
    return JSON.parse(await js(`(() => {
      const r = document.querySelector('${seletor}').getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
    })()`));
  }

  console.log(`\n${'═'.repeat(64)}`);
  console.log(`  ${reduzido ? 'COM prefers-reduced-motion' : 'Animação normal'}`);
  console.log('═'.repeat(64));

  /* ── CARDÁPIO ─────────────────────────────────────────────────── */
  console.log('\n── Cardápio em abas ' + '─'.repeat(42));

  const cardInicial = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-cardapio]');
    const abas = [...raiz.querySelectorAll('[data-carta-aba]')];
    const paineis = [...raiz.querySelectorAll('[data-carta-painel]')];
    return JSON.stringify({
      abas: abas.length,
      paineis: paineis.length,
      virouAbas: raiz.classList.contains('is-abas'),
      visiveis: paineis.filter(p => !p.hidden).length,
      primeiraSelecionada: abas[0].getAttribute('aria-selected'),
      tabindexes: abas.map(a => a.tabIndex),
      // Todo painel tem de continuar no HTML: esconder não é remover.
      itensNoDom: raiz.querySelectorAll('[data-carta-painel] li').length,
    });
  })()`));
  checar(cardInicial.abas >= 3, `há ${cardInicial.abas} abas`);
  checar(cardInicial.abas === cardInicial.paineis, 'uma aba por painel');
  checar(cardInicial.virouAbas, 'o JS ativou o modo abas');
  checar(cardInicial.visiveis === 1, 'só um painel visível por vez', `${cardInicial.visiveis} visíveis`);
  checar(cardInicial.primeiraSelecionada === 'true', 'a primeira aba nasce selecionada');
  checar(
    cardInicial.tabindexes[0] === 0 && cardInicial.tabindexes.slice(1).every((t) => t === -1),
    'roving tabindex: só a aba ativa entra na ordem do Tab',
    JSON.stringify(cardInicial.tabindexes),
  );
  checar(cardInicial.itensNoDom >= 10, `os ${cardInicial.itensNoDom} pratos continuam no HTML`);

  // Toca na terceira aba
  const posAba = await centroDe('[data-carta-aba]:nth-of-type(3)');
  await tocar(posAba.x, posAba.y);
  const cardDepois = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-cardapio]');
    const abas = [...raiz.querySelectorAll('[data-carta-aba]')];
    const paineis = [...raiz.querySelectorAll('[data-carta-painel]')];
    return JSON.stringify({
      selecionada: abas.findIndex(a => a.getAttribute('aria-selected') === 'true'),
      painelVisivel: paineis.findIndex(p => !p.hidden),
      visiveis: paineis.filter(p => !p.hidden).length,
    });
  })()`));
  checar(cardDepois.selecionada === 2, 'tocar na 3ª aba a seleciona', `selecionada: ${cardDepois.selecionada}`);
  checar(cardDepois.painelVisivel === 2, 'o painel correspondente aparece');
  checar(cardDepois.visiveis === 1, 'continua um só painel visível');

  // Seta do teclado
  const tecla = JSON.parse(await js(`(() => {
    const abas = [...document.querySelectorAll('[data-carta-aba]')];
    abas[2].focus();
    abas[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    return JSON.stringify({
      selecionada: abas.findIndex(a => a.getAttribute('aria-selected') === 'true'),
      focada: abas.findIndex(a => a === document.activeElement),
    });
  })()`));
  checar(tecla.selecionada === 3, 'seta direita avança para a próxima aba', `${tecla.selecionada}`);
  checar(tecla.focada === 3, 'o foco acompanha a seta');

  /* ── RESERVA ──────────────────────────────────────────────────── */
  console.log('\n── Montador de reserva ' + '─'.repeat(39));

  const resInicial = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-reserva]');
    return JSON.stringify({
      existe: !!raiz,
      pessoas: raiz.querySelector('[data-res-pessoas-valor]').textContent.trim(),
      href: raiz.querySelector('[data-res-cta]').href,
      previa: raiz.querySelector('[data-res-previa]').textContent.trim(),
      menosDesabilitado: raiz.querySelector('[data-res-menos]').disabled,
      dataMin: raiz.querySelector('[data-res-data]').getAttribute('min'),
      tipoData: raiz.querySelector('[data-res-data]').type,
    });
  })()`));
  checar(resInicial.existe, 'a seção de reserva existe');
  checar(resInicial.pessoas === '2', 'começa com 2 pessoas', resInicial.pessoas);
  checar(resInicial.previa === '', 'a prévia começa vazia');
  checar(resInicial.href.includes('wa.me'), 'o CTA já aponta para o WhatsApp');
  checar(!!resInicial.dataMin, 'o campo de data tem mínimo (impede reservar para ontem)');
  checar(resInicial.tipoData === 'date', 'usa o seletor de data nativo do aparelho');

  // Toca no "+" duas vezes
  const posMais = await centroDe('[data-res-mais]');
  await tocar(posMais.x, posMais.y);
  await tocar(posMais.x, posMais.y);
  const dep1 = JSON.parse(await js(`JSON.stringify({
    pessoas: document.querySelector('[data-res-pessoas-valor]').textContent.trim(),
    previa: document.querySelector('[data-res-previa]').textContent.trim(),
  })`));
  checar(dep1.pessoas === '4', 'tocar duas vezes no + leva a 4 pessoas', dep1.pessoas);
  checar(dep1.previa.includes('4'), 'a prévia aparece e traz o número');

  // Preenche o resto por evento (o seletor de data é do sistema)
  const dep2 = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-reserva]');
    const d = raiz.querySelector('[data-res-data]');
    d.value = '2026-12-24';
    d.dispatchEvent(new Event('change', { bubbles: true }));
    const p = raiz.querySelector('[data-res-periodo]');
    p.checked = true; p.dispatchEvent(new Event('change', { bubbles: true }));
    const h = raiz.querySelector('[data-res-horario]');
    h.checked = true; h.dispatchEvent(new Event('change', { bubbles: true }));
    const o = raiz.querySelector('[data-res-ocasiao]');
    o.checked = true; o.dispatchEvent(new Event('change', { bubbles: true }));
    const a = raiz.querySelector('[data-res-cta]');
    return JSON.stringify({
      href: a.href,
      msg: decodeURIComponent(new URL(a.href).searchParams.get('text') || ''),
      previa: raiz.querySelector('[data-res-previa]').textContent.trim(),
      periodo: p.value, horario: h.value, ocasiao: o.value,
    });
  })()`));
  checar(dep2.msg.includes('Pessoas: 4'), 'a mensagem traz o número de pessoas');
  checar(dep2.msg.includes('24 de dezembro'), 'a data sai por extenso', dep2.msg.split('\n')[3]);
  checar(!dep2.msg.includes('23 de dezembro'), 'a data NÃO regride um dia (erro de fuso)');
  checar(dep2.msg.toLowerCase().includes(dep2.periodo.toLowerCase()), 'a mensagem traz o período');
  checar(dep2.msg.includes(dep2.horario), 'a mensagem traz o horário');
  checar(dep2.msg.toLowerCase().includes(dep2.ocasiao.toLowerCase()), 'a mensagem traz a ocasião');
  checar(
    dep2.previa.replace(/\s+/g, ' ') === dep2.msg.replace(/\s+/g, ' '),
    'a prévia na tela é IGUAL ao que vai no link',
  );
  // `Â` + qualquer coisa daria falso positivo em nomes com Â ("Ânima").
  // Mojibake real põe um caractere U+0080–U+00BF logo depois do Ã ou Â.
  checar(!/Ã[-¿]|â€|Â[-¿]/.test(dep2.msg), 'a mensagem não tem acentuação corrompida');

  // Teto e piso do contador
  const limites = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-reserva]');
    const mais = raiz.querySelector('[data-res-mais]');
    const menos = raiz.querySelector('[data-res-menos]');
    for (let i = 0; i < 30; i++) mais.click();
    const noTeto = {
      valor: raiz.querySelector('[data-res-pessoas-valor]').textContent.trim(),
      maisDesabilitado: mais.disabled,
    };
    for (let i = 0; i < 30; i++) menos.click();
    return JSON.stringify({
      noTeto,
      noPiso: {
        valor: raiz.querySelector('[data-res-pessoas-valor]').textContent.trim(),
        menosDesabilitado: menos.disabled,
      },
      max: raiz.dataset.reservaMax,
    });
  })()`));
  checar(limites.noTeto.valor === limites.max, `o contador para no teto (${limites.max})`, limites.noTeto.valor);
  checar(limites.noTeto.maisDesabilitado, 'o botão + desabilita no teto');
  checar(limites.noPiso.valor === '1', 'o contador para em 1, nunca em 0', limites.noPiso.valor);
  checar(limites.noPiso.menosDesabilitado, 'o botão − desabilita no piso');

  // Limpar
  const limpo = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-reserva]');
    raiz.querySelector('[data-res-limpar]').click();
    return JSON.stringify({
      pessoas: raiz.querySelector('[data-res-pessoas-valor]').textContent.trim(),
      previa: raiz.querySelector('[data-res-previa]').textContent.trim(),
      href: raiz.querySelector('[data-res-cta]').href,
      guardado: localStorage.getItem('ana:reserva:v1'),
      data: raiz.querySelector('[data-res-data]').value,
      radiosMarcados: raiz.querySelectorAll('input[type=radio]:checked').length,
    });
  })()`));
  checar(limpo.pessoas === '2', 'limpar volta para 2 pessoas', limpo.pessoas);
  checar(limpo.previa === '', 'limpar esvazia a prévia');
  checar(limpo.data === '', 'limpar apaga a data');
  checar(limpo.radiosMarcados === 0, 'limpar desmarca todas as opções', String(limpo.radiosMarcados));
  checar(limpo.guardado === null, 'limpar apaga o localStorage de verdade', String(limpo.guardado));
  checar(!decodeURIComponent(limpo.href).includes('Pessoas:'), 'o link volta à mensagem genérica');

  /* ── Persistência ─────────────────────────────────────────────── */
  console.log('\n── Persistência ' + '─'.repeat(46));
  await js(`(() => {
    const raiz = document.querySelector('[data-reserva]');
    raiz.querySelector('[data-res-mais]').click();
    const h = raiz.querySelector('[data-res-horario]');
    h.checked = true; h.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await cdp('Page.navigate', { url });
  await sleep(2800);
  const apos = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-reserva]');
    return JSON.stringify({
      pessoas: raiz.querySelector('[data-res-pessoas-valor]').textContent.trim(),
      horarioMarcado: !!raiz.querySelector('[data-res-horario]:checked'),
    });
  })()`));
  checar(apos.pessoas === '3', 'a escolha sobrevive ao recarregar', apos.pessoas);
  checar(apos.horarioMarcado, 'o horário continua marcado depois do recarregamento');

  ws.close();
  edge.kill();
}

await rodar(false);
await rodar(true);

console.log('\n' + '═'.repeat(64));
console.log(falhas ? `  ${falhas} de ${total} FALHARAM` : `  ${total}/${total} ok`);
console.log('═'.repeat(64) + '\n');
process.exit(falhas ? 1 : 0);
