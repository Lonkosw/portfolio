/**
 * Filtra a fila de leads e escreve a MENSAGEM DE WHATSAPP de cada um.
 *
 * ── O QUE ELE RESOLVE ───────────────────────────────────────────────────
 * A fila do `priorizar-leads.mjs` tem 313 linhas e uma coluna `Gancho` com o
 * motivo da conversa. Faltavam duas coisas para virar disparo de verdade:
 *
 *   1. RECORTAR a lista pelo que importa naquele dia ("só quem tem zap",
 *      "só Curitiba", "só faixa A com mais de 100 avaliações");
 *   2. a MENSAGEM pronta, que muda conforme o nicho e conforme o que o lead
 *      já tem — falar de Instagram com quem não tem Instagram queima o
 *      contato na primeira linha.
 *
 * ── O FILTRO QUE MAIS IMPORTA: TEM ZAP? ─────────────────────────────────
 * Medido na base do Paraná: 128 dos 313 leads têm telefone FIXO. Mandar
 * WhatsApp para fixo é mensagem que nunca chega e contato queimado à toa.
 * `--com-zap` separa os 185 que têm celular.
 *
 * O critério é o 9 depois do DDD: celular brasileiro tem 9 dígitos começando
 * em 9, fixo tem 8 começando em 2-5. Não é adivinhação, é o plano de
 * numeração da Anatel.
 *
 * ── A MENSAGEM ──────────────────────────────────────────────────────────
 * Não é um texto só com o nome trocado. Ela é montada a partir de TRÊS
 * coisas que já estão no CSV:
 *
 *   nicho     (da categoria do Maps) → o que o site precisa mostrar
 *   gancho    (da faixa A-D)         → por que a conversa faz sentido HOJE
 *   reputação (avaliações e nota)    → a prova social dele, citada de volta
 *
 * ⚠️ NADA de número inventado. A mensagem só cita avaliação e nota quando
 * elas existem no CSV, e cita o valor exato. Um "vi que você tem ótimas
 * avaliações" genérico soa igual a spam; "vi as 305 avaliações com 4,9"
 * prova que alguém olhou.
 *
 * uso:
 *   node tools/filtrar-leads.mjs <csv-fila> [filtros...]
 *
 * filtros:
 *   --com-zap              só celular (descarta fixo)
 *   --sem-site             só quem não tem site nenhum
 *   --faixa A,B            só estas faixas
 *   --cidade "Curitiba"    só esta cidade (aceita parte do nome)
 *   --nicho salao,barbearia
 *   --min-avaliacoes 50
 *   --nota-minima 4.0
 *   --limite 40            só os N melhores
 *   --saida X.csv
 *   --txt X.txt            também escreve as mensagens num .txt para copiar
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const entrada = args[0];
if (!entrada || !existsSync(entrada)) {
  console.error('uso: node tools/filtrar-leads.mjs <csv-fila> [--com-zap] [--faixa A,B] [--cidade X] ...');
  process.exit(1);
}
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const flag = (n) => args.includes(n);

const saida = opt('--saida', entrada.replace(/\.csv$/i, '') + '_filtrado.csv');
const arqTxt = opt('--txt', '');
const limite = Number(opt('--limite', '0')) || Infinity;
const minAval = Number(opt('--min-avaliacoes', '0'));
const notaMin = Number(opt('--nota-minima', '0'));
const faixas = opt('--faixa', '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
const cidadeFiltro = opt('--cidade', '').toLowerCase();
const nichosFiltro = opt('--nicho', '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

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

/** Celular tem 9 dígitos começando em 9 depois do DDD; fixo tem 8 começando
    em 2-5. Regra da Anatel, não chute. */
function temZap(l) {
  const d = String(l.Telefone || '').replace(/\D/g, '');
  const semDdi = d.length > 11 ? d.slice(-11) : d;
  return semDdi.length === 11 && semDdi[2] === '9';
}

/* ── Nicho ──────────────────────────────────────────────────────────────
   Sai da categoria que o Google Maps atribuiu, com o nome do negócio como
   desempate. Cada nicho diz O QUE O SITE PRECISA MOSTRAR — é isso que faz a
   mensagem parar de soar genérica.                                        */
const NICHOS = [
  { id: 'barbearia', casa: /barbearia|barbeiro|barber/i,
    rotulo: 'barbearia', mostra: 'os cortes, a equipe e o agendamento' },
  { id: 'unhas', casa: /manicure|pedicure|unha|nail|esmalteria/i,
    rotulo: 'estúdio de unhas', mostra: 'as fotos dos trabalhos e a tabela de serviços' },
  { id: 'cilios', casa: /c[ií]lio|sobrancelha|micropigmenta|lash|design/i,
    rotulo: 'estúdio de cílios e sobrancelhas', mostra: 'o antes e depois e os tipos de técnica' },
  { id: 'estetica', casa: /est[ée]tica|esteticista|spa|massag|depila|podólog|podolog/i,
    rotulo: 'clínica de estética', mostra: 'os procedimentos, os resultados e o agendamento' },
  { id: 'maquiagem', casa: /maquiagem|make|noiva/i,
    rotulo: 'estúdio de maquiagem', mostra: 'o portfólio de noivas e formaturas' },
  { id: 'cabelo', casa: /cabeleireir|sal[ãa]o|hair|beleza|coiffeur/i,
    rotulo: 'salão', mostra: 'as transformações, os serviços e o agendamento' },
];

