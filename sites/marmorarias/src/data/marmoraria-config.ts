/**
 * CONFIGURAÇÃO DA CALCULADORA — preços, perdas e acabamentos.
 *
 * Valores médios de mercado no Brasil, de referência aproximada (out/2026) e propositalmente
 * conservadores. SÃO ESTIMATIVAS: antes de apresentar a um cliente real, revise tudo com a
 * tabela de preços da marmoraria (preço por chapa, mão de obra, região).
 *
 * Tudo que a calculadora usa está neste arquivo. Nenhum preço fica espalhado pelos componentes.
 */

export type Categoria = 'granito' | 'marmore' | 'quartzo' | 'superficie';

export interface Faixa {
  min: number;
  max: number;
}

export interface Material {
  id: string;
  nome: string;
  categoria: Categoria;
  /** R$ por m² de material (chapa cortada, sem instalação). */
  preco: Faixa;
  /** Espessura padrão em cm, usada só na descrição. */
  espessura: number;
  usos: string[];
  /** Nota curta de 1 a 5 (5 = melhor). */
  notas: { mancha: number; risco: number; calor: number; manutencao: number };
  descricao: string;
  /** Receita da textura gerada em SVG (ver src/lib/stoneTextures.ts). */
  textura: TexturaReceita;
}

export interface TexturaReceita {
  tipo: 'granito' | 'veio' | 'travertino' | 'liso';
  base: string;
  /** Cores de salpico (granito) ou do veio (mármore). */
  cores: string[];
  /** 0–1: densidade de salpicos ou de veios. */
  densidade?: number;
  /** Semente do ruído, para cada pedra ter um desenho próprio. */
  seed: number;
  /** Frequência base do ruído (menor = veios mais largos). */
  freq?: number;
  /** Cor/intensidade do segundo veio (opcional). */
  veioFino?: string;
}

