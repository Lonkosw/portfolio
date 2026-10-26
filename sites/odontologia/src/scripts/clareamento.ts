interface C { nome: string; tonsMin: number; tonsMax: number; tempo: string; obs: string }
document.querySelectorAll<HTMLElement>('[data-cl]').forEach((root) => {
  const data = JSON.parse(root.querySelector('[data-cl-data]')!.textContent!) as { escala: { id: string; cor: string }[]; c: { consultorio: C; caseiro: C } };
  const n = data.escala.length;
  const fig = (k: string) => root.querySelector<HTMLElement>(`[data-fig="${k}"]`)!;
  const tooth = (k: string) => fig(k).querySelector<SVGPathElement>('[data-tooth]')!;
  const pos = (i: number) => `${(i / (n - 1)) * 100}%`;

  function faixa(i: number, c: C) {
    const melhor = Math.max(0, i - c.tonsMax);
    const menor = Math.max(0, i - c.tonsMin);
    return { melhor, menor, medio: Math.round((melhor + menor) / 2) };
  }
  function atualizar() {
    const sel = root.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    const i = sel ? Number(sel.value) : 8;
    const cfg = data.c;
    tooth('atual').style.fill = data.escala[i].cor;
    fig('atual').querySelector('[data-shade]')!.textContent = data.escala[i].id;
    fig('atual').querySelector('[data-time]')!.textContent = 'Ponto de partida da simulação';
    (['consultorio', 'caseiro'] as const).forEach((k) => {
      const f = faixa(i, cfg[k]);
      tooth(k).style.fill = data.escala[f.medio].cor;
      const a = data.escala[f.melhor].id, b = data.escala[f.menor].id;
      fig(k).querySelector('[data-shade]')!.textContent = i === 0 ? `${data.escala[0].id} (já é o tom mais claro da escala)` : a === b ? `Estimativa: ${a}` : `Estimativa: entre ${b} e ${a}`;
      fig(k).querySelector('[data-time]')!.textContent = `${cfg[k].tempo} ${cfg[k].obs}`;
    });
    const mc = faixa(i, cfg.consultorio), mk = faixa(i, cfg.caseiro);
    (root.querySelector('[data-m-atual]') as HTMLElement).style.left = pos(i);
    (root.querySelector('[data-m-cons]') as HTMLElement).style.left = pos(mc.medio);
    (root.querySelector('[data-m-case]') as HTMLElement).style.left = pos(mk.medio);
  }
  root.addEventListener('change', atualizar);
  atualizar();
});
