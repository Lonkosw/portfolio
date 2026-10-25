export interface Foto {
  /** Caminho base sem extensão nem largura, ex.: "modelo-1/hero-por-do-sol" (arquivos em public/img). */
  base: string;
  alt: string;
}

export type TipoObra = 'residencial' | 'comercial' | 'rural';

export interface Empresa {
  slug: string;
  nome: string;
  /** Nome curto para logotipo. */
  marca: string;
  slogan: string;
  cidade: string;
  uf: string;
  endereco: { rua: string; bairro: string; cep: string };
  telefone: string;
  /** Somente dígitos com DDI. */
  whatsapp: string;
  email: string;
  instagram: string;
  horario: string;
  fundacao: number;
  cores: {
    fundo: string;
    superficie: string;
    texto: string;
    suave: string;
    destaque: string;
    destaque2: string;
    /** Cor do texto sobre o destaque. */
    sobre: string;
    linha: string;
  };
  fontes: { display: string; corpo: string; mono?: string; url: string };
  seo: { titulo: string; descricao: string; og: string };
  hero: { etiqueta: string; titulo: string; destaque: string; subtitulo: string; cta: string; ctaSecundario: string; foto: Foto };
  numeros: { valor: number; sufixo?: string; prefixo?: string; casas?: number; rotulo: string }[];
  passos: { titulo: string; texto: string; prazo: string }[];
  simulador: { titulo: string; texto: string; ufPadrao: string; contaPadrao: number };
  beneficios: { titulo: string; texto: string; icone: string; destaque?: string }[];
  portfolio: { titulo: string; tipo: TipoObra; local: string; kwp: number; foto: Foto }[];
  pagamento: { titulo: string; texto: string; icone: string; detalhe: string }[];
  depoimentos: { nome: string; cidade: string; texto: string; perfil: string; nota: number }[];
  garantias: { valor: string; titulo: string; texto: string }[];
  certificacoes: string[];
  faq: { pergunta: string; resposta: string }[];
  ctaFinal: { titulo: string; texto: string; botao: string };
  imagens: Record<string, Foto>;
}
