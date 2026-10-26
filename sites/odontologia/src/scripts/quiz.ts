import { aplicarPersonalizacao } from '../lib/personalizar';
import { pontuarQuiz } from '../lib/quiz';

interface T { nome: string; tempo: string; sessoes: string; motivo: string; exp: string }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
aplicarPersonalizacao();

document.querySelectorAll<HTMLElement>('[data-quiz]').forEach((root) => {
  const data = JSON.parse(root.querySelector('[data-quiz-data]')!.textContent!) as {
    total: number; oferecidos: string[]; base: string; trat: Record<string, T>;
  };
  const form = root.querySelector<HTMLFormElement>('[data-qform]')!;
  const qs = Array.from(root.querySelectorAll<HTMLElement>('[data-q]'));
  const back = root.querySelector<HTMLButtonElement>('[data-qback]')!;
  const bar = root.querySelector<HTMLElement>('[data-qbar]')!;
  const count = root.querySelector<HTMLElement>('[data-count-txt]')!;
  const res = root.querySelector<HTMLElement>('[data-qres]')!;
  const respostas: number[] = [];
  let atual = 0;

  const mostrar = (i: number, foco = true) => {
    atual = i;
    qs.forEach((q, j) => (q.hidden = j !== i));
    back.hidden = i === 0;
    bar.style.transform = `scaleX(${(i + 1) / data.total})`;
    count.textContent = `Pergunta ${i + 1} de ${data.total}`;
    if (foco) qs[i].querySelector<HTMLElement>('legend')?.focus();
  };

  form.addEventListener('change', (e) => {
    const inp = e.target as HTMLInputElement;
    if (inp.type !== 'radio') return;
    respostas[atual] = Number(inp.value);
    setTimeout(() => (atual < data.total - 1 ? mostrar(atual + 1) : final()), reduce ? 0 : 260);
  });
  back.addEventListener('click', () => atual > 0 && mostrar(atual - 1));

  function final() {
    const { resultados, urgencia, avisos } = pontuarQuiz(respostas, data.oferecidos);
    form.hidden = true;
    root.querySelector<HTMLElement>('.qz-top')!.hidden = true;
    res.hidden = false;
    res.replaceChildren();
    const h = document.createElement('h3');
    h.className = 'qz-rt';
    h.textContent = resultados.length > 1 ? 'Caminhos que costumam ser avaliados no seu caso' : 'Um caminho que costuma ser avaliado no seu caso';
    res.appendChild(h);
    if (urgencia) {
      const u = document.createElement('p');
      u.className = 'ag-note';
      u.setAttribute('role', 'note');
      u.textContent = 'Você indicou dor ou incômodo recente. Vale priorizar uma avaliação: use o botão abaixo para falar com a equipe o quanto antes.';
      res.appendChild(u);
    }
    avisos.forEach((t) => {
      const u = document.createElement('p');
      u.className = 'ag-note';
      u.setAttribute('role', 'note');
      u.textContent = t;
      res.appendChild(u);
    });
    const lista = document.createElement('div');
    lista.className = 'qz-cards';
    resultados.forEach((r, i) => {
      const t = data.trat[r.slug];
      if (!t) return;
      const c = document.createElement('article');
      c.className = 'qz-card';
      c.innerHTML = `<p class="qz-rank">${i === 0 ? 'Mais compatível' : 'Também pode fazer sentido'}</p><h4></h4><p class="qz-exp"></p><dl><div><dt>Tempo médio</dt><dd></dd></div><div><dt>Sessões</dt><dd></dd></div></dl><div class="qz-card-cta"></div>`;
      c.querySelector('h4')!.textContent = t.nome;
      c.querySelector('.qz-exp')!.textContent = t.exp;
      const dds = c.querySelectorAll('dd');
      dds[0].textContent = t.tempo; dds[1].textContent = t.sessoes;
      const a = document.createElement('a');
      a.className = 'qz-more';
      a.href = `${data.base}/${r.slug}${location.search}`;
      a.textContent = 'Saiba mais sobre este tratamento';
      c.querySelector('.qz-card-cta')!.appendChild(a);
      lista.appendChild(c);
    });
    res.appendChild(lista);
    const acoes = document.createElement('div');
    acoes.className = 'qz-actions';
    const ag = document.createElement('button');
    ag.type = 'button'; ag.className = 'btn btn-primary'; ag.textContent = 'Agendar avaliação';
    const motivo = urgencia ? 'urgencia' : data.trat[resultados[0]?.slug]?.motivo ?? 'avaliacao';
    ag.addEventListener('click', () => window.dispatchEvent(new CustomEvent('od:agendar', { detail: { motivo } })));
    const re = document.createElement('button');
    re.type = 'button'; re.className = 'btn btn-ghost'; re.textContent = 'Refazer o quiz';
    re.addEventListener('click', () => {
      respostas.length = 0; form.reset(); form.hidden = false; res.hidden = true;
      root.querySelector<HTMLElement>('.qz-top')!.hidden = false; mostrar(0);
    });
    acoes.append(ag, re);
    res.appendChild(acoes);
    const av = document.createElement('p');
    av.className = 'qz-fine';
    av.textContent = 'Este resultado é apenas uma orientação geral. A indicação final depende de avaliação clínica individual.';
    res.appendChild(av);
    res.focus();
  }
  mostrar(0, false);
});
