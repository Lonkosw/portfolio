// Configuração clínica e dos simuladores — compartilhada pelas 3 clínicas.
// ⚠ REVISÃO PELO(A) DENTISTA: tempos médios, nº de sessões, regras do quiz, escala de cores e textos
// de resultado são estimativas gerais. Ajuste antes de publicar e valide com o CRO local.
import type { Motivo, QuizPergunta } from './odonto-types';

// ───────────────────────────── Flags (regras do CFO) ─────────────────────────────
export const flags = {
  /** Preços, parcelas e simulador de parcelamento. Mantenha false (publicidade odontológica). */
  mostrarValores: import.meta.env.PUBLIC_MOSTRAR_VALORES === 'true',
  /** Seção ilustrativa de antes/depois (usa ilustração genérica, nunca fotos de pacientes). */
  mostrarAntesDepois: true,
  /** Lista de convênios aceitos. */
  mostrarConvenios: true,
  /** Impede a indexação nos buscadores. Defina PUBLIC_NOINDEX=true no build para vitrines em validação. */
  noindex: import.meta.env.PUBLIC_NOINDEX === 'true',
};

// ───────────────────────────── Agendamento ─────────────────────────────
export const agenda = {
  /** Antecedência mínima (horas) para um horário aparecer como livre. */
  antecedenciaHoras: 3,
  /** Quantos dias à frente o calendário permite navegar. */
  janelaDias: 90,
  /** Dias fixos (MM-DD) sem expediente. */
  feriadosFixos: ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'],
  /** Feriados municipais/extras (MM-DD). Curitiba: Nossa Senhora da Luz. */
  feriadosExtras: ['09-08'],
  /** Datas pontuais sem atendimento (AAAA-MM-DD), p.ex. recesso. */
  diasFechados: [] as string[],
  /** Considera carnaval, sexta-feira santa e corpus christi (calculados a partir da Páscoa). */
  feriadosMoveis: true,
};

export const motivos: { id: Motivo; titulo: string; texto: string; icone: string; tratamento?: string }[] = [
  { id: 'avaliacao', titulo: 'Avaliação geral', texto: 'Check-up completo e conversa sobre seus objetivos.', icone: 'stetho' },
  { id: 'urgencia', titulo: 'Dor ou urgência', texto: 'Dor, trauma ou algo que não pode esperar.', icone: 'alert' },
  { id: 'limpeza', titulo: 'Limpeza e prevenção', texto: 'Profilaxia e cuidado com a gengiva.', icone: 'sparkle', tratamento: 'limpeza-e-prevencao' },
  { id: 'implante', titulo: 'Implantes', texto: 'Reposição de dentes ausentes e reabilitação.', icone: 'implant' },
  { id: 'ortodontia', titulo: 'Ortodontia e alinhadores', texto: 'Alinhar os dentes e corrigir a mordida.', icone: 'aligner' },
  { id: 'estetica', titulo: 'Estética do sorriso', texto: 'Lentes, facetas e clareamento.', icone: 'smile' },
  { id: 'harmonizacao', titulo: 'Harmonização', texto: 'Avaliação de procedimentos orofaciais.', icone: 'face' },
  { id: 'odontopediatria', titulo: 'Odontopediatria', texto: 'Cuidado com crianças e adolescentes.', icone: 'child' },
  { id: 'outro', titulo: 'Outro motivo', texto: 'Conte para a equipe o que você precisa.', icone: 'chat' },
];

