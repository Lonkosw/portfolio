// Abas acessíveis genéricas: <div data-tabs> com [role=tab] e [role=tabpanel].
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((box) => {
  const tabs = Array.from(box.querySelectorAll<HTMLElement>('[role="tab"]'));
  const paineis = Array.from(box.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const ativar = (i: number, foco = false) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      paineis[j].hidden = !on;
      if (on && foco) t.focus();
    });
    box.dispatchEvent(new CustomEvent('od:tab', { detail: { i } }));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => ativar(i));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); ativar((i + 1) % tabs.length, true); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); ativar((i - 1 + tabs.length) % tabs.length, true); }
      else if (k === 'Home') { e.preventDefault(); ativar(0, true); }
      else if (k === 'End') { e.preventDefault(); ativar(tabs.length - 1, true); }
    });
  });
  const ini = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  ativar(ini);
});
