import { quizPerguntas } from '../data/odonto-config';

export interface ResultadoQuiz {
  slug: string;
  pontos: number;
}

/** `respostas`: índice da opção escolhida por pergunta (na ordem de `quizPerguntas`). */
export function pontuarQuiz(respostas: number[], oferecidos: string[]) {
  const total: Record<string, number> = {};
  let urgencia = false;
  quizPerguntas.forEach((p, i) => {
    const op = p.opcoes[respostas[i]];
    if (!op) return;
    if (op.urgencia) urgencia = true;
    for (const [slug, pts] of Object.entries(op.pontos)) total[slug] = (total[slug] ?? 0) + (pts ?? 0);
  });
  const ranking: ResultadoQuiz[] = Object.entries(total)
    .filter(([slug, pts]) => pts > 0 && oferecidos.includes(slug))
    .map(([slug, pontos]) => ({ slug, pontos }))
    .sort((a, b) => b.pontos - a.pontos);
  let top = ranking.slice(0, 3);
  // Só mantém sugestões próximas da primeira, para não diluir o resultado.
  if (top.length) top = top.filter((r) => r.pontos >= Math.max(2, top[0].pontos * 0.4));
  if (!top.length) top = [{ slug: oferecidos.includes('limpeza-e-prevencao') ? 'limpeza-e-prevencao' : oferecidos[0], pontos: 0 }];
  // Respostas muito fortes para algo que a clínica não oferece: avisa em vez de sugerir em silêncio.
  const avisos: string[] = [];
  if ((total.odontopediatria ?? 0) >= 6 && !oferecidos.includes('odontopediatria')) {
    avisos.push('Esta clínica atende adolescentes e adultos. Para crianças, a equipe pode indicar um profissional de confiança. Os caminhos abaixo valem para os adultos da família.');
  }
  return { resultados: top, urgencia, avisos };
}
