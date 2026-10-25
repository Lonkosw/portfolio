export const waLink = (numero: string, texto: string) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

export const formatarWhats = (n: string) => {
  const d = n.replace(/\D/g, '');
  const l = d.startsWith('55') && d.length > 11 ? d.slice(2) : d;
  if (l.length === 11) return `(${l.slice(0, 2)}) ${l.slice(2, 7)}-${l.slice(7)}`;
  if (l.length === 10) return `(${l.slice(0, 2)}) ${l.slice(2, 6)}-${l.slice(6)}`;
  return n;
};

export const mascaraTelefone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export interface DadosAgendamento {
  clinica: string;
  motivo: string;
  profissional: string;
  data: string; // "terça-feira, 12 de novembro"
  hora: string;
  nome: string;
  primeiraConsulta: boolean;
  convenio: string;
  observacao: string;
}

export function mensagemAgendamento(d: DadosAgendamento) {
  const l = [
    `Olá! Gostaria de confirmar um agendamento na ${d.clinica}.`,
    '',
    `*Motivo:* ${d.motivo}`,
    `*Profissional:* ${d.profissional}`,
    `*Data:* ${d.data}`,
    `*Horário:* ${d.hora}`,
    `*Nome:* ${d.nome}`,
    `*Primeira consulta:* ${d.primeiraConsulta ? 'Sim' : 'Não'}`,
  ];
  if (d.convenio) l.push(`*Convênio:* ${d.convenio}`);
  if (d.observacao) l.push(`*Observação:* ${d.observacao}`);
  l.push('', 'Aguardo a confirmação. Obrigado(a)!');
  return l.join('\n');
}

/** Compatibilidade com o template antigo de protótipos (src/pages/_template-original.astro). */
export const buildWhatsAppLink = waLink;
