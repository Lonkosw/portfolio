/**
 * Enriquece um CSV do Apex Leads Extractor abrindo a FICHA de cada lead.
 *
 * ── POR QUE ISTO EXISTE ──────────────────────────────────────────────────
 * O Apex lê os dados do card da LISTA do Google Maps. O Google mudou esse
 * card: hoje ele traz só nome, nota, categoria e horário. Some dali o
 * telefone, a contagem de avaliações, o site e — o mais traiçoeiro — o
 * endereço, que passa a vir como o caractere do ícone de acessibilidade
 * (U+E934) ou como o horário de fechamento.
 *
 * Medido no CSV de 347 salões do Paraná: Telefone 0%, Site 0%, Avaliações 0%,
 * e Endereço útil em apenas 19%.
 *
 * A FICHA individual (`/maps/place/...`) continua trazendo tudo, com
 * seletores que não dependem do idioma da interface:
 *
 *   a[data-item-id="authority"]      → site
 *   button[data-item-id^="phone"]    → telefone (no aria-label)
 *   button[data-item-id="address"]   → endereço (no aria-label)
 *
 * Como o Apex já grava `LinkMaps` em 100% das linhas, dá para consertar o
 * arquivo que já existe sem reextrair nada.
 *
 * ── A CLASSIFICAÇÃO, E POR QUE ELA É O PONTO ────────────────────────────
 * O campo "site" do Google Maps é, na maioria das vezes, um link de rede
 * social. Numa amostra de 6 salões: 1 site próprio, 1 Facebook, 3 Instagram,
 * 1 nada.
 *
 * Isso inverte o filtro óbvio. O lead que interessa não é o de campo vazio —
 * é o que tem `instagram.com` ali: já cuida de presença online, já gasta
 * tempo com isso, e não tem site. Campo vazio muitas vezes é quem não liga
 * para internet, e esse é o mais difícil de converter.
 *
 * uso:
 *   node tools/enriquecer-leads.mjs <arquivo.csv> [--saida X.csv]
 *                                   [--limite N] [--de N] [--intervalo ms]
 *
 * O progresso é salvo a cada 10 fichas: dá para matar no meio e retomar com
 * `--de`, porque o parcial já está em disco.
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* ── Argumentos ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const entrada = args[0];
if (!entrada || !existsSync(entrada)) {
  console.error('uso: node tools/enriquecer-leads.mjs <arquivo.csv> [--saida X.csv] [--limite N] [--de N]');
  process.exit(1);
}
const opt = (nome, padrao) => {
  const i = args.indexOf(nome);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
};
const saida = opt('--saida', entrada.replace(/\.csv$/i, '') + '_enriquecido.csv');
const limite = Number(opt('--limite', '0')) || Infinity;
const inicio = Number(opt('--de', '0'));
// Intervalo entre fichas. Não é superstição: o Maps devolve /sorry/ para
// rajada. 1,5–3,5s imita navegação humana e não custa quase nada no total.
const intervaloMin = Number(opt('--intervalo', '1500'));

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9500 + Math.floor(Math.random() * 400);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const aleatorio = (min, max) => min + Math.random() * (max - min);

/* ── CSV ────────────────────────────────────────────────────────────────
   O arquivo do Apex é UTF-8 com BOM, separado por ";" e com CRLF. O parser
   trata aspas mesmo o arquivo atual não tendo nenhuma: um endereço com ";"
   apareceria um dia e quebraria tudo em silêncio.                        */
function lerCsv(caminho) {
  let txt = readFileSync(caminho, 'utf8');
  if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);

  const linhas = [];
  let campo = '';
  let linha = [];
  let emAspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (emAspas) {
      if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') emAspas = false;
      else campo += c;
    } else if (c === '"') emAspas = true;
    else if (c === ';') { linha.push(campo); campo = ''; }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }

  const cabecalho = linhas.shift();
  return {
    cabecalho,
    registros: linhas
      .filter((l) => l.some((v) => v !== ''))
      .map((l) => Object.fromEntries(cabecalho.map((c, i) => [c, l[i] ?? '']))),
  };
}

function escreverCsv(caminho, cabecalho, registros) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const corpo = [cabecalho.join(';')]
    .concat(registros.map((r) => cabecalho.map((c) => esc(r[c])).join(';')))
    .join('\r\n');
  writeFileSync(caminho, '\ufeff' + corpo + '\r\n', 'utf8');
}

