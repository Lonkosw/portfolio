/**
 * Os preços do cardápio vivem como texto ("220,00", "1.250,00") porque é
 * assim que aparecem no menu oficial e é assim que devem ser exibidos.
 * Para somar precisamos ir e voltar entre texto e número.
 */

/** "1.250,00" → 1250 */
export function paraNumero(preco: string): number {
  return Number(preco.replace(/\./g, '').replace(',', '.'));
}

/** 1250 → "1.250,00" */
export function paraReal(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
