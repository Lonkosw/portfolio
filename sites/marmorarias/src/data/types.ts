import type { Categoria } from './marmoraria-config.ts';

export type Variante = 'luxo' | 'acolhedor' | 'industrial';

export interface Servico {
  titulo: string;
  texto: string;
  /** Nome do ícone em src/components/Icon.astro. */
  icone: string;
  imagem?: string;
}

export interface ObraGaleria {
  titulo: string;
  ambiente: string;
  detalhe: string;
  imagem: string;
  alt: string;
}

export interface AntesDepois {
  titulo: string;
  antes: string;
  depois: string;
  altAntes: string;
  altDepois: string;
  legenda: string;
  /** Aplica um filtro visual na imagem "antes" (usado quando antes e depois são a mesma obra). */
  filtroAntes?: boolean;
}

export interface Depoimento {
  nome: string;
  bairro: string;
  texto: string;
  obra: string;
}

export interface Passo {
  titulo: string;
  texto: string;
}

export interface Diferencial {
  titulo: string;
  texto: string;
  icone: string;
}

export interface GuiaColuna {
  ambiente: string;
  recomendacao: string;
  evitar: string;
  pedras: string[];
}

export interface Faq {
  pergunta: string;
  resposta: string;
}

export interface Negocio {
  variante: Variante;
  nome: string;
  /** Slogan curto exibido sob o nome. */
  slogan: string;
  cidade: string;
  uf: string;
  bairro: string;
  endereco: string;
  cep: string;
  /** Telefone para exibição. */
  telefone: string;
  /** WhatsApp só com dígitos, com DDI (ex.: 5541900000000). */
  whats: string;
  email: string;
  horario: string[];
  instagram: string;
  fundacao: number;
  pecas: number;
  m2: number;
  nota: number;
  avaliacoes: number;
  /** Mensagem inicial do botão de WhatsApp. {nome} é substituído pelo nome da empresa. */
  mensagemWhats: string;
  seo: { titulo: string; descricao: string };
  hero: { titulo: string; destaque: string; texto: string; cta: string; ctaSecundario: string; imagem: string; alt: string; selos: string[] };
  servicos: Servico[];
  galeria: ObraGaleria[];
  antesDepois: AntesDepois;
  depoimentos: Depoimento[];
  passos: Passo[];
  diferenciais: Diferencial[];
  guia: GuiaColuna[];
  faq: Faq[];
  catalogoFiltros: Categoria[];
  ctaFinal: { titulo: string; texto: string };
}
