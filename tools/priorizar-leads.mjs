/**
 * Transforma o CSV verificado na FILA DE DISPARO: quem abordar primeiro, por quê,
 * e com qual gancho.
 *
 * ── A REGRA, E DE ONDE ELA VEM ──────────────────────────────────────────
 * O instinto é abordar quem "não tem site". Os números desta base dizem outra
 * coisa. De 347 salões do Paraná:
 *
 *   144  sem site nenhum
 *   119  só Instagram/Facebook no campo site
 *    84  "site próprio" — dos quais só 30 tinham site que presta
 *
 * Ou seja: 54 dos 84 que seriam descartados são lead, e vários são lead MELHOR
 * que o de campo vazio. Quem paga Trinks ou monta um Linktree já decidiu que
 * presença online importa e já gasta com isso — só não tem site. Quem tem
 * campo vazio muitas vezes não liga para internet, e é o mais difícil de
 * converter.
 *
 * Daí a ordem de prioridade abaixo. Ela não ordena por "quão carente" o lead
 * é, e sim por QUANTO ELE JÁ DEMONSTROU que se importa:
 *
 *   A  já paga por presença online e não tem site
 *      (agendamento, construtor grátis, bio-link, site morto/parqueado)
 *   B  cuida do Instagram e não tem site
 *      (rede-social, com peso por número de avaliações)
 *   C  tem site, mas o site é ruim
 *      (site-fraco — o argumento muda, mas continua havendo argumento)
 *   D  sem nenhuma presença
 *      (sem-site puro — volume, não qualidade)
 *   —  descarte: site real e bom
 *
 * O desempate dentro de cada faixa é a REPUTAÇÃO (avaliações × nota): um salão
 * com 150 avaliações e 4,8 tem movimento, tem com que pagar, e tem o que
 * mostrar num site. Um com 3 avaliações não tem nem conteúdo para a página.
 *
 * uso:
 *   node tools/priorizar-leads.mjs <csv-verificado> [--saida X.csv] [--min-avaliacoes N]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const entrada = args[0];
if (!entrada || !existsSync(entrada)) {
  console.error('uso: node tools/priorizar-leads.mjs <csv-verificado> [--saida X.csv] [--min-avaliacoes N]');
  process.exit(1);
}
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const saida = opt('--saida', entrada.replace(/\.csv$/i, '') + '_fila.csv');
const minAval = Number(opt('--min-avaliacoes', '0'));

/* ── CSV ────────────────────────────────────────────────────────────────── */
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
  writeFileSync(caminho, '﻿' + [cab.join(';')]
    .concat(regs.map((r) => cab.map((c) => esc(r[c])).join(';'))).join('\r\n') + '\r\n', 'utf8');
}

const num = (v) => Number(String(v || '').replace(/[^\d]/g, '')) || 0;
const nota = (v) => Number(String(v || '').replace(',', '.')) || 0;

/* ── Faixa e gancho ─────────────────────────────────────────────────────
   O gancho é a PRIMEIRA FRASE da abordagem — o que o lead tem hoje e que
   justifica a conversa. Não é a mensagem pronta: é o motivo dela.        */
function avaliar(l) {
  const status = (l.SiteStatus || '').trim();
  const classe = (l.Classificacao || '').trim();

  if (status === 'agendamento')
    return { faixa: 'A', gancho: `já paga ${l.SiteDominio} para agendar, mas não tem site próprio` };
  if (status === 'construtor')
    return { faixa: 'A', gancho: `a página está num construtor grátis (${l.SiteDominio})` };
  if (status === 'bio-link')
    return { faixa: 'A', gancho: `usa ${l.SiteDominio} como se fosse site` };
  if (status === 'morto')
    return { faixa: 'A', gancho: `tem domínio (${l.SiteDominio}) mas ele não abre: ${l.SiteMotivo}` };

  if (status === 'site-fraco')
    return { faixa: 'C', gancho: `tem site, mas ${l.SiteMotivo}` };
  if (status === 'site-real')
    return { faixa: '-', gancho: 'site próprio e funcionando — descartar' };

  if (classe === 'rede-social' || status === 'rede-social') {
    const d = (l.SiteDominio || '').toLowerCase();
    // WhatsApp NÃO é rede social aqui: quem põe um wa.me no campo "site" do
    // Maps não tem nem perfil para mostrar — o link é o telefone de novo.
    // Isso é MAIS carente que Instagram, não menos, e o gancho muda: não dá
    // para dizer "você cuida do seu Instagram" para quem não tem um.
    if (/^(wa\.me|api\.whatsapp\.com|whatsapp\.com)$/.test(d))
      return { faixa: 'B', gancho: 'no campo site do Google tem só o WhatsApp' };
    const rede = d.includes('facebook') ? 'Facebook'
      : d.includes('instagram') ? 'Instagram'
      : d || 'rede social';
    return { faixa: 'B', gancho: `cuida do ${rede} e não tem site` };
  }
  if (classe === 'sem-site')
    // ⚠️ "sem rede NO MAPS" e não "sem rede": o campo vem vazio quando o dono
    // nunca preencheu o perfil do Google. Ele pode ter Instagram ativo e não
    // ter ligado os dois — é comum. Antes de abordar, olhar o Instagram pelo
    // nome; o gancho muda completamente se houver.
    return { faixa: 'D', gancho: 'campo site vazio no Google (conferir Instagram pelo nome)' };

  return { faixa: 'D', gancho: 'sem informação de site' };
}

