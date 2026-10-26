// Personalização por URL: ?empresa=Nome&cidade=X&whats=55...&dr=Nome
// O HTML é estático; aqui substituímos, no cliente, os textos padrão da clínica (nome, cidade,
// WhatsApp e dentista principal) por valores sanitizados vindos da query string.
import { formatarWhats } from './whatsapp';

export interface PadraoClinica {
  nome: string;
  nomeCompleto: string;
  cidade: string;
  whatsapp: string;
  dr: { titulo: string; nome: string };
}
export interface ClinicaAtual {
  nome: string;
  nomeCompleto: string;
  cidade: string;
  whatsapp: string;
  drTitulo: string;
  drNome: string;
}

const limpar = (s: string | null) =>
  (s ?? '').replace(/[\u0000-\u001f<>"'`\\{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);

let atual: ClinicaAtual | null = null;
export const getClinicaAtual = () => atual;

function substituir(texto: string, pares: [string, string][]) {
  let t = texto;
  for (const [de, para] of pares) if (de && t.includes(de)) t = t.split(de).join(para);
  return t;
}

export function aplicarPersonalizacao() {
  if (atual) return atual;
  const el = document.getElementById('clinic-defaults');
  if (!el?.textContent) return null;
  const pad: PadraoClinica = JSON.parse(el.textContent);
  const q = new URLSearchParams(location.search);
  const empresa = limpar(q.get('empresa'));
  const cidade = limpar(q.get('cidade'));
  const dr = limpar(q.get('dr'));
  let whats = (q.get('whats') ?? '').replace(/\D/g, '');
  if (whats.length === 10 || whats.length === 11) whats = `55${whats}`;
  if (!/^55\d{10,11}$/.test(whats)) whats = '';

  const comTitulo = /^(dr|dra)\.?\s+/i.exec(dr);
  const novoTitulo = comTitulo ? (comTitulo[1].toLowerCase() === 'dra' ? 'Dra.' : 'Dr.') : pad.dr.titulo;
  const novoNomeDr = dr.replace(/^(dr|dra)\.?\s+/i, '');

  atual = {
    nome: empresa || pad.nome,
    nomeCompleto: empresa || pad.nomeCompleto,
    cidade: cidade || pad.cidade,
    whatsapp: whats || pad.whatsapp,
    drTitulo: dr ? novoTitulo : pad.dr.titulo,
    drNome: novoNomeDr || pad.dr.nome,
  };
  if (!empresa && !cidade && !dr && !whats) return atual;

  const pares: [string, string][] = [];
  if (empresa) pares.push([pad.nomeCompleto, empresa], [pad.nome, empresa]);
  if (dr) {
    pares.push([`${pad.dr.titulo} ${pad.dr.nome}`, `${novoTitulo} ${novoNomeDr}`]);
    pares.push([pad.dr.nome, novoNomeDr]);
    pares.push([`${pad.dr.titulo} ${pad.dr.nome.split(' ')[0]}`, `${novoTitulo} ${novoNomeDr.split(' ')[0]}`]);
  }
  if (cidade) pares.push([pad.cidade, cidade]);
  if (whats) pares.push([pad.whatsapp, whats], [formatarWhats(pad.whatsapp), formatarWhats(whats)]);

  const tw = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = tw.nextNode())) {
    const pai = (n.parentElement?.tagName ?? '').toLowerCase();
    if (pai === 'style' || (pai === 'script' && n.parentElement?.id === 'clinic-defaults')) continue;
    const v = n.nodeValue ?? '';
    const r = substituir(v, pares);
    if (r !== v) n.nodeValue = r;
  }
  document.querySelectorAll('*').forEach((e) => {
    for (const a of Array.from(e.attributes)) {
      if (!a.value || a.name === 'class' || a.name === 'style') continue;
      const r = substituir(a.value, pares);
      if (r !== a.value) e.setAttribute(a.name, r);
    }
  });
  // Mantém os parâmetros ao navegar entre páginas da mesma clínica.
  const qs = location.search;
  if (qs) {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="/modelo-"]').forEach((a) => {
      const href = a.getAttribute('href') ?? '';
      if (href.includes('?')) return;
      const [path, hash] = href.split('#');
      a.setAttribute('href', `${path}${qs}${hash ? `#${hash}` : ''}`);
    });
  }
  return atual;
}
