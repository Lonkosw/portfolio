/**
 * Gera um mockup PERSONALIZADO a partir de uma linha do CSV de leads.
 *
 * ── SEM IA, E DE PROPÓSITO ──────────────────────────────────────────────
 * Não há modelo de linguagem nenhum aqui. O que este script faz é
 * SUBSTITUIÇÃO DE TEXTO em dois arquivos do modelo:
 *
 *   src/data/site.ts      nome, cidade, telefone, endereço, nota, horários
 *   src/styles/global.css a paleta, trocada por nicho
 *
 * Isso é possível porque o modelo já centraliza tudo nesses dois lugares —
 * nenhum componente tem o nome do salão escrito dentro. Custo por site:
 * o tempo de um `npm run build`, e mais nada.
 *
 * ── O QUE ELE NÃO FAZ, E POR QUÊ ────────────────────────────────────────
 * NÃO inventa texto. Os serviços, depoimentos e descrições continuam os do
 * modelo. Escrever texto novo por lead exigiria IA, custaria caro e traria
 * o risco de afirmar sobre o salão coisa que ninguém verificou.
 *
 * NÃO usa fotos do lead. O acervo de banco continua, e a faixa `demo: true`
 * continua ligada. O site é uma AMOSTRA com o nome dele — não uma imitação
 * do negócio dele. Isso é o que o mantém honesto: a faixa diz o que é.
 *
 * NÃO publica sozinho. Ele deixa a pasta pronta e imprime o comando de
 * deploy, para você conferir antes de pôr no ar.
 *
 * uso:
 *   node tools/gerar-site-lead.mjs <csv> --lead "Fio-Fio"      (por nome)
 *   node tools/gerar-site-lead.mjs <csv> --linha 1             (por posição)
 *   node tools/gerar-site-lead.mjs <csv> --lead X --modelo a   (modelo curto)
 *   node tools/gerar-site-lead.mjs <csv> --lead X --build      (já constrói)
 */
import { readFileSync, writeFileSync, existsSync, cpSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const flag = (n) => args.includes(n);

const entrada = args[0];
if (!entrada || !existsSync(entrada)) {
  console.error('\n  uso: node tools/gerar-site-lead.mjs <csv> --lead "Nome do salão" [--modelo a|b] [--build]\n');
  process.exit(1);
}

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
  return linhas.filter((l) => l.some((v) => v !== ''))
    .map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i] ?? ''])));
}

const leads = lerCsv(entrada);
const alvoNome = opt('--lead', '');
const alvoLinha = Number(opt('--linha', '0'));

let lead;
if (alvoNome) {
  const busca = alvoNome.toLowerCase();
  lead = leads.find((l) => (l.Nome || '').toLowerCase().includes(busca));
  if (!lead) {
    console.error(`\n  não achei lead com "${alvoNome}". Os 10 primeiros do arquivo:\n`);
    leads.slice(0, 10).forEach((l, i) => console.error(`    ${i + 1}. ${l.Nome}`));
    process.exit(1);
  }
} else if (alvoLinha) {
  lead = leads[alvoLinha - 1];
} else {
  console.error('\n  informe --lead "Nome" ou --linha N\n');
  process.exit(1);
}

/* ── PALETAS POR NICHO ──────────────────────────────────────────────────
   Quatro paletas fixas, todas ESCURAS (é a preferência do portfólio e o que
   faz cor de cabelo e esmalte saltarem). Os pares texto/fundo de cada uma
   foram escolhidos acima de 4.5:1 — o `tools/contraste.mjs` confere depois
   do build, e é ele que manda, não este comentário.

   Não há paleta gerada da foto do lead de propósito: foto ruim produz cor
   ilegível, e aí cada site precisaria de validação manual — que é
   exatamente o trabalho que este script existe para evitar.            */
