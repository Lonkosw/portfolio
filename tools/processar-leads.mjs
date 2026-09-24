/**
 * A CADEIA INTEIRA NUM COMANDO SÓ.
 *
 * Roda, na ordem: enriquecer → verificar → priorizar → filtrar, passando o
 * arquivo de uma etapa para a próxima. É o mesmo que digitar os quatro
 * comandos à mão, sem o risco de errar o nome do arquivo no meio.
 *
 *   node tools/processar-leads.mjs "C:\\Users\\luxst\\Downloads\\leads.csv"
 *
 * No fim ele diz onde está o .txt com as mensagens prontas.
 *
 * Pular etapas (quando o arquivo já passou por alguma):
 *   --pular-enriquecer     o CSV já tem telefone e site preenchidos
 *   --pular-verificar      já tem as colunas SiteStatus/SiteMotivo
 *
 * Filtros do disparo final (mesmos do filtrar-leads.mjs):
 *   --com-zap --faixa A,B --cidade X --min-avaliacoes N ...
 * Sem nenhum filtro, o padrão é `--com-zap` — porque mandar WhatsApp para
 * telefone fixo é contato queimado, e metade da base é fixo.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const entrada = args[0];
if (!entrada || !existsSync(entrada)) {
  console.error('\n  uso: node tools/processar-leads.mjs <csv-do-apex> [--com-zap] [--faixa A,B] ...\n');
  console.error('  o <csv-do-apex> é o arquivo que a extensão exportou, normalmente em Downloads.\n');
  process.exit(1);
}

const flag = (n) => args.includes(n);
// Repassa para o filtro final tudo que não é caminho de arquivo nem flag desta etapa.
const filtros = args.slice(1).filter((a) => !['--pular-enriquecer', '--pular-verificar'].includes(a));
const filtrosFinais = filtros.length ? filtros : ['--com-zap'];

// Trabalha numa cópia dentro do projeto: o original em Downloads fica intacto,
// e os arquivos intermediários não espalham pela pasta de downloads.
const nomeBase = basename(entrada).replace(/\.csv$/i, '');
const destino = resolve(process.cwd(), nomeBase + '.csv');
if (resolve(entrada) !== destino) {
  copyFileSync(entrada, destino);
  console.log(`\n  copiado para o projeto: ${basename(destino)}`);
}

function etapa(titulo, script, argumentos) {
  console.log('\n' + '━'.repeat(68));
  console.log(`  ${titulo}`);
  console.log('━'.repeat(68));
  const r = spawnSync(process.execPath, [join('tools', script), ...argumentos], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  if (r.status !== 0) {
    console.error(`\n  ✗ falhou em ${script} (código ${r.status}). Parando aqui.`);
    console.error('    O arquivo da etapa anterior continua válido — dá para retomar dele.\n');
    process.exit(r.status || 1);
  }
}

let atual = destino;

if (!flag('--pular-enriquecer')) {
  etapa('1/4  ABRINDO A FICHA DE CADA LEAD (telefone, site, endereço)', 'enriquecer-leads.mjs', [atual]);
  atual = atual.replace(/\.csv$/i, '_enriquecido.csv');
} else {
  console.log('\n  (pulando o enriquecimento)');
}

if (!flag('--pular-verificar')) {
  etapa('2/4  ABRINDO O SITE DE CADA LEAD PARA VER SE PRESTA', 'verificar-sites.mjs', [atual]);
  atual = atual.replace(/\.csv$/i, '_sites.csv');
} else {
  console.log('\n  (pulando a verificação de sites)');
}

etapa('3/4  MONTANDO A FILA DE DISPARO (faixas A-D)', 'priorizar-leads.mjs', [atual]);
atual = atual.replace(/\.csv$/i, '_fila.csv');

const txt = join(dirname(destino), nomeBase + '_MENSAGENS.txt');
const csvFinal = join(dirname(destino), nomeBase + '_DISPARO.csv');
etapa('4/4  FILTRANDO E ESCREVENDO AS MENSAGENS', 'filtrar-leads.mjs',
  [atual, '--saida', csvFinal, '--txt', txt, ...filtrosFinais]);

console.log('\n' + '═'.repeat(68));
console.log('  PRONTO');
console.log('═'.repeat(68));
console.log(`\n  mensagens prontas (abra no bloco de notas):`);
console.log(`     ${txt}`);
console.log(`\n  planilha com tudo (abra no Excel):`);
console.log(`     ${csvFinal}`);
console.log(`\n  na planilha, a coluna LinkDisparo abre o WhatsApp com a mensagem já escrita.\n`);