// ───────────────────────────── Quiz "qual tratamento?" ─────────────────────────────
export const quizPerguntas: QuizPergunta[] = [
  {
    id: 'queixa',
    titulo: 'O que mais incomoda no seu sorriso hoje?',
    opcoes: [
      { label: 'A cor, dentes amarelados ou manchados', icone: 'sparkle', pontos: { 'clareamento-dental': 4, 'facetas-de-porcelana': 1, 'lentes-de-contato-dental': 1 } },
      { label: 'O formato, o tamanho ou pequenos desgastes', icone: 'smile', pontos: { 'lentes-de-contato-dental': 3, 'facetas-de-porcelana': 3, 'planejamento-digital-do-sorriso': 1 } },
      { label: 'Dentes tortos, apinhados ou com espaços', icone: 'aligner', pontos: { 'alinhadores-transparentes': 3, 'aparelho-ortodontico-fixo': 3, 'lentes-de-contato-dental': 1 } },
      { label: 'Falta de dentes ou dificuldade para mastigar', icone: 'implant', pontos: { 'implantes-dentarios': 4, 'protocolo-all-on-4': 1 } },
      { label: 'Gengiva, sangramento ou mau hálito', icone: 'drop', pontos: { 'limpeza-e-prevencao': 5 } },
      { label: 'Nada em especial, quero um check-up', icone: 'stetho', pontos: { 'limpeza-e-prevencao': 3, 'planejamento-digital-do-sorriso': 1 } },
    ],
  },
  {
    id: 'ausencia',
    titulo: 'Falta algum dente, ou você usa prótese?',
    opcoes: [
      { label: 'Não falta nenhum dente', icone: 'check', pontos: {} },
      { label: 'Falta um ou poucos dentes', icone: 'implant', pontos: { 'implantes-dentarios': 4 } },
      { label: 'Faltam vários dentes ou uso prótese parcial', icone: 'implant', pontos: { 'implantes-dentarios': 3, 'protocolo-all-on-4': 2 } },
      { label: 'Uso dentadura e queria avaliar uma opção fixa', icone: 'implant', pontos: { 'protocolo-all-on-4': 6, 'implantes-dentarios': 2 } },
    ],
  },
  {
    id: 'sensibilidade',
    titulo: 'Você sente sensibilidade ou dor nos dentes?',
    opcoes: [
      { label: 'Não sinto nada', icone: 'check', pontos: {} },
      { label: 'Sensibilidade ao frio ou ao doce', icone: 'drop', pontos: { 'limpeza-e-prevencao': 2, 'tratamento-de-canal': 1, 'clareamento-dental': -2 } },
      { label: 'Dor ou incômodo recente', hint: 'Podemos priorizar o atendimento', icone: 'alert', urgencia: true, pontos: { 'tratamento-de-canal': 5, 'limpeza-e-prevencao': 1 } },
    ],
  },
  {
    id: 'resultado',
    titulo: 'Que tipo de resultado você procura?',
    opcoes: [
      { label: 'Algo discreto e natural', icone: 'smile', pontos: { 'alinhadores-transparentes': 2, 'clareamento-dental': 1, 'facetas-de-porcelana': 1 } },
      { label: 'Uma transformação visível do sorriso', icone: 'sparkle', pontos: { 'lentes-de-contato-dental': 3, 'planejamento-digital-do-sorriso': 2, 'harmonizacao-orofacial': 1 } },
      { label: 'Priorizo saúde e função', icone: 'stetho', pontos: { 'limpeza-e-prevencao': 2, 'implantes-dentarios': 1, 'aparelho-ortodontico-fixo': 1, 'tratamento-de-canal': 1 } },
      { label: 'Ainda quero entender as opções', icone: 'chat', pontos: { 'planejamento-digital-do-sorriso': 3, 'limpeza-e-prevencao': 1 } },
    ],
  },
  {
    id: 'prazo',
    titulo: 'Você tem pressa ou uma data em mente?',
    opcoes: [
      { label: 'Tenho um evento em poucas semanas', icone: 'clock', pontos: { 'clareamento-dental': 2, 'facetas-de-porcelana': 1 } },
      { label: 'Sem pressa, prefiro algo bem planejado', icone: 'check', pontos: { 'planejamento-digital-do-sorriso': 2, 'alinhadores-transparentes': 1, 'lentes-de-contato-dental': 1 } },
      { label: 'Posso acompanhar um tratamento mais longo', icone: 'aligner', pontos: { 'aparelho-ortodontico-fixo': 1, 'alinhadores-transparentes': 1, 'implantes-dentarios': 1 } },
    ],
  },
  {
    id: 'paciente',
    titulo: 'Para quem é o atendimento?',
    opcoes: [
      { label: 'Para mim, adulto', icone: 'smile', pontos: {} },
      { label: 'Para uma criança', icone: 'child', pontos: { odontopediatria: 9 } },
      { label: 'Para um adolescente', icone: 'child', pontos: { 'aparelho-ortodontico-fixo': 2, 'alinhadores-transparentes': 2, odontopediatria: 1 } },
      { label: 'Para a família toda', icone: 'family', pontos: { odontopediatria: 3, 'limpeza-e-prevencao': 2 } },
    ],
  },
  {
    id: 'rosto',
    titulo: 'Tem interesse em avaliar o contorno do rosto e dos lábios?',
    opcoes: [
      { label: 'Não, só os dentes', icone: 'smile', pontos: {} },
      { label: 'Sim, gostaria de conversar sobre isso', icone: 'face', pontos: { 'harmonizacao-orofacial': 5, 'planejamento-digital-do-sorriso': 1 } },
    ],
  },
];