const PALETAS = {
  salao: {
    rotulo: 'salão — verde/caramelo (a original)',
    cores: null, // null = não mexe, usa a paleta que já está no modelo
  },
  barbearia: {
    rotulo: 'barbearia — grafite/cobre',
    cores: {
      '--color-fundo': '#1a1917',
      '--color-superficie': '#262421',
      '--color-superficie-hi': '#32302c',
      '--color-texto': '#f0ece6',
      '--color-texto-dim': '#b5aea4',
      '--color-acento': '#c98a5c',
      '--color-acento-hi': '#dda478',
      '--color-btn': '#c98a5c',
      '--color-linha': '#3b3833',
    },
    realce: {
      '--color-fundo': '#2a2724',
      '--color-superficie': '#35312d',
      '--color-superficie-hi': '#403b36',
      '--color-texto': '#f4f0ea',
      '--color-texto-dim': '#c6bdb2',
      '--color-acento': '#dda478',
      '--color-acento-hi': '#ecbf97',
      '--color-linha': '#4a443d',
      '--color-btn': '#dda478',
      '--color-btn-texto': '#1a1917',
    },
  },
  unhas: {
    rotulo: 'unhas — ameixa/rosé',
    cores: {
      '--color-fundo': '#201a1e',
      '--color-superficie': '#2c2429',
      '--color-superficie-hi': '#392f35',
      '--color-texto': '#f4ecef',
      '--color-texto-dim': '#c0aeb6',
      '--color-acento': '#e0a5ae',
      '--color-acento-hi': '#efc0c7',
      '--color-btn': '#e0a5ae',
      '--color-linha': '#3f343a',
    },
    realce: {
      '--color-fundo': '#332a2f',
      '--color-superficie': '#3e343a',
      '--color-superficie-hi': '#4a3e45',
      '--color-texto': '#f8f0f3',
      '--color-texto-dim': '#d0bec6',
      '--color-acento': '#efc0c7',
      '--color-acento-hi': '#f8d8dd',
      '--color-linha': '#554750',
      '--color-btn': '#efc0c7',
      '--color-btn-texto': '#201a1e',
    },
  },
  estetica: {
    rotulo: 'estética — petróleo/verde-água',
    cores: {
      '--color-fundo': '#161f21',
      '--color-superficie': '#1f2b2d',
      '--color-superficie-hi': '#2a383b',
      '--color-texto': '#eef3f2',
      '--color-texto-dim': '#a8bab8',
      '--color-acento': '#7fc9bd',
      '--color-acento-hi': '#a2ded4',
      '--color-btn': '#7fc9bd',
      '--color-linha': '#2e3d3f',
    },
    realce: {
      '--color-fundo': '#233133',
      '--color-superficie': '#2d3d3f',
      '--color-superficie-hi': '#384a4c',
      '--color-texto': '#f1f6f5',
      '--color-texto-dim': '#b6c8c6',
      '--color-acento': '#a2ded4',
      '--color-acento-hi': '#c2ebe4',
      '--color-linha': '#425457',
      '--color-btn': '#a2ded4',
      '--color-btn-texto': '#161f21',
    },
  },
};

