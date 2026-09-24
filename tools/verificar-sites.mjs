/**
 * Abre o site de cada lead e diz se ele PRESTA.
 *
 * ── POR QUE ISTO EXISTE ──────────────────────────────────────────────────
 * O `enriquecer-leads.mjs` separa em três baldes olhando só o domínio. Isso
 * já é muito melhor que nada, mas o domínio mente das duas direções:
 *
 *   - `bit.ly`, `contate.me`, `bio.site`, `tr.ee`, `sites.google.com`,
 *     `my.canva.site` caíram no balde "site próprio" e NÃO são site nenhum —
 *     são bio-link e página de construtor grátis, exatamente o perfil de quem
 *     compra uma landing page;
 *   - `trinks.com`, `appbarber`, `belasis.app` são plataformas de AGENDAMENTO.
 *     Quem está nelas já paga por presença online e não tem site próprio: é
 *     lead quente, e estava indo para o lixo;
 *   - e um `.com.br` de verdade pode estar morto, sem HTTPS, ou ser uma
 *     página de 2012 que não abre no celular — caso em que o argumento deixa
 *     de ser "você não tem site" e passa a ser "o seu está afastando cliente".
 *
 * Medido nos 84 "site próprio" do CSV do Paraná: pelo menos 11 eram bio-link,
 * construtor grátis ou plataforma de agendamento.
 *
 * ── O QUE ELE CLASSIFICA ────────────────────────────────────────────────
 *   site-real        responde, é do negócio, e serve de site
 *   site-fraco       responde mas é ruim: sem HTTPS, não é responsivo,
 *                    demora demais, ou é praticamente sem conteúdo
 *   agendamento      Trinks, AppBarber, Belasis, Booksy e afins
 *   bio-link         Linktree, bio.site, contate.me, encurtador
 *   construtor       sites.google.com, canva.site, wix grátis, negocio.site
 *   morto            não resolve, recusa conexão, 4xx/5xx
 *
 * Os quatro do meio são ALVO — não descarte. Só `site-real` é descarte, e
 * mesmo assim vale olhar o `Motivo`.
 *
 * uso:
 *   node tools/verificar-sites.mjs <csv-enriquecido> [--saida X.csv]
 *                                  [--limite N] [--timeout 12000]
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const entrada = args[0];
if (!entrada || !existsSync(entrada)) {
  console.error('uso: node tools/verificar-sites.mjs <csv-enriquecido> [--saida X.csv] [--limite N]');
  process.exit(1);
}
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const saida = opt('--saida', entrada.replace(/\.csv$/i, '') + '_sites.csv');
const limite = Number(opt('--limite', '0')) || Infinity;
const TIMEOUT = Number(opt('--timeout', '12000'));

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9200 + Math.floor(Math.random() * 200);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Listas de domínio ──────────────────────────────────────────────────
   Não é heurística de texto: são plataformas conhecidas, e o domínio basta
   para saber o que são. Texto seria adivinhação; isto é fato.            */
const AGENDAMENTO = [
  'trinks.com', 'booksy.com', 'appbarber.com.br', 'belasis.app', 'avec.beauty',
  'agendrix.com', 'simplesagenda.com.br', 'belezaneon.com', 'gendo.com.br',
  'meusalao.app', 'salaovip.com.br', 'zapbarber.com',
];
const BIO_LINK = [
  'linktr.ee', 'bio.link', 'bio.site', 'beacons.ai', 'contate.me', 'tr.ee',
  'instabio.cc', 'linkin.bio', 'campsite.bio', 'msha.ke', 'bit.ly', 'wa.link',
  'linklist.bio', 'solo.to', 'lnk.bio', 'many.link',
];
const CONSTRUTOR = [
  'sites.google.com', 'canva.site', 'my.canva.site', 'negocio.site',
  'wixsite.com', 'blogspot.com', 'wordpress.com', 'webnode.', 'jimdo',
  'business.site', 'godaddysites.com', 'weebly.com',
];
const REDES = [
  'instagram.com', 'facebook.com', 'fb.com', 'tiktok.com', 'youtube.com',
  'wa.me', 'api.whatsapp.com', 'whatsapp.com', 'twitter.com', 'x.com',
];