/** Texto de explicação de cada tratamento no resultado do quiz. */
export const quizExplicacao: Record<string, string> = {
  'clareamento-dental': 'Pode ser indicado para quem busca dentes mais claros, desde que a saúde bucal esteja em dia. A técnica é escolhida após a avaliação.',
  'lentes-de-contato-dental': 'Pode ser uma alternativa para harmonizar formato, tamanho e cor de dentes específicos, com planejamento prévio.',
  'facetas-de-porcelana': 'Pode atender pequenas fraturas, manchas persistentes e espaços, em resina ou porcelana, de forma conservadora.',
  'alinhadores-transparentes': 'Placas discretas e removíveis que podem alinhar os dentes de forma gradual, conforme a complexidade do caso.',
  'aparelho-ortodontico-fixo': 'Uma técnica consolidada para diferentes desalinhamentos e problemas de mordida, com acompanhamento mensal.',
  'implantes-dentarios': 'Pode repor dentes ausentes com raízes artificiais, após exames de imagem e planejamento individual.',
  'protocolo-all-on-4': 'Pode ser avaliado para reabilitar uma arcada inteira sobre implantes. Nem todos os casos são elegíveis.',
  'harmonizacao-orofacial': 'Procedimentos complementares realizados por dentistas habilitados, após anamnese e exame clínico.',
  odontopediatria: 'Cuidado com acolhimento e linguagem adequados à idade, com foco em prevenção e orientação à família.',
  'limpeza-e-prevencao': 'A base da saúde bucal: remove placa e tártaro, cuida da gengiva e orienta a higiene diária.',
  'tratamento-de-canal': 'Pode ser indicado quando a parte interna do dente está inflamada ou infectada, para tentar preservá-lo.',
  'planejamento-digital-do-sorriso': 'Uma etapa de análise e simulação para entender as opções com calma antes de decidir.',
};

// ───────────────────────────── Simulador de clareamento ─────────────────────────────
/** Escala de cores em ordem do mais claro ao mais escuro (referência de cor ilustrativa, não clínica). */
export const escalaDentes = [
  { id: 'B1', cor: '#F4EEDF' },
  { id: 'A1', cor: '#EFE6D0' },
  { id: 'B2', cor: '#EBE0C4' },
  { id: 'D2', cor: '#E8DCC7' },
  { id: 'A2', cor: '#E5D7B8' },
  { id: 'C1', cor: '#E1D5BE' },
  { id: 'C2', cor: '#DACDAF' },
  { id: 'D4', cor: '#D9C9AD' },
  { id: 'A3', cor: '#DFCA9F' },
  { id: 'D3', cor: '#D7C4A0' },
  { id: 'B3', cor: '#DDC693' },
  { id: 'A3.5', cor: '#D7BD8B' },
  { id: 'B4', cor: '#D8BF85' },
  { id: 'C3', cor: '#CEB68E' },
  { id: 'A4', cor: '#D0B07F' },
  { id: 'C4', cor: '#C3A77F' },
];

