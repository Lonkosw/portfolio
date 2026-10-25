import { PARAMETROS as P, TIPOS, UFS, type TipoImovel } from '../data/solar-config';
import { brl, linkWhatsapp, mensagemWhatsapp, num, simular, ufInfo, type Resultado } from '../lib/simulador';

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const compacto = (v: number) => {
  if (v >= 1_000_000) return `R$ ${num(v / 1_000_000, 2)} mi`;
  if (v >= 10_000) return `R$ ${num(v / 1000, 1)} mil`;
  return brl(v);
};

const rotuloEixo = (v: number) => (v >= 1_000_000 ? `${num(v / 1_000_000, v % 1_000_000 ? 1 : 0)} mi` : v >= 1000 ? `${num(v / 1000, v % 1000 ? 1 : 0)} mil` : num(v));

type Formato = 'brl' | 'compacto' | 'int' | 'kwp' | 'anos' | 'm2' | 'kg';
const formatar: Record<Formato, (v: number) => string> = {
  brl: brl,
  compacto,
  int: (v) => num(Math.round(v)),
  kwp: (v) => `${num(v, 2)} kWp`,
  anos: (v) => `${num(v, 1)} anos`,
  m2: (v) => `${num(Math.round(v))} m²`,
  kg: (v) => `${num(Math.round(v))} kg`,
};

function animar(el: HTMLElement, destino: number, formato: Formato) {
  const de = Number(el.dataset.valor ?? destino);
  el.dataset.valor = String(destino);
  const frame = Number(el.dataset.frame ?? 0);
  if (frame) cancelAnimationFrame(frame);
  if (reduzMovimento() || de === destino) {
    el.textContent = formatar[formato](destino);
    return;
  }
  const inicio = performance.now();
  const duracao = 450;
  const passo = (agora: number) => {
    const t = Math.min((agora - inicio) / duracao, 1);
    const suave = 1 - Math.pow(1 - t, 3);
    el.textContent = formatar[formato](de + (destino - de) * suave);
    if (t < 1) el.dataset.frame = String(requestAnimationFrame(passo));
  };
  el.dataset.frame = String(requestAnimationFrame(passo));
}

/** Slider logarítmico: 0..1000 → R$ sliderMin..sliderMax, arredondado para valores "redondos". */
const sliderParaValor = (t: number) => {
  const bruto = P.sliderMin * Math.pow(P.sliderMax / P.sliderMin, t / 1000);
  const passo = bruto < 1000 ? 10 : bruto < 5000 ? 50 : 100;
  return Math.round(bruto / passo) * passo;
};
const valorParaSlider = (v: number) => {
  const c = Math.min(Math.max(v, P.sliderMin), P.sliderMax);
  return Math.round((Math.log(c / P.sliderMin) / Math.log(P.sliderMax / P.sliderMin)) * 1000);
};