export const MATERIAIS: Material[] = [
  {
    id: 'sao-gabriel',
    nome: 'Granito São Gabriel',
    categoria: 'granito',
    preco: { min: 450, max: 680 },
    espessura: 2,
    usos: ['Cozinha', 'Área gourmet', 'Soleira'],
    notas: { mancha: 4, risco: 5, calor: 5, manutencao: 4 },
    descricao: 'Preto salpicado de cinza, o granito mais pedido do país. Esconde bem o uso diário.',
    textura: { tipo: 'granito', base: '#1d1f22', cores: ['#6b7077', '#2e3136', '#9aa0a6'], densidade: 0.55, seed: 11 },
  },
  {
    id: 'preto-absoluto',
    nome: 'Granito Preto Absoluto',
    categoria: 'granito',
    preco: { min: 700, max: 1000 },
    espessura: 2,
    usos: ['Cozinha', 'Banheiro', 'Ilha'],
    notas: { mancha: 4, risco: 5, calor: 5, manutencao: 4 },
    descricao: 'Preto uniforme e profundo, de brilho espelhado. Combina com projetos contemporâneos.',
    textura: { tipo: 'granito', base: '#0b0b0d', cores: ['#17181b', '#222428', '#101113'], densidade: 0.25, seed: 23 },
  },
  {
    id: 'branco-itaunas',
    nome: 'Granito Branco Itaúnas',
    categoria: 'granito',
    preco: { min: 600, max: 880 },
    espessura: 2,
    usos: ['Cozinha', 'Banheiro', 'Escada'],
    notas: { mancha: 3, risco: 5, calor: 5, manutencao: 4 },
    descricao: 'Fundo claro com salpicos cinza e bordô. Clareia o ambiente e disfarça migalhas.',
    textura: { tipo: 'granito', base: '#d8d5cf', cores: ['#8a8d92', '#6f4b4b', '#b9b5ad'], densidade: 0.5, seed: 31 },
  },
  {
    id: 'cinza-andorinha',
    nome: 'Granito Cinza Andorinha',
    categoria: 'granito',
    preco: { min: 380, max: 560 },
    espessura: 2,
    usos: ['Cozinha', 'Área externa', 'Piso'],
    notas: { mancha: 4, risco: 5, calor: 5, manutencao: 5 },
    descricao: 'Cinza claro e discreto, ótimo custo-benefício e alta resistência.',
    textura: { tipo: 'granito', base: '#9ea1a4', cores: ['#5b5f64', '#c9cbcd', '#3f4247'], densidade: 0.6, seed: 47 },
  },
  {
    id: 'verde-ubatuba',
    nome: 'Granito Verde Ubatuba',
    categoria: 'granito',
    preco: { min: 450, max: 650 },
    espessura: 2,
    usos: ['Cozinha', 'Área externa', 'Soleira'],
    notas: { mancha: 4, risco: 5, calor: 5, manutencao: 5 },
    descricao: 'Verde-escuro com reflexos dourados. Muito resistente, clássico em cozinhas e churrasqueiras.',
    textura: { tipo: 'granito', base: '#1f2b24', cores: ['#3d5a46', '#0f1713', '#7a8a6a'], densidade: 0.55, seed: 59 },
  },
  {
    id: 'carrara',
    nome: 'Mármore Carrara',
    categoria: 'marmore',
    preco: { min: 900, max: 1400 },
    espessura: 2,
    usos: ['Banheiro', 'Lavatório', 'Piso interno'],
    notas: { mancha: 2, risco: 2, calor: 3, manutencao: 2 },
    descricao: 'Branco com veios cinza suaves. Elegância atemporal, pede cuidado com ácidos.',
    textura: { tipo: 'veio', base: '#ecebe8', cores: ['#9a9da3'], densidade: 0.5, seed: 71, freq: 0.006, veioFino: '#c4c6ca' },
  },
  {
    id: 'travertino',
    nome: 'Mármore Travertino',
    categoria: 'marmore',
    preco: { min: 700, max: 1100 },
    espessura: 2,
    usos: ['Piso', 'Revestimento', 'Mesa'],
    notas: { mancha: 2, risco: 2, calor: 4, manutencao: 3 },
    descricao: 'Bege quente com veios horizontais e poros naturais. Traz acolhimento ao ambiente.',
    textura: { tipo: 'travertino', base: '#d9c7a6', cores: ['#bfa87f', '#ead9b8'], seed: 83 },
  },
  {
    id: 'calacatta',
    nome: 'Mármore Calacatta',
    categoria: 'marmore',
    preco: { min: 1800, max: 3200 },
    espessura: 2,
    usos: ['Ilha', 'Bancada nobre', 'Lavatório esculpido'],
    notas: { mancha: 2, risco: 2, calor: 3, manutencao: 2 },
    descricao: 'Fundo branco puro e veios largos, marcantes. A peça central de um projeto de alto padrão.',
    textura: { tipo: 'veio', base: '#f3f1ec', cores: ['#6d6f74', '#a38b64'], densidade: 0.8, seed: 97, freq: 0.0035, veioFino: '#b9b4a8' },
  },
  {
    id: 'nero-marquina',
    nome: 'Mármore Nero Marquina',
    categoria: 'marmore',
    preco: { min: 1400, max: 2400 },
    espessura: 2,
    usos: ['Banheiro', 'Lareira', 'Bancada'],
    notas: { mancha: 2, risco: 2, calor: 3, manutencao: 2 },
    descricao: 'Preto intenso cortado por veios brancos finos. Contraste dramático e sofisticado.',
    textura: { tipo: 'veio', base: '#0e0e10', cores: ['#e8e6e1'], densidade: 0.55, seed: 103, freq: 0.0045, veioFino: '#4a4b4f' },
  },
  {
    id: 'quartzo-branco',
    nome: 'Quartzo Branco Cristal',
    categoria: 'quartzo',
    preco: { min: 1100, max: 1800 },
    espessura: 2,
    usos: ['Cozinha', 'Banheiro', 'Ilha'],
    notas: { mancha: 5, risco: 4, calor: 3, manutencao: 5 },
    descricao: 'Superfície de quartzo com baixíssima porosidade. Não mancha e dispensa selagem.',
    textura: { tipo: 'granito', base: '#eceae6', cores: ['#d2cfc8', '#ffffff', '#bdb9b0'], densidade: 0.45, seed: 113 },
  },
  {
    id: 'quartzo-cinza',
    nome: 'Quartzo Cinza Londres',
    categoria: 'quartzo',
    preco: { min: 1100, max: 1800 },
    espessura: 2,
    usos: ['Cozinha', 'Banheiro', 'Mesa'],
    notas: { mancha: 5, risco: 4, calor: 3, manutencao: 5 },
    descricao: 'Cinza médio uniforme, visual contemporâneo e muito fácil de limpar.',
    textura: { tipo: 'granito', base: '#8b8d90', cores: ['#6f7175', '#a8aaad', '#5c5e62'], densidade: 0.4, seed: 127 },
  },
  {
    id: 'silestone',
    nome: 'Silestone Blanco Stellar',
    categoria: 'superficie',
    preco: { min: 1500, max: 2500 },
    espessura: 2,
    usos: ['Cozinha', 'Ilha', 'Banheiro'],
    notas: { mancha: 5, risco: 4, calor: 3, manutencao: 5 },
    descricao: 'Superfície composta com brilho cristalino. Garantia de fábrica e padrão uniforme entre chapas.',
    textura: { tipo: 'granito', base: '#f1f0ee', cores: ['#d9d7d3', '#ffffff', '#c8c5bf'], densidade: 0.35, seed: 131 },
  },
  {
    id: 'porcelanato-lamina',
    nome: 'Porcelanato Lâmina Calacatta',
    categoria: 'superficie',
    preco: { min: 800, max: 1400 },
    espessura: 1.2,
    usos: ['Revestimento', 'Bancada', 'Painel'],
    notas: { mancha: 5, risco: 5, calor: 5, manutencao: 5 },
    descricao: 'Lâmina fina de porcelanato com desenho de mármore. Leve, resistente e sem poros.',
    textura: { tipo: 'veio', base: '#f2f0eb', cores: ['#8a8c91', '#b8a37e'], densidade: 0.7, seed: 137, freq: 0.004, veioFino: '#c9c5bb' },
  },
];