export const clareamento = {
  consultorio: {
    nome: 'Clareamento de consultório',
    tonsMin: 2,
    tonsMax: 4,
    tempo: 'Em média, 1 a 3 sessões de 45 a 60 minutos.',
    obs: 'Aplicado e supervisionado pela equipe, com proteção da gengiva.',
  },
  caseiro: {
    nome: 'Clareamento caseiro supervisionado',
    tonsMin: 1,
    tonsMax: 3,
    tempo: 'Em média, 2 a 3 semanas com moldeiras sob medida.',
    obs: 'Feito em casa, com gel de menor concentração e retornos de acompanhamento.',
  },
  aviso:
    'Simulação ilustrativa, feita com uma escala de referência. A cor real na tela varia, e o resultado do clareamento depende de cada pessoa, da cor original e da saúde dos dentes. Restaurações e coroas não mudam de cor. A indicação e a técnica são definidas na avaliação.',
};

// ───────────────────────────── Comparadores ─────────────────────────────
export interface ComparadorLinha {
  id: string;
  label: string;
  /** true = mostra pontos de 1 a 5 além do texto. */
  nota?: boolean;
}
export interface Comparador {
  id: string;
  titulo: string;
  pergunta: string;
  criterios: ComparadorLinha[];
  itens: { nome: string; slug?: string; valores: Record<string, { nota?: number; texto: string }> }[];
}

