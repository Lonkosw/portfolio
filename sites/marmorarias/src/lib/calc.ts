/**
 * Lógica da calculadora de orçamento por m². Funções puras, sem DOM.
 *
 * FÓRMULAS (todas as medidas de entrada em cm; áreas em m²; valores em R$)
 *
 *  1. Área da peça
 *       padrão ........ comprimento × largura ÷ 10.000
 *       escada ........ degraus × largura_da_escada × (pisada + espelho se "com espelho") ÷ 10.000
 *                       (pisada 30 cm e espelho 17 cm, ver ESCADA no config)
 *  2. Áreas extras (calculadas à parte, mesmo material)
 *       saia .......... comprimento × altura_da_saia ÷ 10.000
 *       frontão ....... comprimento × altura_do_frontão ÷ 10.000
 *       rodabanca ..... comprimento × 10 cm ÷ 10.000 (só se não houver frontão)
 *  3. Área total da peça = área + áreas extras
 *  4. Perda de material (a chapa tem tamanho fixo e o corte gera sobra)
 *       área_com_perda_min = área_total × (1 + perda_min)       perda_min = 10 %
 *       área_com_perda_max = área_total × (1 + perda_max)       perda_max = 15 %
 *  5. Material
 *       material_min = área_com_perda_min × preço_min_do_material
 *       material_max = área_com_perda_max × preço_max_do_material
 *  6. Acabamentos
 *       borda ......... metros_lineares_de_borda × preço_por_metro (min e max)
 *       cooktop ....... valor por unidade (min e max)
 *       cuba .......... valor por peça (min e max)
 *  7. Instalação (no serviço inteiro, não por peça)
 *       instalação = Σ área_total × valor_por_m²   (nunca abaixo do mínimo de visita)
 *  8. Total = material + acabamentos + instalação, sempre como faixa (mínimo–máximo)
 */
import {
  BORDAS,
  CUBAS,
  ESCADA,
  INSTALACAO_M2,
  INSTALACAO_MINIMA,
  MATERIAIS,
  PERDA,
  RECORTE_COOKTOP,
  ALTURA_RODABANCA,
  TIPOS_PECA,
  type Faixa,
  type Material,
  type TipoBorda,
  type TipoCuba,
  type TipoPeca,
} from '../data/marmoraria-config.ts';

export interface Peca {
  tipo: TipoPeca;
  /** Comprimento em cm. Na escada, é a largura da escada. */
  comprimento: number;
  /** Largura (profundidade) em cm. Ignorada na escada. */
  largura: number;
  /** Só na escada: número de degraus. */
  degraus: number;
  /** Só na escada: incluir o espelho (parte vertical) do degrau. */
  espelho: boolean;
  material: string;
  borda: TipoBorda;
  /** Altura da saia em cm (0 = sem saia). */
  saia: number;
  /** Altura do frontão em cm (0 = sem frontão). */
  frontao: number;
  rodabanca: boolean;
  cuba: TipoCuba;
  cooktop: boolean;
}

export interface ResultadoPeca {
  /** Área da peça sem extras. */
  area: number;
  areaExtras: number;
  areaTotal: number;
  areaComPerda: Faixa;
  material: Faixa;
  acabamentos: Faixa;
  /** Material + acabamentos (instalação é somada no total do serviço). */
  subtotal: Faixa;
  bordaMetros: number;
}

export interface ResultadoTotal {
  pecas: ResultadoPeca[];
  areaTotal: number;
  areaComPerda: Faixa;
  material: Faixa;
  acabamentos: Faixa;
  instalacao: Faixa;
  total: Faixa;
}

const f = (min: number, max: number): Faixa => ({ min, max });
const soma = (a: Faixa, b: Faixa): Faixa => f(a.min + b.min, a.max + b.max);

export function getMaterial(id: string): Material {
  return MATERIAIS.find((m) => m.id === id) ?? MATERIAIS[0];
}

export function tipoInfo(tipo: TipoPeca) {
  return TIPOS_PECA.find((t) => t.id === tipo) ?? TIPOS_PECA[0];
}

/** Metros lineares de borda trabalhada, conforme o tipo de peça. */
export function metrosBorda(p: Peca): number {
  const c = p.comprimento / 100;
  const l = p.largura / 100;
  switch (p.tipo) {
    case 'ilha':
    case 'mesa':
      return 2 * (c + l);
    case 'lavatorio':
      return c + l;
    case 'escada':
      return p.degraus * c;
    case 'piso':
      return 0;
    default:
      return c;
  }
}