export const CATEGORIAS: { id: Categoria; nome: string }[] = [
  { id: 'granito', nome: 'Granitos' },
  { id: 'marmore', nome: 'Mármores' },
  { id: 'quartzo', nome: 'Quartzo' },
  { id: 'superficie', nome: 'Superfícies' },
];

/** Perda de material: a chapa tem tamanho fixo e o corte gera sobra. Mínimo e máximo da faixa. */
export const PERDA = { min: 0.1, max: 0.15 };

/** Instalação em R$ por m² de peça (não inclui a perda). */
export const INSTALACAO_M2: Faixa = { min: 110, max: 190 };

/** Valor mínimo de instalação por serviço (visita, equipe e deslocamento). */
export const INSTALACAO_MINIMA: Faixa = { min: 280, max: 450 };

export type TipoBorda = 'reta' | 'meia-esquadria' | 'boleada' | 'chanfrada';

/** R$ por metro linear de borda trabalhada. A borda reta é padrão e não tem custo. */
export const BORDAS: Record<TipoBorda, { nome: string; porMetro: Faixa }> = {
  reta: { nome: 'Reta', porMetro: { min: 0, max: 0 } },
  'meia-esquadria': { nome: 'Meia-esquadria', porMetro: { min: 90, max: 150 } },
  boleada: { nome: 'Boleada', porMetro: { min: 45, max: 80 } },
  chanfrada: { nome: 'Chanfrada', porMetro: { min: 40, max: 70 } },
};

export type TipoCuba = 'nenhuma' | 'sobrepor' | 'embutida' | 'esculpida';

/** Cuba: R$ por peça. Sobrepor só tem o furo; embutida leva recorte e acabamento; esculpida é trabalho artesanal. */
export const CUBAS: Record<TipoCuba, { nome: string; valor: Faixa }> = {
  nenhuma: { nome: 'Sem cuba', valor: { min: 0, max: 0 } },
  sobrepor: { nome: 'De sobrepor', valor: { min: 60, max: 110 } },
  embutida: { nome: 'Embutida', valor: { min: 140, max: 230 } },
  esculpida: { nome: 'Esculpida', valor: { min: 1200, max: 2600 } },
};