/* ── Classificação ──────────────────────────────────────────────────────
   Três baldes. O domínio cru vai junto numa coluna própria: quando aparecer
   algo que não é nem rede social nem site de verdade (plataforma de
   agendamento, por exemplo), dá para ver e decidir sem rodar tudo de novo. */
const REDES = [
  'instagram.com', 'facebook.com', 'fb.com', 'fb.me', 'tiktok.com',
  'youtube.com', 'youtu.be', 'twitter.com', 'x.com', 'linkedin.com',
  'wa.me', 'api.whatsapp.com', 'whatsapp.com', 'linktr.ee', 'linkr.bio',
  'beacons.ai', 'linkin.bio', 'bio.link', 'campsite.bio', 'msha.ke',
];

function classificar(site) {
  if (!site) return { classe: 'sem-site', dominio: '' };
  let host = '';
  try { host = new URL(site).hostname.replace(/^www\./i, '').toLowerCase(); }
  catch { return { classe: 'sem-site', dominio: '' }; }
  const rede = REDES.some((d) => host === d || host.endsWith('.' + d));
  return { classe: rede ? 'rede-social' : 'site-proprio', dominio: host };
}

/** Telefone brasileiro em E.164, e o link de WhatsApp que o Apex deixaria pronto. */
function normalizarTelefone(bruto) {
  const d = String(bruto || '').replace(/\D/g, '');
  if (!d) return { e164: '', wa: '' };
  // 10 dígitos = fixo com DDD, 11 = celular com DDD. Menos que isso não dá
  // para saber o DDD, e inventar um erraria o lead inteiro.
  if (d.length === 10 || d.length === 11) return { e164: '55' + d, wa: `https://wa.me/55${d}` };
  if (d.length === 12 || d.length === 13) return { e164: d, wa: `https://wa.me/${d}` };
  return { e164: '', wa: '' };
}

/* ── CDP ────────────────────────────────────────────────────────────────
   Mesma técnica das outras tools: Edge headless falando o protocolo direto,
   sem Playwright nem Puppeteer.                                           */