function desenharGrafico(el: HTMLElement, r: Resultado) {
  const W = Math.max(Math.round(el.clientWidth), 280), H = W < 480 ? 240 : 300, m = { t: 20, r: 14, b: 34, l: W < 480 ? 46 : 58 };
  // Eixo com valores redondos (1, 2, 2,5, 5 ou 10 × potência de 10), em 4 intervalos
  const bruto = Math.max(...r.serieSem, ...r.serieCom) / 4;
  const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
  const passo = ([1, 2, 2.5, 5, 10].find((f) => f * pot >= bruto) ?? 10) * pot;
  const maxY = passo * 4;
  const x = (n: number) => m.l + (n / P.anos) * (W - m.l - m.r);
  const y = (v: number) => H - m.b - (v / maxY) * (H - m.t - m.b);
  const linha = (s: number[]) => s.map((v, n) => `${n ? 'L' : 'M'}${x(n).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const grade = Array.from({ length: 5 }, (_, i) => {
    const v = passo * i;
    return `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--sim-grade)" stroke-width="1"/>
      <text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--sim-texto-suave)">${v === 0 ? '0' : rotuloEixo(v)}</text>`;
  }).join('');
  const anos = [0, 5, 10, 15, 20, 25]
    .map((n) => `<text x="${x(n)}" y="${H - 12}" text-anchor="middle" font-size="11" fill="var(--sim-texto-suave)">${n === 0 ? 'hoje' : n + ' a'}</text>`)
    .join('');

  let marcador = '';
  if (r.paybackAnos !== null) {
    const n = r.paybackAnos;
    const i = Math.floor(n);
    const valor = r.serieSem[i] + (r.serieSem[Math.min(i + 1, P.anos)] - r.serieSem[i]) * (n - i);
    const lado = n > P.anos * 0.7 ? 'end' : 'start';
    const dx = lado === 'end' ? -12 : 12;
    marcador = `<line x1="${x(n)}" x2="${x(n)}" y1="${y(valor)}" y2="${H - m.b}" stroke="var(--sim-destaque)" stroke-dasharray="4 4"/>
      <circle cx="${x(n)}" cy="${y(valor)}" r="6" fill="var(--sim-destaque)" stroke="var(--sim-fundo-ponto)" stroke-width="2"/>
      <text x="${x(n) + dx}" y="${y(valor) - 14}" text-anchor="${lado}" font-size="12" font-weight="700" fill="var(--sim-texto)">payback em ${num(n, 1)} anos</text>`;
  }
  const rotulo = `Gráfico do gasto acumulado em 25 anos. Sem energia solar: ${brl(r.serieSem[P.anos])}. Com energia solar: ${brl(r.serieCom[P.anos])}.${r.paybackAnos !== null ? ` O investimento se paga em cerca de ${num(r.paybackAnos, 1)} anos.` : ''}`;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${rotulo}" class="block h-auto w-full">
    ${grade}${anos}
    <path d="${linha(r.serieSem)}" fill="none" stroke="var(--sim-linha-sem)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${linha(r.serieCom)}" fill="none" stroke="var(--sim-linha-com)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${marcador}
  </svg>`;
}

function iniciar(raiz: HTMLElement) {
  const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s);
  const slider = q<HTMLInputElement>('[data-sim="slider"]')!;
  const campoConta = q<HTMLInputElement>('[data-sim="conta"]')!;
  const selUf = q<HTMLSelectElement>('[data-sim="uf"]')!;
  const campoTarifa = q<HTMLInputElement>('[data-sim="tarifa"]')!;
  const cta = q<HTMLAnchorElement>('[data-sim="cta"]')!;
  const grafico = q<HTMLElement>('[data-sim="grafico"]')!;
  const tipos = [...raiz.querySelectorAll<HTMLInputElement>('input[name$="-tipo"]')];
  const empresa = raiz.dataset.empresa ?? '';
  const cidade = raiz.dataset.cidade ?? '';
  const whatsapp = raiz.dataset.whatsapp ?? '';

  selUf.innerHTML = UFS.map((u) => `<option value="${u.uf}">${u.nome} (${u.uf})</option>`).join('');
  selUf.value = raiz.dataset.uf ?? 'SP';
  const contaInicial = Number(raiz.dataset.conta ?? 600);
  campoConta.value = String(contaInicial);
  slider.value = String(valorParaSlider(contaInicial));

  const dicaTarifa = q('[data-sim="dica-tarifa"]');

  let ultimo: Resultado | null = null;
  let larguraGrafico = 0;
  new ResizeObserver(() => {
    if (ultimo && grafico.clientWidth && grafico.clientWidth !== larguraGrafico) { larguraGrafico = grafico.clientWidth; desenharGrafico(grafico, ultimo); }
  }).observe(grafico);

  function atualizar() {
    const tipo = (tipos.find((t) => t.checked)?.value ?? 'residencial') as TipoImovel;
    const conta = Math.min(Math.max(Number(campoConta.value) || P.contaMin, P.contaMin), P.contaMax);
    const tarifa = Number(campoTarifa.value.replace(',', '.')) || undefined;
    const entrada = { conta, uf: selUf.value, tipo, tarifa };
    const r = simular(entrada);
    const padrao = ufInfo(selUf.value).tarifa * TIPOS[tipo].fatorTarifa;
    if (dicaTarifa) dicaTarifa.textContent = `Média considerada para ${selUf.value}: R$ ${num(padrao, 2)}/kWh`;

    raiz.querySelectorAll<HTMLElement>('[data-out]').forEach((el) => {
      const chave = el.dataset.out as keyof Resultado;
      const v = r[chave];
      if (typeof v === 'number') animar(el, v, (el.dataset.fmt ?? 'int') as Formato);
      else if (v === null) el.textContent = 'acima de 25 anos';
    });
    raiz.querySelectorAll<HTMLElement>('[data-out-texto]').forEach((el) => {
      const fmt = el.dataset.outTexto;
      if (fmt === 'faixa-payback')
        el.textContent = r.paybackMinAnos !== null && r.paybackMaxAnos !== null ? `faixa de ${num(r.paybackMinAnos, 1)} a ${num(r.paybackMaxAnos, 1)} anos` : 'acima de 25 anos';
      if (fmt === 'faixa-invest') el.textContent = `${brl(r.investimentoMin)} a ${brl(r.investimentoMax)}`;
      if (fmt === 'resumo') el.textContent = `${num(r.paineis)} painéis de ${P.painelWp} Wp em cerca de ${num(Math.round(r.areaM2))} m² de telhado ou solo`;
      if (fmt === 'conta') el.textContent = brl(conta);
    });
    ultimo = r;
    desenharGrafico(grafico, r);
    cta.href = linkWhatsapp(whatsapp, mensagemWhatsapp(entrada, r, empresa, selUf.value === raiz.dataset.uf ? cidade : undefined));
  }

  slider.addEventListener('input', () => {
    campoConta.value = String(sliderParaValor(Number(slider.value)));
    atualizar();
  });
  campoConta.addEventListener('input', () => {
    if (Number(campoConta.value) > 0) slider.value = String(valorParaSlider(Number(campoConta.value)));
    atualizar();
  });
  campoConta.addEventListener('blur', () => {
    const v = Math.min(Math.max(Number(campoConta.value) || P.contaMin, P.contaMin), P.contaMax);
    campoConta.value = String(v);
    atualizar();
  });
  [selUf, campoTarifa, ...tipos].forEach((el) => el.addEventListener('input', atualizar));

  // Variante em etapas (questionário)
  const paineis = [...raiz.querySelectorAll<HTMLElement>('[data-etapa]')];
  if (paineis.length) {
    let atual = 1;
    const ir = (n: number) => {
      atual = Math.min(Math.max(n, 1), paineis.length);
      paineis.forEach((p) => (p.hidden = Number(p.dataset.etapa) !== atual));
      raiz.querySelectorAll<HTMLElement>('[data-etapa-ponto]').forEach((d) => {
        const ativo = Number(d.dataset.etapaPonto) <= atual;
        d.dataset.ativo = String(ativo);
        d.setAttribute('aria-current', Number(d.dataset.etapaPonto) === atual ? 'step' : 'false');
      });
      if (atual === paineis.length) atualizar();
    };
    raiz.querySelectorAll('[data-etapa-proxima]').forEach((b) => b.addEventListener('click', () => ir(atual + 1)));
    raiz.querySelectorAll('[data-etapa-anterior]').forEach((b) => b.addEventListener('click', () => ir(atual - 1)));
    ir(1);
  }

  atualizar();
}

document.querySelectorAll<HTMLElement>('[data-simulador]').forEach(iniciar);