/** Recorte de cooktop, R$ por unidade. */
export const RECORTE_COOKTOP: Faixa = { min: 160, max: 260 };

/** Saia (frontal) e frontão (traseiro): faixa em cm. Calculados como área extra do mesmo material. */
export const ALTURA_SAIA = { padrao: 4, min: 2, max: 10 };
export const ALTURA_RODABANCA = 10;

/** Escada: profundidade da pisada e altura do espelho, em cm. */
export const ESCADA = { pisada: 30, espelho: 17 };

export type TipoPeca =
  | 'bancada'
  | 'ilha'
  | 'bancada-banheiro'
  | 'lavatorio'
  | 'soleira'
  | 'escada'
  | 'piso'
  | 'nicho'
  | 'mesa';

export interface TipoPecaInfo {
  id: TipoPeca;
  nome: string;
  /** Medidas padrão em cm [comprimento, largura]. */
  padrao: [number, number];
  ajuda: string;
  /** Tipos com cuba/cooktop disponíveis. */
  cuba: boolean;
  cooktop: boolean;
  saia: boolean;
  rodabanca: boolean;
  borda: boolean;
  /** Cuba esculpida obrigatória. */
  cubaFixa?: TipoCuba;
}

export const TIPOS_PECA: TipoPecaInfo[] = [
  { id: 'bancada', nome: 'Bancada de cozinha', padrao: [250, 60], ajuda: 'Meça o comprimento ao longo da parede, de ponta a ponta, e a profundidade da frente até o fundo.', cuba: true, cooktop: true, saia: true, rodabanca: true, borda: true },
  { id: 'ilha', nome: 'Ilha', padrao: [200, 90], ajuda: 'Meça o lado maior (comprimento) e o lado menor (largura) do tampo da ilha.', cuba: true, cooktop: true, saia: true, rodabanca: false, borda: true },
  { id: 'bancada-banheiro', nome: 'Bancada de banheiro', padrao: [120, 55], ajuda: 'Meça o comprimento entre as paredes e a profundidade da frente até a parede do fundo.', cuba: true, cooktop: false, saia: true, rodabanca: true, borda: true },
  { id: 'lavatorio', nome: 'Lavatório esculpido', padrao: [80, 50], ajuda: 'Informe o tamanho do bloco. A cuba esculpida já está incluída no valor.', cuba: false, cooktop: false, saia: false, rodabanca: false, borda: true, cubaFixa: 'esculpida' },
  { id: 'soleira', nome: 'Soleira / peitoril', padrao: [90, 15], ajuda: 'Comprimento da abertura (porta ou janela) e a largura da parede onde a peça assenta.', cuba: false, cooktop: false, saia: false, rodabanca: false, borda: true },
  { id: 'escada', nome: 'Escada (degraus)', padrao: [100, 100], ajuda: 'Informe quantos degraus e a largura da escada. Calculamos pisada e espelho.', cuba: false, cooktop: false, saia: false, rodabanca: false, borda: true },
  { id: 'piso', nome: 'Piso / revestimento', padrao: [400, 300], ajuda: 'Comprimento e largura do ambiente. Desconte portas largas e áreas que não recebem a pedra.', cuba: false, cooktop: false, saia: false, rodabanca: false, borda: false },
  { id: 'nicho', nome: 'Nicho', padrao: [60, 30], ajuda: 'Meça a largura e a profundidade do vão do nicho.', cuba: false, cooktop: false, saia: false, rodabanca: false, borda: true },
  { id: 'mesa', nome: 'Mesa', padrao: [180, 90], ajuda: 'Meça o comprimento e a largura do tampo.', cuba: false, cooktop: false, saia: false, rodabanca: false, borda: true },
];

export const AVISO_VALORES =
  'Valor estimado. O orçamento final é confirmado após medição no local.';
