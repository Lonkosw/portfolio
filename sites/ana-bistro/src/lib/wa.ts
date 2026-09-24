/** Monta um link de WhatsApp com mensagem pré-preenchida. */
export function wa(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