const casa = (host, lista) => lista.some((d) => host === d || host.endsWith('.' + d) || host.includes(d));

/* ── CSV (mesmo formato do Apex: BOM, ";", CRLF) ─────────────────────── */
function lerCsv(caminho) {
  let txt = readFileSync(caminho, 'utf8');
  if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) {
      if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ';') { linha.push(campo); campo = ''; }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const cab = linhas.shift();
  return { cabecalho: cab, registros: linhas.filter((l) => l.some((v) => v !== ''))
    .map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i] ?? '']))) };
}
function escreverCsv(caminho, cab, regs) {
  const esc = (v) => { const s = String(v ?? ''); return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  writeFileSync(caminho, '\ufeff' + [cab.join(';')]
    .concat(regs.map((r) => cab.map((c) => esc(r[c])).join(';'))).join('\r\n') + '\r\n', 'utf8');
}

/* ── CDP ────────────────────────────────────────────────────────────────
   Emulando CELULAR de propósito: é onde o cliente do salão abre o link, e
   é onde um site velho falha. Um site que só quebra no telefone continua
   passando num teste de desktop.                                          */
const edge = spawn(EDGE, [
  '--headless=new', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\edge-sites-${PORT}`,
  '--window-size=390,844', '--lang=pt-BR', 'about:blank',
], { stdio: 'ignore' });

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return (await r.json()).webSocketDebuggerUrl; } catch {}
    await sleep(500);
  }
  throw new Error('Edge não subiu — confira o caminho em EDGE.');
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
await send('Emulation.setDeviceMetricsOverride',
  { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }, sessionId);
const evalJs = async (e) => (await send('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true }, sessionId))?.result?.result?.value;

/* A sonda mede o que decide se um site "presta" no celular. Nada de opinião:
   viewport declarado, largura que estoura a tela, quantidade de texto real e
   se existe algum caminho para contato. */
const SONDA = `(() => {
  const txt = (document.body && document.body.innerText || '').replace(/\\s+/g, ' ').trim();
  const larg = document.documentElement.scrollWidth;
  const temViewport = !!document.querySelector('meta[name="viewport"]');
  const html = (document.documentElement.outerHTML || '');
  return JSON.stringify({
    titulo: (document.title || '').slice(0, 80),
    caracteres: txt.length,
    temViewport,
    estouraTela: larg > 420,
    larguraDoc: larg,
    temWhatsapp: /wa\\.me|api\\.whatsapp|whatsapp/i.test(html),
    temTelefone: /tel:/i.test(html) || /\\(\\d{2}\\)\\s*\\d{4,5}-\\d{4}/.test(txt),
    temInstagram: /instagram\\.com/i.test(html),
    // "Em construção" e domínio parqueado são site que existe e não serve.
    parqueado: /em constru|under construction|dom[ií]nio .*(venda|expirado)|website coming soon|conta suspensa|suspended|not found|error 404/i.test(txt),
    // O <title> IGUAL AO DOMÍNIO é a assinatura mais confiável de domínio
    // parqueado ou "site em breve" — mais confiável que contar caracteres,
    // que confunde página vazia com SPA lenta. Medido: studiodelascascavel,
    // salaomeusalao, studiorissi e blessedlondrina têm todos o título igual
    // ao host, e o texto NÃO cresce entre 3s e 15s.
    tituloEhDominio: (() => {
      const t = (document.title || '').toLowerCase().replace(/^www\./, '').trim();
      const h = location.hostname.toLowerCase().replace(/^www\./, '');
      return t === h || t === h.replace(/\.(com|net|org)(\.br)?$/, '');
    })(),
    vazio: txt.length < 220
  });
})()`;

async function verificar(urlBruta) {
  let u;
  try { u = new URL(urlBruta); } catch { return { classe: 'morto', motivo: 'URL inválida' }; }
  const host = u.hostname.replace(/^www\./i, '').toLowerCase();

  // Classificação por domínio vem primeiro: é fato, não precisa abrir.
  if (casa(host, REDES)) return { classe: 'rede-social', motivo: host, host };
  if (casa(host, AGENDAMENTO)) return { classe: 'agendamento', motivo: 'plataforma ' + host, host };
  if (casa(host, BIO_LINK)) return { classe: 'bio-link', motivo: 'bio-link ' + host, host };
  if (casa(host, CONSTRUTOR)) return { classe: 'construtor', motivo: 'construtor ' + host, host };

  // Domínio próprio: aí sim precisa abrir para saber se está vivo e se presta.
  const t0 = Date.now();
  await send('Page.navigate', { url: u.href }, sessionId);

  let d = null;
  const limiteT = Date.now() + TIMEOUT;
  while (Date.now() < limiteT) {
    await sleep(800);
    const bruto = await evalJs(SONDA);
    if (!bruto) continue;
    try { d = JSON.parse(bruto); } catch { continue; }
    if (d && !d.vazio) break;
  }
  const ms = Date.now() - t0;

  if (!d) return { classe: 'morto', motivo: 'não respondeu', host };
  if (d.parqueado) return { classe: 'morto', motivo: 'em construção/parqueado/404', host };
  if (d.tituloEhDominio && d.vazio) return { classe: 'morto', motivo: 'domínio parqueado (título = domínio)', host };
  if (d.vazio) return { classe: 'morto', motivo: `sem conteúdo (${d.caracteres} car.)`, host };

  const problemas = [];
  if (u.protocol === 'http:') problemas.push('sem HTTPS');
  if (!d.temViewport) problemas.push('não é responsivo');
  if (d.estouraTela) problemas.push(`estoura a tela (${d.larguraDoc}px)`);
  if (ms > 8000) problemas.push(`lento (${(ms / 1000).toFixed(1)}s)`);
  if (d.caracteres < 600) problemas.push('quase sem conteúdo');
  if (!d.temWhatsapp && !d.temTelefone) problemas.push('sem contato visível');

  return problemas.length
    ? { classe: 'site-fraco', motivo: problemas.join(' · '), host }
    : { classe: 'site-real', motivo: `ok (${(ms / 1000).toFixed(1)}s)`, host };
}

/* ── Execução ───────────────────────────────────────────────────────────── */
const { cabecalho, registros } = lerCsv(entrada);
for (const nova of ['SiteStatus', 'SiteMotivo', 'Alvo']) {
  if (!cabecalho.includes(nova)) cabecalho.push(nova);
}

const alvos = registros.filter((r) => (r.Site || '').trim()).slice(0, limite);
console.log(`\n  ${registros.length} leads · ${alvos.length} com site para verificar\n`);

const cont = {};
let n = 0;
const t0 = Date.now();

for (const r of alvos) {
  n++;
  const v = await verificar(r.Site.trim());
  r.SiteStatus = v.classe;
  r.SiteMotivo = v.motivo;
  // Só quem tem site DE VERDADE e bom deixa de ser alvo.
  r.Alvo = v.classe === 'site-real' ? 'nao' : 'sim';
  cont[v.classe] = (cont[v.classe] || 0) + 1;

  const marca = v.classe === 'site-real' ? ' ' : '★';
  console.log(
    `  [${String(n).padStart(3)}/${alvos.length}] ${marca} ${(r.Nome || '').slice(0, 28).padEnd(28)} ` +
    `${v.classe.padEnd(12)} ${v.motivo.slice(0, 42)}`,
  );
  if (n % 10 === 0) escreverCsv(saida, cabecalho, registros);
}
escreverCsv(saida, cabecalho, registros);

console.log('\n' + '═'.repeat(72));
console.log(`  ${n} sites verificados em ${((Date.now() - t0) / 60000).toFixed(1)} min`);
console.log('─'.repeat(72));
const ordem = ['bio-link', 'construtor', 'agendamento', 'site-fraco', 'morto', 'rede-social', 'site-real'];
for (const c of ordem) {
  if (!cont[c]) continue;
  const alvo = c === 'site-real' ? '  (descartar)' : '  ★ ALVO';
  console.log(`  ${c.padEnd(14)} ${String(cont[c]).padStart(4)}${alvo}`);
}
console.log('═'.repeat(72));
console.log(`\n  salvo em: ${saida}\n`);

edge.kill();
process.exit(0);