function nichoDoLead(l) {
  const n = (l.Nicho || '').toLowerCase();
  if (n.includes('barbearia')) return 'barbearia';
  if (n.includes('unha')) return 'unhas';
  if (n.includes('estética') || n.includes('estetica')) return 'estetica';
  return 'salao';
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const soDigitos = (v) => String(v || '').replace(/\D/g, '');

/** "(44) 99904-3209" → "(44) 99904-3209"; garante formato de exibição. */
function formatarExibicao(tel) {
  const d = soDigitos(tel).replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || '';
}

/** Separa "Av. Brasil, 123 - Centro, Curitiba - PR, 80000-000" nas partes
    que o site.ts espera. O Maps é consistente nesse formato. */
function partirEndereco(end) {
  const t = String(end || '').trim();
  const cep = (t.match(/\d{5}-?\d{3}/) || [''])[0];
  const semCep = t.replace(/,?\s*\d{5}-?\d{3}\s*,?\s*(Brasil)?\s*$/i, '').trim();
  const partes = semCep.split(' - ');
  const rua = (partes[0] || '').split(',').slice(0, 2).join(',').trim();
  let bairro = '';
  if (partes[1]) bairro = partes[1].split(',')[0].trim();
  return { rua: rua || t, bairro: bairro || 'Centro', cep: cep || '' };
}

const escapar = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/* ── Monta o site.ts ────────────────────────────────────────────────────── */
const modelo = opt('--modelo', 'b').toLowerCase();
const pastaModelo = resolve(process.cwd(), 'mockups', `modelo-${modelo}`);
if (!existsSync(pastaModelo)) {
  console.error(`\n  modelo não encontrado: ${pastaModelo}\n`);
  process.exit(1);
}

const nicho = nichoDoLead(lead);
const paleta = PALETAS[nicho];
const nome = (lead.NomeLimpo || lead.Nome || '').trim();
const slug = nome.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

const destino = resolve(process.cwd(), 'mockups', 'gerados', slug);
if (existsSync(destino)) rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

// Copia o modelo inteiro menos o que não deve viajar junto.
cpSync(pastaModelo, destino, {
  recursive: true,
  filter: (src) => !/[\\/](node_modules|dist|dist-antes|\.astro|\.netlify|\.imagens-originais)([\\/]|$)/.test(src),
});

const end = partirEndereco(lead.Endereco);
const telExib = formatarExibicao(lead.Telefone);
// ⚠️ O WhatsApp do SITE é o do Théo, não o do lead: o mockup existe para o
// lead conversar com o Théo. Pôr o número do próprio lead aqui faria os
// botões do site dele mandarem mensagem para ele mesmo.
const WHATSAPP_THEO = process.env.WHATSAPP_THEO || '5544000000000';

let siteTs = readFileSync(join(destino, 'src', 'data', 'site.ts'), 'utf8');

const trocas = [
  [/(\n  nome: )'[^']*'/, `$1'${escapar(nome)}'`],
  [/(\n  cidade: )'[^']*'/, `$1'${escapar(lead.Cidade || '')}'`],
  [/(\n  estado: )'[^']*'/, `$1'${escapar(lead.Estado || 'PR')}'`],
  [/(\n  whatsapp: )'[^']*'/, `$1'${WHATSAPP_THEO}'`],
  [/(\n  whatsappExibicao: )'[^']*'/, `$1'${escapar(formatarExibicao(WHATSAPP_THEO))}'`],
  [/(\n  endereco: )'[^']*'/, `$1'${escapar(end.rua)}'`],
  [/(\n  bairro: )'[^']*'/, `$1'${escapar(end.bairro)}'`],
  [/(\n  cep: )'[^']*'/, `$1'${escapar(end.cep)}'`],
];

// A nota e as avaliações são as REAIS do lead, tiradas do Google — é o ativo
// mais forte que ele tem e o que faz o mockup parecer dele. `lido` passa a
// 'real' para o próprio arquivo registrar que não é mais número de exemplo.
const aval = soDigitos(lead.Avaliacoes);
const nota = String(lead.Nota || '').replace('.', ',');
if (aval && nota) {
  trocas.push([/(\n    nota: )'[^']*'/, `$1'${nota}'`]);
  trocas.push([/(\n    avaliacoes: )\d+/, `$1${aval}`]);
  trocas.push([/(\n    lido: )'[^']*'/, `$1'real'`]);
}
if ((lead.LinkMaps || '').startsWith('http')) {
  trocas.push([/(\n  maps: )'[^']*'/, `$1'${escapar(lead.LinkMaps)}'`]);
  trocas.push([/(\n  avaliacoesGoogle: )'[^']*'/, `$1'${escapar(lead.LinkMaps)}'`]);
}

let aplicadas = 0;
for (const [re, sub] of trocas) {
  if (re.test(siteTs)) { siteTs = siteTs.replace(re, sub); aplicadas++; }
  else console.warn(`  ⚠ não casou: ${re}`);
}
writeFileSync(join(destino, 'src', 'data', 'site.ts'), siteTs, 'utf8');

/* ── Paleta ─────────────────────────────────────────────────────────────── */
let trocasCor = 0;
if (paleta.cores) {
  const cssPath = join(destino, 'src', 'styles', 'global.css');
  let css = readFileSync(cssPath, 'utf8');
  // A PRIMEIRA definição de cada variável é a do bloco `@theme`: a paleta base.
  for (const [varName, valor] of Object.entries(paleta.cores)) {
    const re = new RegExp(`(\\n  ${varName.replace(/[-]/g, '\\-')}: )#[0-9a-fA-F]{3,8}`);
    if (re.test(css)) { css = css.replace(re, `$1${valor}`); trocasCor++; }
  }

  // ⚠️ E O BLOCO `[data-tema='realce']`, que é uma SEGUNDA paleta completa.
  // Ele pinta carrossel, depoimentos e rodapé. Trocar só a base deixava essas
  // três seções VERDES dentro de uma barbearia grafite — o site saía com duas
  // identidades brigando. Descoberto testando a Dakota: o `@theme` sozinho
  // não cobre o site inteiro.
  if (paleta.realce) {
    const ini = css.indexOf("[data-tema='realce'] {");
    if (ini >= 0) {
      const fim = css.indexOf('}', ini);
      let bloco = css.slice(ini, fim);
      for (const [varName, valor] of Object.entries(paleta.realce)) {
        const re = new RegExp(`(\\n  ${varName.replace(/[-]/g, '\\-')}: )#[0-9a-fA-F]{3,8}`);
        if (re.test(bloco)) { bloco = bloco.replace(re, `$1${valor}`); trocasCor++; }
      }
      css = css.slice(0, ini) + bloco + css.slice(fim);
    }
  }

  // Os comentários da paleta original descrevem cores que não estão mais lá
  // ("marrom-oliva", "o couro do sofá", "caramelo"). Mantê-los seria pior que
  // não ter comentário nenhum: mandam quem for editar procurar um verde que
  // sumiu. Só são apagados quando a cor daquela linha realmente mudou.
  if (trocasCor) {
    css = css.replace(
      /(--color-(?:fundo|superficie|superficie-hi|texto|texto-dim|acento|acento-hi|linha|btn|btn-texto): #[0-9a-fA-F]{3,8};)[ \t]*\/\*[^*\n]*\*\//g,
      '$1',
    );
  }
  writeFileSync(cssPath, css, 'utf8');
}

/* ── A MARCA NO HEADER E NO RODAPÉ ──────────────────────────────────────
   "Studio" + "Aurora" estão ESCRITOS À MÃO nesses dois componentes, e não
   vêm do `site.ts`. O motivo é visual: a marca é partida em duas palavras,
   a primeira em texto normal e a segunda em itálico com a cor de acento —
   e isso não cabe numa string só.

   Sem esta troca o site sai com o nome do lead em todo lugar E "Studio
   Aurora" no topo, que é o erro mais visível que um mockup pode ter.
   Só apareceu porque o `contraste.mjs` imprimiu "Aurora" na lista de textos
   medidos; grep no `site.ts` nunca acharia.

   A divisão: primeira palavra à esquerda, o resto em itálico. Se o nome tem
   uma palavra só, ela vai inteira no itálico e a primeira parte some — é o
   que preserva o desenho.                                                 */
{
  const palavras = nome.split(/\s+/).filter(Boolean);
  const umaPalavra = palavras.length === 1;
  const ini = umaPalavra ? '' : palavras[0];
  const resto = umaPalavra ? palavras[0] : palavras.slice(1).join(' ');
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  for (const arq of ['Header.astro', 'Footer.astro']) {
    const p = join(destino, 'src', 'components', arq);
    if (!existsSync(p)) continue;
    let txt = readFileSync(p, 'utf8');
    txt = txt.replace(/(text-\[\d+px\] text-texto">)Studio(<\/span>)/g, `$1${esc(ini)}$2`);
    txt = txt.replace(/(\n\s*)Aurora(\n)/g, `$1${esc(resto)}$2`);
    txt = txt.replace(/(italic text-acento">)Aurora(<\/span>)/g, `$1${esc(resto)}$2`);
    writeFileSync(p, txt, 'utf8');
  }
}

// A cor da barra do navegador está no Layout, fora do alcance do @theme.
if (paleta.cores && paleta.cores['--color-fundo']) {
  const layoutPath = join(destino, 'src', 'layouts', 'Layout.astro');
  let layout = readFileSync(layoutPath, 'utf8');
  layout = layout.replace(/(content=)"#[0-9a-fA-F]{6}"(\s*\/>\s*\n\s*\{\/\* )/, `$1"${paleta.cores['--color-fundo']}"$2`);
  layout = layout.replace(/(name="theme-color" content=)"#[0-9a-fA-F]{6}"/, `$1"${paleta.cores['--color-fundo']}"`);
  writeFileSync(layoutPath, layout, 'utf8');
}

/* ── Relatório ──────────────────────────────────────────────────────────── */
console.log('\n' + '═'.repeat(68));
console.log(`  SITE GERADO PARA: ${nome}`);
console.log('═'.repeat(68));
console.log(`  nicho      ${nicho}  (${paleta.rotulo})`);
console.log(`  cidade     ${lead.Cidade || '—'} / ${lead.Estado || '—'}`);
console.log(`  endereço   ${end.rua}${end.bairro ? ' · ' + end.bairro : ''}${end.cep ? ' · ' + end.cep : ''}`);
console.log(`  Google     ${nota || '—'} com ${aval || '—'} avaliações  ${aval ? '(REAIS, do perfil dele)' : ''}`);
console.log(`  zap do site ${formatarExibicao(WHATSAPP_THEO)}  ${WHATSAPP_THEO === '5544000000000' ? '⚠️ PLACEHOLDER' : '(seu)'}`);
console.log(`  campos     ${aplicadas} trocados no site.ts · ${trocasCor} cores no CSS`);
console.log(`  pasta      mockups/gerados/${slug}`);

if (WHATSAPP_THEO === '5544000000000') {
  console.log('\n  ⚠️  O WHATSAPP DO SITE AINDA É PLACEHOLDER.');
  console.log('     Se o lead clicar em "agendar", não cai em lugar nenhum.');
  console.log('     Defina antes de publicar:  set WHATSAPP_THEO=5544SEUNUMERO');
}

if (flag('--build')) {
  console.log('\n  construindo...\n');
  const r = spawnSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: destino, stdio: 'inherit', shell: true });
  if (r.status === 0) spawnSync('npm', ['run', 'build'], { cwd: destino, stdio: 'inherit', shell: true });
}

console.log('\n  para ver:');
console.log(`     cd mockups/gerados/${slug} && npm install && npm run dev`);
console.log('\n  para publicar:');
console.log(`     cd mockups/gerados/${slug} && npm run build && npx netlify deploy --prod --dir dist`);
console.log('');