function detectarNicho(l) {
  // ── A REGRA, e ela levou duas tentativas ────────────────────────────
  //
  // 1ª: testar categoria e nome juntos. ERRADO — "Salão de Beleza Elaine
  //     Ayala - Cabeleireiras Especialistas em Mechas - MANICURE -
  //     Sobrancelhas" tem categoria "Salão de Beleza", mas a palavra
  //     "manicure" no nome (que lista todos os serviços por SEO) fazia a
  //     mensagem oferecer site de estúdio de unhas para um salão completo.
  //
  // 2ª: só a categoria. ERRADO TAMBÉM, na direção oposta — o Google marca
  //     "Salão de Beleza" em quase tudo, e "Karol Nails" (que só faz unha)
  //     e "Estilo Hair Barbearia" viravam salão genérico.
  //
  // A regra que sobrou: o nome vence a categoria SÓ quando ele declara o
  // nicho de forma inequívoca — a palavra aparece no começo do nome, ou o
  // nome inteiro é curto e girando em torno dela. Nome comprido cheio de
  // serviço separado por hífen é lista de SEO, não identidade: aí manda a
  // categoria.
  const cat = (l.Categoria || '').trim();
  const nome = (l.Nome || '').trim();

  // Nome "limpo": curto e sem lista de serviços. É quando ele é confiável.
  const nomeCurto = nome.length <= 34 && (nome.match(/[-|·]/g) || []).length <= 1;
  if (nomeCurto) {
    for (const n of NICHOS) if (n.casa.test(nome)) return n;
  }

  // Categoria oficial: o que o dono escolheu como atividade principal.
  // "Fecha em breve" e afins são horário que vazou para o campo — ignorar.
  if (cat && !/^fecha em breve$|^aberto|^fechado|^\d/i.test(cat)) {
    for (const n of NICHOS) if (n.casa.test(cat)) return n;
  }

  // Sem categoria útil: o nome comprido é a única pista que resta.
  for (const n of NICHOS) if (n.casa.test(`${nome} ${l.Termo || ''}`)) return n;
  return { id: 'outro', rotulo: 'negócio', mostra: 'o que você faz e como agendar' };
}

/* ── Mensagem ───────────────────────────────────────────────────────────
   Curta de propósito: primeiro contato frio no WhatsApp que chega como
   textão não é lido. Uma frase de prova (que você olhou mesmo), uma de
   gancho (o que falta), uma de oferta, uma pergunta que dá saída fácil.   */
function montarMensagem(l, nicho) {
  const nome = (l.NomeLimpo || l.Nome || '').trim();
  const aval = num(l.Avaliacoes);
  const nt = nota(l.Nota);
  const cidade = (l.Cidade || '').trim();
  const faixa = (l.Faixa || '').trim();
  const dom = (l.SiteDominio || '').trim();

  // 1. PROVA — só com número real do CSV. Sem número, elogio genérico não entra.
  let prova;
  if (aval >= 30 && nt >= 4.3) {
    prova = `vi o perfil de vocês no Google, com ${aval} avaliações e nota ${String(l.Nota).replace('.', ',')}`;
  } else if (aval >= 30) {
    prova = `vi o perfil de vocês no Google, com ${aval} avaliações`;
  } else {
    prova = `achei vocês no Google${cidade ? ' aqui em ' + cidade : ''}`;
  }

  // 2. GANCHO — o que ele tem hoje. Muda por faixa, e nunca afirma o que o
  //    dado não garante (o campo vazio do Maps não prova ausência de Instagram).
  let gancho;
  const status = (l.SiteStatus || '').trim();
  // Nome da plataforma em vez do domínio cru: "belasis.app" e
  // "fiofio.belasis.app" são a mesma coisa para quem recebe, e o subdomínio
  // do próprio salão no meio da frase entrega que a mensagem foi gerada.
  const plataforma = dom.replace(/^.*?([a-z0-9-]+)\.(app|com|com\.br|net)$/i, '$1')
    .replace(/^\w/, (c) => c.toUpperCase());
  if (status === 'agendamento') gancho = `Notei que vocês já usam o ${plataforma} pra agendar, mas não têm um site próprio`;
  else if (status === 'bio-link') gancho = `Notei que o link de vocês é um ${plataforma}, que é página de links e não site`;
  else if (status === 'construtor') gancho = `Notei que a página de vocês está num construtor gratuito`;
  else if (status === 'morto') gancho = `Notei que o site ${dom} não está abrindo`;
  else if (status === 'site-fraco') gancho = `Dei uma olhada no site de vocês e ele ${(l.SiteMotivo || '').split(' · ')[0]}`;
  else if (/instagram/i.test(dom)) gancho = `Notei que vocês cuidam bem do Instagram, mas não têm um site`;
  else if (/facebook/i.test(dom)) gancho = `Notei que vocês têm Facebook, mas não têm um site`;
  else if (/wa\.me|whatsapp/i.test(dom)) gancho = `Notei que no Google o link de vocês vai direto pro WhatsApp, sem um site`;
  else gancho = `Notei que vocês não têm um site aparecendo no Google`;

  // 3. OFERTA — o que o site mostra, pelo nicho.
  const oferta = `Eu faço site pra ${nicho.rotulo} aqui da região: uma página que mostra ${nicho.mostra}, abre rápido no celular e manda o cliente direto pro seu WhatsApp.`;

  // 4. SAÍDA FÁCIL — pergunta fechada, sem preço na primeira mensagem.
  const fecho = `Posso te mandar um exemplo pronto pra você ver como ficaria? Leva 1 minuto.`;

  return `Oi! Tudo bem? Aqui é o Théo, ${prova}. ${gancho}. ${oferta} ${fecho}`;
}