const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    '--disable-blink-features=AutomationControlled',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-leads-${PORT}`,
    '--window-size=1400,900',
    '--lang=pt-BR',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error('Edge não subiu — confira o caminho em EDGE.');
}

const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pendentes = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const i = ++seq;
    pendentes.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const evalJs = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId))
    ?.result?.result?.value;

/* A sonda roda DENTRO da ficha. Os três seletores usam `data-item-id`, que é
   estável entre idiomas — ao contrário do `data-value="Website"` que o Apex
   procura no card e que não existe mais em lugar nenhum. */
const SONDA = `(() => {
  const url = location.href;
  if (url.includes('consent.google') || url.includes('/sorry/')) return JSON.stringify({ bloqueio: true });
  const pronto = document.querySelector('h1') || document.querySelector('[data-item-id]');
  if (!pronto) return JSON.stringify({ pronto: false });

  const site = document.querySelector('a[data-item-id="authority"]');
  const tel = document.querySelector('button[data-item-id^="phone"]');
  const end = document.querySelector('button[data-item-id="address"]');

  // A contagem de avaliações fica num link/botão cujo rótulo diz "N avaliações".
  let avaliacoes = '';
  for (const el of document.querySelectorAll('[aria-label]')) {
    const m = (el.getAttribute('aria-label') || '').match(/^([\\d.,]+)\\s+avalia/i);
    if (m) { avaliacoes = m[1].replace(/[.,]/g, ''); break; }
  }

  let nota = '';
  const notaEl = document.querySelector('div.fontDisplayLarge, span.ceNzKf[aria-label]');
  if (notaEl) {
    const m = (notaEl.textContent || notaEl.getAttribute('aria-label') || '').match(/(\\d[.,]\\d)/);
    if (m) nota = m[1].replace('.', ',');
  }

  return JSON.stringify({
    pronto: true,
    site: site && site.href ? site.href : '',
    telefone: tel ? (tel.getAttribute('aria-label') || '').replace(/^telefone:\\s*/i, '').trim() : '',
    endereco: end ? (end.getAttribute('aria-label') || '').replace(/^endere.o:\\s*/i, '').trim() : '',
    avaliacoes,
    nota,
  });
})()`;

/** Navega e faz POLLING até a ficha responder — em vez de um sleep fixo e
    torcido. Ficha rápida custa 2s, ficha lenta tem até `tetoMs`. */
async function abrirFicha(url, tetoMs = 20000) {
  const alvo = url + (url.includes('?') ? '&' : '?') + 'hl=pt-BR';
  await send('Page.navigate', { url: alvo }, sessionId);
  const limiteT = Date.now() + tetoMs;
  let ultimo = null;
  while (Date.now() < limiteT) {
    await sleep(700);
    const bruto = await evalJs(SONDA);
    if (!bruto) continue;
    let d;
    try { d = JSON.parse(bruto); } catch { continue; }
    if (d.bloqueio) return { bloqueio: true };
    if (d.pronto) {
      ultimo = d;
      // O site costuma entrar no painel um instante depois do título. Se já
      // veio, não há o que esperar; se não veio, vale uma última olhada.
      if (d.site || d.telefone) return d;
    }
  }
  return ultimo || { pronto: false };
}

/* ── Execução ───────────────────────────────────────────────────────────── */
const { cabecalho, registros } = lerCsv(entrada);

// Colunas novas, acrescentadas só se ainda não existirem (permite rodar de novo).
for (const nova of ['Classificacao', 'SiteDominio', 'FonteFicha']) {
  if (!cabecalho.includes(nova)) cabecalho.push(nova);
}

const alvos = registros
  .map((r, i) => ({ r, i }))
  .filter(({ r }) => (r.LinkMaps || '').includes('/maps/place/'))
  .slice(inicio, inicio === 0 && limite === Infinity ? undefined : inicio + limite);

console.log(`\n  ${registros.length} leads no arquivo · ${alvos.length} com ficha para abrir`);
console.log(`  saída: ${saida}\n`);

const contagem = { 'site-proprio': 0, 'rede-social': 0, 'sem-site': 0 };
let ok = 0, falhas = 0, bloqueios = 0;
const t0 = Date.now();

for (let n = 0; n < alvos.length; n++) {
  const { r } = alvos[n];
  const d = await abrirFicha(r.LinkMaps);

  if (d.bloqueio) {
    bloqueios++;
    console.log(`  [${n + 1}/${alvos.length}] BLOQUEIO do Google — pausando 60s`);
    if (bloqueios >= 3) { console.log('\n  Três bloqueios seguidos. Parando para não queimar o IP.'); break; }
    await sleep(60000);
    continue;
  }
  bloqueios = 0;

  if (!d.pronto) {
    falhas++;
    console.log(`  [${n + 1}/${alvos.length}] ${(r.Nome || '').slice(0, 30).padEnd(30)} ficha não abriu`);
  } else {
    const { classe, dominio } = classificar(d.site);
    const { e164, wa } = normalizarTelefone(d.telefone);

    if (d.site) r.Site = d.site;
    if (d.telefone) { r.Telefone = d.telefone; r.TelefoneNormalizado = e164; r.WhatsApp = wa; }
    if (d.endereco) r.Endereco = d.endereco;
    if (d.avaliacoes) r.Avaliacoes = d.avaliacoes;
    if (d.nota && !r.Nota) r.Nota = d.nota;
    r.Classificacao = classe;
    r.SiteDominio = dominio;
    r.FonteFicha = new Date().toISOString().slice(0, 10);

    contagem[classe]++;
    ok++;
    const marca = classe === 'rede-social' ? '★' : classe === 'sem-site' ? '·' : ' ';
    console.log(
      `  [${n + 1}/${alvos.length}] ${marca} ${(r.Nome || '').slice(0, 30).padEnd(30)} ` +
      `${(d.telefone || '—').padEnd(18)} ${dominio || '(sem site)'}`,
    );
  }

  // Parcial em disco a cada 10: matar o processo no meio não perde trabalho.
  if ((n + 1) % 10 === 0) escreverCsv(saida, cabecalho, registros);
  await sleep(aleatorio(intervaloMin, intervaloMin + 2000));
}

escreverCsv(saida, cabecalho, registros);

const min = ((Date.now() - t0) / 60000).toFixed(1);
console.log('\n' + '═'.repeat(66));
console.log(`  ${ok} fichas lidas · ${falhas} falharam · ${min} min`);
console.log('─'.repeat(66));
console.log(`  ★ rede social (ALVO PRINCIPAL) : ${String(contagem['rede-social']).padStart(4)}`);
console.log(`  · sem site    (alvo secundário): ${String(contagem['sem-site']).padStart(4)}`);
console.log(`    site próprio (descartar)     : ${String(contagem['site-proprio']).padStart(4)}`);
console.log('═'.repeat(66));
console.log(`\n  salvo em: ${saida}\n`);

edge.kill();
process.exit(0);
