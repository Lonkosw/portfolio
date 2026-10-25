// Disponibilidade da agenda.
// ─────────────────────────────────────────────────────────────────────────────────────
// INTEGRAÇÃO COM AGENDA REAL: substitua o corpo de `getDisponibilidade()` por uma chamada ao
// seu sistema (API do consultório, Google Calendar, etc.) retornando os mesmos `Slot[]`.
// A implementação atual usa só o horário de funcionamento e marca alguns horários como ocupados
// de forma determinística, apenas para simular uma agenda em uso.
// ─────────────────────────────────────────────────────────────────────────────────────
import { agenda } from '../data/odonto-config';
import type { Clinica } from '../data/odonto-types';

export type AgendaClinica = Pick<Clinica, 'id' | 'horarios' | 'duracaoConsultaMin'>;

export interface Slot {
  hora: string; // "09:00"
  periodo: 'manha' | 'tarde' | 'noite';
  livre: boolean;
}

export const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const fromMin = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
export function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

const addDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function ehFeriado(d: Date): boolean {
  const mmdd = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (agenda.feriadosFixos.includes(mmdd) || agenda.feriadosExtras.includes(mmdd)) return true;
  if (agenda.diasFechados.includes(toISO(d))) return true;
  if (agenda.feriadosMoveis) {
    const p = pascoa(d.getFullYear());
    const iso = toISO(d);
    return [addDias(p, -48), addDias(p, -47), addDias(p, -2), addDias(p, 60)].some((x) => toISO(x) === iso);
  }
  return false;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
}

/** Horários de funcionamento do dia (sem considerar ocupação). */
function slotsDoDia(clinica: AgendaClinica, d: Date): string[] {
  if (ehFeriado(d)) return [];
  const h = clinica.horarios.find((x) => x.dia === d.getDay());
  if (!h) return [];
  const passo = clinica.duracaoConsultaMin;
  const out: string[] = [];
  for (let m = toMin(h.abre); m + passo <= toMin(h.fecha); m += passo) {
    if (h.pausaInicio && h.pausaFim && m < toMin(h.pausaFim) && m + passo > toMin(h.pausaInicio)) continue;
    out.push(fromMin(m));
  }
  return out;
}

export function getDisponibilidade(clinica: AgendaClinica, iso: string, dentista?: string, agora = new Date()): Slot[] {
  const d = fromISO(iso);
  const limite = agora.getTime() + agenda.antecedenciaHoras * 3600_000;
  return slotsDoDia(clinica, d).map((hora) => {
    const [hh, mm] = hora.split(':').map(Number);
    const quando = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm).getTime();
    const ocupado = hash(`${clinica.id}|${dentista ?? ''}|${iso}|${hora}`) < 26;
    const periodo = hh < 12 ? 'manha' : hh < 18 ? 'tarde' : 'noite';
    return { hora, periodo, livre: quando >= limite && !ocupado };
  });
}

/** Um dia é selecionável se tem expediente, não é feriado, está dentro da janela e tem ao menos 1 horário livre. */
export function diaDisponivel(clinica: AgendaClinica, iso: string, dentista?: string, agora = new Date()): boolean {
  const d = fromISO(iso);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  if (d < hoje || d > addDias(hoje, agenda.janelaDias)) return false;
  return getDisponibilidade(clinica, iso, dentista, agora).some((s) => s.livre);
}