export function pecaPadrao(tipo: TipoPeca, material = MATERIAIS[0].id): Peca {
  const info = tipoInfo(tipo);
  return {
    tipo,
    comprimento: info.padrao[0],
    largura: info.padrao[1],
    degraus: tipo === 'escada' ? 10 : 0,
    espelho: true,
    material,
    borda: 'reta',
    saia: 0,
    frontao: 0,
    rodabanca: false,
    cuba: info.cubaFixa ?? 'nenhuma',
    cooktop: false,
  };
}

export function pecaValida(p: Peca): boolean {
  if (!(p.comprimento > 0)) return false;
  if (p.tipo === 'escada') return p.degraus > 0;
  return p.largura > 0;
}

export function calcularPeca(p: Peca): ResultadoPeca {
  const mat = getMaterial(p.material);
  const info = tipoInfo(p.tipo);
  const c = p.comprimento;

  // 1. área
  let area: number;
  if (p.tipo === 'escada') {
    const profundidade = ESCADA.pisada + (p.espelho ? ESCADA.espelho : 0);
    area = (p.degraus * c * profundidade) / 10000;
  } else {
    area = (c * p.largura) / 10000;
  }

  // 2. extras
  let areaExtras = 0;
  if (info.saia && p.saia > 0) areaExtras += (c * p.saia) / 10000;
  if (info.saia && p.frontao > 0) areaExtras += (c * p.frontao) / 10000;
  else if (info.rodabanca && p.rodabanca) areaExtras += (c * ALTURA_RODABANCA) / 10000;

  const areaTotal = area + areaExtras;

  // 4. perda
  const areaComPerda = f(areaTotal * (1 + PERDA.min), areaTotal * (1 + PERDA.max));

  // 5. material
  const material = f(areaComPerda.min * mat.preco.min, areaComPerda.max * mat.preco.max);

  // 6. acabamentos
  const bordaMetros = info.borda ? metrosBorda(p) : 0;
  const borda = BORDAS[p.borda].porMetro;
  let acabamentos = f(bordaMetros * borda.min, bordaMetros * borda.max);
  if (info.cooktop && p.cooktop) acabamentos = soma(acabamentos, RECORTE_COOKTOP);
  const tipoCuba = info.cubaFixa ?? (info.cuba ? p.cuba : 'nenhuma');
  acabamentos = soma(acabamentos, CUBAS[tipoCuba].valor);

  return {
    area,
    areaExtras,
    areaTotal,
    areaComPerda,
    material,
    acabamentos,
    subtotal: soma(material, acabamentos),
    bordaMetros,
  };
}

export function arredondar(n: number, passo = 10): number {
  return Math.round(n / passo) * passo;
}

export function calcularTotal(pecas: Peca[], comInstalacao: boolean): ResultadoTotal {
  const resultados = pecas.map(calcularPeca);
  const zero = f(0, 0);
  const areaTotal = resultados.reduce((s, r) => s + r.areaTotal, 0);
  const areaComPerda = resultados.reduce((s, r) => soma(s, r.areaComPerda), zero);
  const material = resultados.reduce((s, r) => soma(s, r.material), zero);
  const acabamentos = resultados.reduce((s, r) => soma(s, r.acabamentos), zero);

  let instalacao = zero;
  if (comInstalacao && resultados.length > 0) {
    instalacao = f(
      Math.max(areaTotal * INSTALACAO_M2.min, INSTALACAO_MINIMA.min),
      Math.max(areaTotal * INSTALACAO_M2.max, INSTALACAO_MINIMA.max),
    );
  }

  const total = soma(soma(material, acabamentos), instalacao);
  return { pecas: resultados, areaTotal, areaComPerda, material, acabamentos, instalacao, total };
}

/** Recalcula o mesmo serviço trocando o material de todas as peças (comparador). */
export function totalComMaterial(pecas: Peca[], materialId: string, comInstalacao: boolean) {
  return calcularTotal(
    pecas.map((p) => ({ ...p, material: materialId })),
    comInstalacao,
  );
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const num2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatBRL = (n: number) => brl.format(arredondar(n));
export const formatM2 = (n: number) => `${num2.format(n)} m²`;
export const formatFaixa = (fx: Faixa) => `${formatBRL(fx.min)} a ${formatBRL(fx.max)}`;