/* ── Execução ───────────────────────────────────────────────────────────── */
const { cabecalho, registros } = lerCsv(entrada);
for (const nova of ['Nicho', 'TemZap', 'Mensagem', 'LinkDisparo']) {
  if (!cabecalho.includes(nova)) cabecalho.push(nova);
}

const descartes = { fixo: 0, faixa: 0, cidade: 0, nicho: 0, avaliacoes: 0, nota: 0, comSite: 0 };

let saiu = registros.filter((l) => {
  const n = detectarNicho(l);
  l.Nicho = n.rotulo;
  l.TemZap = temZap(l) ? 'sim' : 'nao';

  if (flag('--com-zap') && l.TemZap !== 'sim') { descartes.fixo++; return false; }
  if (flag('--sem-site') && (l.Site || '').trim()) { descartes.comSite++; return false; }
  if (faixas.length && !faixas.includes((l.Faixa || '').toUpperCase())) { descartes.faixa++; return false; }
  if (cidadeFiltro && !(l.Cidade || '').toLowerCase().includes(cidadeFiltro)) { descartes.cidade++; return false; }
  if (nichosFiltro.length && !nichosFiltro.some((f) => n.id.includes(f) || n.rotulo.toLowerCase().includes(f))) { descartes.nicho++; return false; }
  if (num(l.Avaliacoes) < minAval) { descartes.avaliacoes++; return false; }
  if (notaMin && nota(l.Nota) < notaMin) { descartes.nota++; return false; }
  return true;
});

saiu = saiu.slice(0, limite);

for (const l of saiu) {
  const n = detectarNicho(l);
  l.Mensagem = montarMensagem(l, n);
  const fone = String(l.TelefoneNormalizado || '').replace(/\D/g, '');
  l.LinkDisparo = fone ? `https://wa.me/${fone}?text=${encodeURIComponent(l.Mensagem)}` : '';
}

escreverCsv(saida, cabecalho, saiu);

if (arqTxt) {
  writeFileSync(arqTxt, saiu.map((l) =>
    `── ${l.Nome}  ·  ${l.Cidade}  ·  ${l.Telefone}  ·  faixa ${l.Faixa}\n${l.Mensagem}\n`
  ).join('\n'), 'utf8');
}

/* ── Relatório ──────────────────────────────────────────────────────────── */
const porNicho = {};
const porFaixa = {};
for (const l of saiu) {
  porNicho[l.Nicho] = (porNicho[l.Nicho] || 0) + 1;
  porFaixa[l.Faixa] = (porFaixa[l.Faixa] || 0) + 1;
}

console.log('\n' + '═'.repeat(70));
console.log(`  ${saiu.length} leads passaram no filtro (de ${registros.length})`);
console.log('═'.repeat(70));
const rotDesc = { fixo: 'telefone fixo (sem zap)', faixa: 'fora da faixa pedida',
  cidade: 'outra cidade', nicho: 'outro nicho', avaliacoes: 'poucas avaliações',
  nota: 'nota abaixo do mínimo', comSite: 'tem site' };
const houve = Object.entries(descartes).filter(([, v]) => v > 0);
if (houve.length) {
  console.log('\n  descartados:');
  for (const [k, v] of houve) console.log(`    ${String(v).padStart(4)}  ${rotDesc[k]}`);
}
console.log('\n  por faixa: ' + Object.entries(porFaixa).sort().map(([k, v]) => `${k}=${v}`).join('  '));
console.log('  por nicho: ' + Object.entries(porNicho).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  '));

if (saiu.length) {
  console.log('\n' + '─'.repeat(70));
  console.log('  EXEMPLO (o primeiro da fila):\n');
  const p = saiu[0];
  console.log(`  ${p.Nome} · ${p.Cidade} · ${p.Telefone} · faixa ${p.Faixa} · ${p.Nicho}`);
  console.log('  ' + '·'.repeat(66));
  console.log('  ' + p.Mensagem.replace(/(.{64}\s)/g, '$1\n  '));
}
console.log('\n' + '═'.repeat(70));
console.log(`  csv: ${saida}`);
if (arqTxt) console.log(`  txt: ${arqTxt}`);
console.log('');