/** Reputação: avaliações pesam, mas com raiz — 400 avaliações não valem
    10× mais que 40. A nota entra como multiplicador suave; abaixo de 4,0
    o salão tem problema de serviço, e site nenhum resolve isso. */
function reputacao(l) {
  const a = num(l.Avaliacoes);
  const n = nota(l.Nota);
  if (!a) return 0;
  const base = Math.sqrt(a);
  const mult = n >= 4.5 ? 1.2 : n >= 4.0 ? 1.0 : n > 0 ? 0.6 : 0.9;
  return base * mult;
}

const PESO_FAIXA = { A: 1000, B: 700, C: 400, D: 100, '-': 0 };

/* ── Execução ───────────────────────────────────────────────────────────── */
const { cabecalho, registros } = lerCsv(entrada);
for (const nova of ['Faixa', 'Score', 'Gancho']) {
  if (!cabecalho.includes(nova)) cabecalho.push(nova);
}

for (const l of registros) {
  const { faixa, gancho } = avaliar(l);
  l.Faixa = faixa;
  l.Gancho = gancho;
  l.Score = (PESO_FAIXA[faixa] + reputacao(l) * 10).toFixed(1);
}

// Descarta quem não tem telefone: sem canal, não há abordagem possível.
const semTelefone = registros.filter((l) => !(l.Telefone || '').trim()).length;

const fila = registros
  .filter((l) => l.Faixa !== '-')
  .filter((l) => (l.Telefone || '').trim())
  .filter((l) => num(l.Avaliacoes) >= minAval)
  .sort((a, b) => Number(b.Score) - Number(a.Score));

escreverCsv(saida, cabecalho, fila);

/* ── Relatório ──────────────────────────────────────────────────────────── */
const porFaixa = {};
for (const l of fila) (porFaixa[l.Faixa] = porFaixa[l.Faixa] || []).push(l);

const ROTULO = {
  A: 'já paga por presença online, sem site  → MAIOR CONVERSÃO',
  B: 'cuida do Instagram, sem site',
  C: 'tem site, mas o site é ruim',
  D: 'sem presença nenhuma                   → volume',
};

console.log('\n' + '═'.repeat(74));
console.log(`  FILA DE DISPARO — ${fila.length} leads de ${registros.length}`);
console.log('═'.repeat(74));
for (const f of ['A', 'B', 'C', 'D']) {
  const g = porFaixa[f] || [];
  if (!g.length) continue;
  console.log(`\n  FAIXA ${f} · ${g.length} leads — ${ROTULO[f]}`);
  console.log('  ' + '─'.repeat(70));
  for (const l of g.slice(0, 5)) {
    console.log(`    ${(l.Nome || '').slice(0, 30).padEnd(30)} ${(l.Cidade || '').slice(0, 13).padEnd(13)} ` +
      `${String(num(l.Avaliacoes)).padStart(4)} aval  ${l.Gancho.slice(0, 46)}`);
  }
  if (g.length > 5) console.log(`    ... mais ${g.length - 5}`);
}
const descartados = registros.length - fila.length;
console.log('\n' + '─'.repeat(74));
console.log(`  descartados: ${descartados}  (site real e bom, ou sem telefone: ${semTelefone})`);
console.log('═'.repeat(74));
console.log(`\n  salvo em: ${saida}\n`);
