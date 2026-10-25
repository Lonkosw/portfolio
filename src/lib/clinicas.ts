import { lumiere } from '../data/clinics/modelo-1';
import { vertice } from '../data/clinics/modelo-2';
import { ninho } from '../data/clinics/modelo-3';
import { tratamentos } from '../data/tratamentos';
import { flags } from '../data/odonto-config';
import type { Clinica, ModeloId, Tratamento } from '../data/odonto-types';
import { formatarWhats } from './whatsapp';

export const clinicas: Record<ModeloId, Clinica> = { 'modelo-1': lumiere, 'modelo-2': vertice, 'modelo-3': ninho };
export const listaClinicas = Object.values(clinicas);

export const tratamentosDa = (c: Clinica): Tratamento[] => c.tratamentos.map((s) => tratamentos[s]).filter(Boolean);

const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const hh = (h: string) => (h.endsWith(':00') ? `${h.slice(0, 2)}h` : h.replace(':', 'h'));

/** Agrupa dias consecutivos com o mesmo horário: "Segunda a quinta · 09h às 19h". */
export function resumoHorarios(c: Clinica): { dias: string; horas: string }[] {
  const out: { ini: number; fim: number; horas: string }[] = [];
  for (const h of [...c.horarios].sort((a, b) => a.dia - b.dia)) {
    const horas = `${hh(h.abre)} às ${hh(h.fecha)}`;
    const ult = out[out.length - 1];
    if (ult && ult.horas === horas && ult.fim === h.dia - 1) ult.fim = h.dia;
    else out.push({ ini: h.dia, fim: h.dia, horas });
  }
  return out.map((g) => ({
    dias: g.ini === g.fim ? dias[g.ini] : `${dias[g.ini]} a ${dias[g.fim].toLowerCase()}`,
    horas: g.horas,
  }));
}

export const enderecoCompleto = (c: Clinica) =>
  `${c.endereco.logradouro} · ${c.endereco.bairro}, ${c.cidade}/${c.uf} · CEP ${c.endereco.cep}`;

/** Dados que o cliente usa para personalização e para o agendamento. */
export function dadosCliente(c: Clinica) {
  const rt = c.responsavelTecnico;
  return {
    id: c.id,
    nome: c.nome,
    nomeCompleto: c.nomeCompleto,
    cidade: c.cidade,
    whatsapp: c.whatsapp,
    dr: { titulo: rt.titulo, nome: rt.nome },
    endereco: enderecoCompleto(c),
    duracaoConsultaMin: c.duracaoConsultaMin,
    horarios: c.horarios,
    convenios: flags.mostrarConvenios ? c.convenios : [],
    equipe: c.equipe.map((d) => ({ nome: `${d.titulo} ${d.nome}`, cro: d.cro, especialidade: d.especialidade, foto: d.foto, motivos: d.motivos })),
  };
}

export const whatsFormatado = (c: Clinica) => formatarWhats(c.whatsapp);
export const base = (id: ModeloId) => `/${id}`;
