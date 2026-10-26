const p2 = (n: number) => String(n).padStart(2, '0');
// Brasil não adota horário de verão desde 2019: America/Sao_Paulo = UTC-3.
const utc = (d: Date) => {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 3, d.getMinutes()));
  return `${x.getUTCFullYear()}${p2(x.getUTCMonth() + 1)}${p2(x.getUTCDate())}T${p2(x.getUTCHours())}${p2(x.getUTCMinutes())}00Z`;
};
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function gerarICS(o: { titulo: string; inicio: Date; duracaoMin: number; local: string; descricao: string; uid: string }) {
  const fim = new Date(o.inicio.getTime() + o.duracaoMin * 60_000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agendamento Odontologico//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${o.uid}`,
    `DTSTAMP:${utc(new Date(Date.now() - 3 * 3600_000))}`,
    `DTSTART:${utc(o.inicio)}`,
    `DTEND:${utc(fim)}`,
    `SUMMARY:${esc(o.titulo)}`,
    `LOCATION:${esc(o.local)}`,
    `DESCRIPTION:${esc(o.descricao)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(o.titulo)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
