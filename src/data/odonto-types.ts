export type Motivo =
  | 'avaliacao'
  | 'urgencia'
  | 'limpeza'
  | 'implante'
  | 'ortodontia'
  | 'estetica'
  | 'harmonizacao'
  | 'odontopediatria'
  | 'outro';

export type ModeloId = 'modelo-1' | 'modelo-2' | 'modelo-3';

export interface Etapa {
  titulo: string;
  texto: string;
  tempo: string;
}

export interface Tratamento {
  slug: string;
  nome: string;
  /** Frase curta usada nos cards. */
  resumo: string;
  motivo: Motivo;
  oQueE: string[];
  indicadoPara: string[];
  etapas: Etapa[];
  tempoMedio: string;
  sessoes: string;
  cuidados: string[];
  faq: { p: string; r: string }[];
}

export interface Dentista {
  nome: string;
  titulo: 'Dr.' | 'Dra.';
  cro: string;
  especialidade: string;
  bio: string;
  foto: string;
  principal?: boolean;
  motivos: Motivo[];
}

export interface Depoimento {
  nome: string;
  contexto: string;
  texto: string;
}

export interface Horario {
  /** 0 = domingo … 6 = sábado */
  dia: number;
  abre: string;
  fecha: string;
  pausaInicio?: string;
  pausaFim?: string;
}

export interface Clinica {
  id: ModeloId;
  nome: string;
  nomeCompleto: string;
  slogan: string;
  descricao: string;
  cidade: string;
  uf: string;
  endereco: { logradouro: string; bairro: string; cep: string; complemento?: string; referencia: string };
  geo: { lat: number; lng: number };
  whatsapp: string;
  telefone: string;
  email: string;
  instagram: string;
  responsavelTecnico: { nome: string; titulo: 'Dr.' | 'Dra.'; cro: string };
  croClinica: string;
  anos: number;
  pacientes: number;
  notaGoogle: number;
  avaliacoes: number;
  horarios: Horario[];
  duracaoConsultaMin: number;
  /** Slugs da biblioteca de tratamentos oferecidos (a ordem define os cards). */
  tratamentos: string[];
  /** Introduções específicas de cada tratamento no tom da clínica. */
  chamadas: Record<string, string>;
  equipe: Dentista[];
  depoimentos: Depoimento[];
  convenios: string[];
  tecnologia: { titulo: string; texto: string; icone: string }[];
  biosseguranca: { titulo: string; texto: string }[];
  faq: { p: string; r: string }[];
  tour: { img: string; legenda: string }[];
  /** Imagem de cada tratamento (chave em imagens.generated.json). */
  imagens: Record<string, string>;
  comparadores: string[];
  /** Tratamentos com linha do tempo. */
  linhasDoTempo: string[];
}

export interface QuizOpcao {
  label: string;
  hint?: string;
  icone: string;
  /** Pontos por slug de tratamento. */
  pontos: Partial<Record<string, number>>;
  /** Marca a resposta como possível urgência. */
  urgencia?: boolean;
}

export interface QuizPergunta {
  id: string;
  titulo: string;
  opcoes: QuizOpcao[];
}
