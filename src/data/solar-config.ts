/**
 * Constantes do simulador de economia solar.
 *
 * ATENÇÃO: todos os valores abaixo são médias aproximadas e conservadoras,
 * calibradas com referências públicas de 2024/2025. Revise antes de publicar
 * para um cliente real (tarifas e custos mudam todo ano).
 */

export type TipoImovel = 'residencial' | 'comercial' | 'rural';

export interface Uf {
  uf: string;
  nome: string;
  /** HSP: horas de sol pleno por dia (kWh/m²/dia, plano inclinado). Fonte: Atlas Brasileiro de Energia Solar (INPE) / CRESESB, arredondado para baixo. */
  hsp: number;
  /** Tarifa residencial média com impostos (R$/kWh). Fonte: ANEEL, tarifas homologadas ~2025, arredondado. */
  tarifa: number;
}

export const UFS: Uf[] = [
  { uf: 'AC', nome: 'Acre', hsp: 4.3, tarifa: 0.95 },
  { uf: 'AL', nome: 'Alagoas', hsp: 5.5, tarifa: 0.98 },
  { uf: 'AP', nome: 'Amapá', hsp: 4.6, tarifa: 0.8 },
  { uf: 'AM', nome: 'Amazonas', hsp: 4.4, tarifa: 1.0 },
  { uf: 'BA', nome: 'Bahia', hsp: 5.6, tarifa: 0.92 },
  { uf: 'CE', nome: 'Ceará', hsp: 5.7, tarifa: 0.88 },
  { uf: 'DF', nome: 'Distrito Federal', hsp: 5.4, tarifa: 0.82 },
  { uf: 'ES', nome: 'Espírito Santo', hsp: 5.0, tarifa: 0.9 },
  { uf: 'GO', nome: 'Goiás', hsp: 5.4, tarifa: 0.95 },
  { uf: 'MA', nome: 'Maranhão', hsp: 5.2, tarifa: 0.95 },
  { uf: 'MT', nome: 'Mato Grosso', hsp: 5.3, tarifa: 1.0 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', hsp: 5.2, tarifa: 0.98 },
  { uf: 'MG', nome: 'Minas Gerais', hsp: 5.4, tarifa: 0.98 },
  { uf: 'PA', nome: 'Pará', hsp: 4.8, tarifa: 1.05 },
  { uf: 'PB', nome: 'Paraíba', hsp: 5.6, tarifa: 0.88 },
  { uf: 'PR', nome: 'Paraná', hsp: 4.6, tarifa: 0.85 },
  { uf: 'PE', nome: 'Pernambuco', hsp: 5.6, tarifa: 0.9 },
  { uf: 'PI', nome: 'Piauí', hsp: 5.7, tarifa: 0.95 },
  { uf: 'RJ', nome: 'Rio de Janeiro', hsp: 5.0, tarifa: 1.05 },
  { uf: 'RN', nome: 'Rio Grande do Norte', hsp: 5.7, tarifa: 0.9 },
  { uf: 'RS', nome: 'Rio Grande do Sul', hsp: 4.5, tarifa: 0.95 },
  { uf: 'RO', nome: 'Rondônia', hsp: 4.6, tarifa: 0.95 },
  { uf: 'RR', nome: 'Roraima', hsp: 5.0, tarifa: 0.85 },
  { uf: 'SC', nome: 'Santa Catarina', hsp: 4.4, tarifa: 0.85 },
  { uf: 'SP', nome: 'São Paulo', hsp: 5.0, tarifa: 0.95 },
  { uf: 'SE', nome: 'Sergipe', hsp: 5.5, tarifa: 0.9 },
  { uf: 'TO', nome: 'Tocantins', hsp: 5.4, tarifa: 1.0 },
];

export interface ParametrosTipo {
  rotulo: string;
  /** Multiplicador sobre a tarifa residencial da UF (rural tem desconto na tarifa; comercial ~ igual). */
  fatorTarifa: number;
  /** Custo de disponibilidade (kWh/mês) que o cliente paga sempre: 30 mono, 50 bi, 100 trifásico. Valor típico por perfil. */
  disponibilidadeKwh: number;
  /**
   * Teto da economia como % da conta (Lei 14.300: parte do Fio B continua sendo paga sobre a energia compensada).
   * Valores conservadores dentro da faixa de 80–90%.
   */
  economiaMaxPct: number;
  /** Faixa de custo instalado em R$/kWp (mercado 2025, sistema completo com projeto e homologação). */
  custoKwp: [number, number];
}

export const TIPOS: Record<TipoImovel, ParametrosTipo> = {
  residencial: { rotulo: 'Residencial', fatorTarifa: 1.0, disponibilidadeKwh: 50, economiaMaxPct: 0.85, custoKwp: [3800, 5000] },
  comercial: { rotulo: 'Comercial', fatorTarifa: 1.0, disponibilidadeKwh: 100, economiaMaxPct: 0.88, custoKwp: [3300, 4400] },
  rural: { rotulo: 'Rural', fatorTarifa: 0.85, disponibilidadeKwh: 100, economiaMaxPct: 0.85, custoKwp: [3400, 4500] },
};

export const PARAMETROS = {
  /** Potência de cada painel (Wp). Padrão de mercado atual: 550 Wp. */
  painelWp: 550,
  /** Rendimento global do sistema (perdas de temperatura, cabos, inversor, sujeira). 0,80 é conservador. */
  rendimento: 0.8,
  diasPorMes: 30,
  /** Área aproximada ocupada por painel de 550 Wp, incluindo folga de instalação (m²). */
  areaPainelM2: 2.6,
  /** Reajuste tarifário médio anual. Histórico recente supera isso; 5% foi escolhido por prudência. */
  reajusteAnual: 0.05,
  /** Perda anual de geração dos painéis (garantia de desempenho típica: ~0,5%/ano). */
  degradacaoAnual: 0.005,
  anos: 25,
  /** Troca do inversor: ano e custo como % do investimento (inversores duram ~10–15 anos). */
  trocaInversor: { ano: 12, pctInvestimento: 0.08 },
  /** Fator médio de emissão do SIN (kg CO₂/kWh). Fonte: MCTI, média anual recente (~0,04). */
  co2KgPorKwh: 0.0385,
  /** Absorção média de uma árvore adulta (kg CO₂/ano). Referência usual: ~22 kg. */
  kgCo2PorArvore: 22,
  contaMin: 100,
  contaMax: 100000,
  /** Faixa do slider (o campo numérico aceita valores até contaMax). */
  sliderMin: 100,
  sliderMax: 20000,
};

export const AVISO_SIMULACAO = 'Simulação estimada. Valores finais dependem de visita técnica.';
