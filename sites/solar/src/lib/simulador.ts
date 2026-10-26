import { PARAMETROS as P, TIPOS, UFS, type TipoImovel } from '../data/solar-config';

export interface EntradaSimulacao {
  /** Valor médio da conta de luz (R$/mês). */
  conta: number;
  uf: string;
  tipo: TipoImovel;
  /** Tarifa informada pelo cliente (R$/kWh). Se ausente, usa a média da UF. */
  tarifa?: number;
}

export interface Resultado {
  tarifa: number;
  consumoKwh: number;
  geracaoKwhMes: number;
  kwp: number;
  paineis: number;
  areaM2: number;
  investimentoMin: number;
  investimentoMax: number;
  economiaMensal: number;
  economiaAnual: number;
  paybackAnos: number | null;
  paybackMinAnos: number | null;
  paybackMaxAnos: number | null;
  economiaLiquida25: number;
  co2KgAno: number;
  arvores: number;
  /** Gasto acumulado por ano (0..25) sem e com solar, usando o investimento médio. */
  serieSem: number[];
  serieCom: number[];
}

export function ufInfo(uf: string) {
  return UFS.find((u) => u.uf === uf) ?? UFS.find((u) => u.uf === 'SP')!;
}

/**
 * Fluxo de caixa de 0 a 25 anos para um investimento dado.
 * Ano n: conta sem solar = contaAnual × (1+reajuste)^(n-1);
 *        economia        = economiaAnual × (1+reajuste)^(n-1) × (1-degradação)^(n-1)
 *        (a economia nunca passa da conta daquele ano).
 */
function fluxo(contaAnual: number, economiaAnual: number, investimento: number) {
  const sem = [0];
  const com = [investimento];
  let liquida = -investimento;
  for (let n = 1; n <= P.anos; n++) {
    const conta = contaAnual * Math.pow(1 + P.reajusteAnual, n - 1);
    const eco = Math.min(conta, economiaAnual * Math.pow(1 + P.reajusteAnual, n - 1) * Math.pow(1 - P.degradacaoAnual, n - 1));
    const inversor = n === P.trocaInversor.ano ? investimento * P.trocaInversor.pctInvestimento : 0;
    sem.push(sem[n - 1] + conta);
    com.push(com[n - 1] + (conta - eco) + inversor);
    liquida += eco - inversor;
  }
  // Payback: primeiro ponto em que o gasto acumulado com solar fica abaixo do gasto sem solar (interpolado).
  let payback: number | null = null;
  for (let n = 1; n <= P.anos; n++) {
    if (com[n] <= sem[n]) {
      const antes = com[n - 1] - sem[n - 1];
      const depois = com[n] - sem[n];
      payback = n - 1 + antes / (antes - depois);
      break;
    }
  }
  return { sem, com, liquida, payback };
}

export function simular(entrada: EntradaSimulacao): Resultado {
  const tipo = TIPOS[entrada.tipo];
  const { hsp, tarifa: tarifaUf } = ufInfo(entrada.uf);
  const conta = Math.min(Math.max(entrada.conta, P.contaMin), P.contaMax);

  // 1. Consumo estimado (kWh/mês) = conta ÷ tarifa
  const tarifa = entrada.tarifa && entrada.tarifa > 0 ? entrada.tarifa : tarifaUf * tipo.fatorTarifa;
  const consumoKwh = conta / tarifa;

  // 2. Potência necessária (kWp) = energia a compensar ÷ (HSP × 30 × rendimento).
  //    A energia a compensar descarta o custo de disponibilidade, que sempre é cobrado.
  const kwhPorKwpMes = hsp * P.diasPorMes * P.rendimento;
  const aCompensar = Math.max(consumoKwh - tipo.disponibilidadeKwh, 0);
  const kwpNecessario = aCompensar / kwhPorKwpMes;

  // 3. Nº de painéis = kWp ÷ potência do painel, arredondado para cima (mínimo 1)
  const paineis = Math.max(1, Math.ceil((kwpNecessario * 1000) / P.painelWp));
  const kwp = (paineis * P.painelWp) / 1000;
  const geracaoKwhMes = Math.min(kwp * kwhPorKwpMes, aCompensar);

  // 4. Área de telhado
  const areaM2 = paineis * P.areaPainelM2;

  // 5. Investimento (faixa) = kWp instalado × custo/kWp
  const investimentoMin = kwp * tipo.custoKwp[0];
  const investimentoMax = kwp * tipo.custoKwp[1];
  const investimentoMedio = (investimentoMin + investimentoMax) / 2;

  // 6. Economia mensal (Lei 14.300): limitada a economiaMaxPct da conta (Fio B + taxa) e
  //    nunca maior que a conta menos o custo de disponibilidade.
  const disponibilidadeR = tipo.disponibilidadeKwh * tarifa;
  const economiaMensal = Math.max(0, Math.min(conta * tipo.economiaMaxPct, conta - disponibilidadeR));
  const economiaAnual = economiaMensal * 12;

  // 7–8. Payback e economia em 25 anos (reajuste e degradação)
  const medio = fluxo(conta * 12, economiaAnual, investimentoMedio);
  const minimo = fluxo(conta * 12, economiaAnual, investimentoMin);
  const maximo = fluxo(conta * 12, economiaAnual, investimentoMax);

  // 9. CO₂ evitado
  const co2KgAno = geracaoKwhMes * 12 * P.co2KgPorKwh;

  return {
    tarifa,
    consumoKwh,
    geracaoKwhMes,
    kwp,
    paineis,
    areaM2,
    investimentoMin,
    investimentoMax,
    economiaMensal,
    economiaAnual,
    paybackAnos: medio.payback,
    paybackMinAnos: minimo.payback,
    paybackMaxAnos: maximo.payback,
    economiaLiquida25: medio.liquida,
    co2KgAno,
    arvores: Math.round(co2KgAno / P.kgCo2PorArvore),
    serieSem: medio.sem,
    serieCom: medio.com,
  };
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const num = (v: number, casas = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export function mensagemWhatsapp(entrada: EntradaSimulacao, r: Resultado, empresa: string, cidade?: string) {
  const u = ufInfo(entrada.uf);
  const local = cidade ? `${cidade}/${u.uf}` : `${u.nome}/${u.uf}`;
  return [
    `Olá, ${empresa}! Fiz a simulação no site e gostaria de um orçamento.`,
    `• Conta de luz: ${brl(entrada.conta)}/mês (${TIPOS[entrada.tipo].rotulo.toLowerCase()})`,
    `• Local: ${local}`,
    `• Sistema estimado: ${num(r.kwp, 2)} kWp (${r.paineis} painéis)`,
    `• Economia estimada: ${brl(r.economiaMensal)}/mês`,
  ].join('\n');
}

export function linkWhatsapp(numero: string, mensagem: string) {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
}
