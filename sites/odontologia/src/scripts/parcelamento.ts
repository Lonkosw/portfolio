document.querySelectorAll<HTMLElement>('[data-pc]').forEach((r) => {
    const cfg = JSON.parse(r.dataset.cfg!);
    const v = r.querySelector<HTMLInputElement>('[name=v]')!, n = r.querySelector<HTMLSelectElement>('[name=n]')!, out = r.querySelector('[data-out]')!;
    const calc = () => {
      const valor = parseFloat(v.value.replace(/\./g, '').replace(',', '.'));
      if (!valor || valor <= 0) return void (out.textContent = '');
      const k = Number(n.value), i = cfg.jurosMensal / 100;
      const p = i ? (valor * i) / (1 - Math.pow(1 + i, -k)) : valor / k;
      out.textContent = p < cfg.parcelaMinima && k > 1 ? `Parcela abaixo do mínimo de R$ ${cfg.parcelaMinima}. Reduza o número de parcelas.` : `${k}x de ${p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}${i ? ` (juros de ${cfg.jurosMensal}% ao mês)` : ' sem juros'}`;
    };
    r.addEventListener('input', calc);
  });