export const comparadores: Record<string, Comparador> = {
  'dente-ausente': {
    id: 'dente-ausente',
    titulo: 'Dente ausente',
    pergunta: 'Implante, ponte ou prótese removível?',
    criterios: [
      { id: 'durabilidade', label: 'Durabilidade', nota: true },
      { id: 'conforto', label: 'Conforto', nota: true },
      { id: 'estetica', label: 'Estética', nota: true },
      { id: 'tempo', label: 'Tempo de tratamento' },
      { id: 'manutencao', label: 'Manutenção' },
    ],
    itens: [
      {
        nome: 'Implante',
        slug: 'implantes-dentarios',
        valores: {
          durabilidade: { nota: 4, texto: 'Costuma durar muitos anos com acompanhamento' },
          conforto: { nota: 5, texto: 'Fixo, sem remover' },
          estetica: { nota: 5, texto: 'Pode ficar bastante natural' },
          tempo: { texto: 'Em média 4 a 8 meses' },
          manutencao: { texto: 'Higiene criteriosa e retornos periódicos' },
        },
      },
      {
        nome: 'Ponte fixa',
        valores: {
          durabilidade: { nota: 3, texto: 'Depende da saúde dos dentes de apoio' },
          conforto: { nota: 4, texto: 'Fixa, sem remover' },
          estetica: { nota: 4, texto: 'Boa em muitos casos' },
          tempo: { texto: 'Em média 2 a 4 semanas' },
          manutencao: { texto: 'Higiene especial sob a ponte' },
        },
      },
      {
        nome: 'Prótese removível',
        valores: {
          durabilidade: { nota: 2, texto: 'Requer ajustes e trocas ao longo do tempo' },
          conforto: { nota: 3, texto: 'Removível, com adaptação' },
          estetica: { nota: 3, texto: 'Varia conforme o tipo de fixação' },
          tempo: { texto: 'Em média 2 a 6 semanas' },
          manutencao: { texto: 'Remover para higienizar; ajustes periódicos' },
        },
      },
    ],
  },
  estetica: {
    id: 'estetica',
    titulo: 'Estética do sorriso',
    pergunta: 'Lentes, facetas ou clareamento?',
    criterios: [
      { id: 'mudanca', label: 'O que modifica' },
      { id: 'conforto', label: 'Conforto', nota: true },
      { id: 'durabilidade', label: 'Durabilidade', nota: true },
      { id: 'tempo', label: 'Tempo de tratamento' },
      { id: 'manutencao', label: 'Manutenção' },
    ],
    itens: [
      {
        nome: 'Lentes de contato dental',
        slug: 'lentes-de-contato-dental',
        valores: {
          mudanca: { texto: 'Cor, formato e pequenas irregularidades' },
          conforto: { nota: 4, texto: 'Procedimento planejado, em etapas' },
          durabilidade: { nota: 4, texto: 'Depende de mordida e cuidados' },
          tempo: { texto: 'Em média 3 a 6 semanas' },
          manutencao: { texto: 'Higiene e revisões periódicas' },
        },
      },
      {
        nome: 'Facetas e restaurações',
        slug: 'facetas-de-porcelana',
        valores: {
          mudanca: { texto: 'Forma, cor, pequenas fraturas e espaços' },
          conforto: { nota: 4, texto: 'Em resina, pode ser feito em poucas consultas' },
          durabilidade: { nota: 3, texto: 'Varia conforme o material' },
          tempo: { texto: 'Em média 1 a 4 semanas' },
          manutencao: { texto: 'Polimento e revisão periódicos' },
        },
      },
      {
        nome: 'Clareamento',
        slug: 'clareamento-dental',
        valores: {
          mudanca: { texto: 'Apenas a cor dos dentes naturais' },
          conforto: { nota: 3, texto: 'Pode haver sensibilidade passageira' },
          durabilidade: { nota: 2, texto: 'Pode exigir retoques' },
          tempo: { texto: 'Em média 1 a 3 semanas' },
          manutencao: { texto: 'Cuidado com alimentos que pigmentam' },
        },
      },
    ],
  },
  ortodontia: {
    id: 'ortodontia',
    titulo: 'Ortodontia',
    pergunta: 'Aparelho fixo ou alinhadores?',
    criterios: [
      { id: 'discricao', label: 'Discrição', nota: true },
      { id: 'conforto', label: 'Conforto', nota: true },
      { id: 'indicacao', label: 'Abrangência de casos', nota: true },
      { id: 'tempo', label: 'Tempo de tratamento' },
      { id: 'manutencao', label: 'Manutenção' },
    ],
    itens: [
      {
        nome: 'Aparelho fixo',
        slug: 'aparelho-ortodontico-fixo',
        valores: {
          discricao: { nota: 3, texto: 'Há versões estéticas' },
          conforto: { nota: 3, texto: 'Adaptação nos primeiros dias' },
          indicacao: { nota: 5, texto: 'Indicado em muitos tipos de caso' },
          tempo: { texto: 'Em média 18 a 30 meses' },
          manutencao: { texto: 'Ajustes mensais; higiene com acessórios' },
        },
      },
      {
        nome: 'Alinhadores transparentes',
        slug: 'alinhadores-transparentes',
        valores: {
          discricao: { nota: 5, texto: 'Placas transparentes' },
          conforto: { nota: 4, texto: 'Removíveis para comer e higienizar' },
          indicacao: { nota: 3, texto: 'Casos mais complexos podem exigir outra técnica' },
          tempo: { texto: 'Em média 6 a 18 meses' },
          manutencao: { texto: 'Uso diário disciplinado e retornos' },
        },
      },
    ],
  },
};

export const aviso = {
  clinico: 'A indicação final depende de avaliação clínica individual. Os conteúdos deste site têm caráter informativo e não substituem uma consulta.',
  ilustrativo: 'Imagem ilustrativa. Resultados variam de acordo com cada caso.',
};

// ───────────────────────────── Parcelamento (só com flags.mostrarValores) ─────────────────────────────
export const parcelamento = {
  parcelasMax: 12,
  /** Juros mensais em %, 0 = sem juros. */
  jurosMensal: 0,
  /** Parcela mínima em reais. */
  parcelaMinima: 100,
  aviso: 'Simulação sem valor de oferta. As condições de pagamento são definidas pela clínica após a avaliação.',
};
