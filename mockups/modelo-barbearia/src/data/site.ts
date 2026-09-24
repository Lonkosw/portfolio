/**
 * Conteúdo do MODELO BARBEARIA — segundo nicho da pasta, esqueleto curto
 * (herdado do Modelo A do salão, ver `mockups/README.md`).
 *
 * ══════════════════════════════════════════════════════════════════════
 * ISTO NÃO É O SITE DE NENHUMA BARBEARIA
 * ══════════════════════════════════════════════════════════════════════
 * É a peça que vai no primeiro contato frio: "olha o tipo de site que eu
 * faço". O nome, os textos e as fotos são demonstrativos. Quando um lead
 * demonstrar interesse de verdade, aí sim nasce um mockup com o nome, as
 * fotos e as cores DELE — e é esse que vira `mockup-lead-N`.
 *
 * ⚠️ O WHATSAPP AINDA É PLACEHOLDER. Num modelo demonstrativo os botões
 * devem cair na conversa com o Théo, não numa barbearia que não existe —
 * quem clicar em "agendar" está, na prática, pedindo orçamento de site.
 * Trocar `whatsapp` pelo número real antes de disparar.
 */

export const site = {
  nome: 'Ferro',
  nomeCompleto: 'Barbearia Ferro',
  tagline: 'Modelo de site para barbearia.',
  descricao:
    'Modelo demonstrativo de site para barbearia: corte, barba e navalha, com agendamento pelo WhatsApp.',
  cidade: 'Sua cidade',
  estado: 'PR',

  /** ⚠️ PLACEHOLDER — trocar pelo WhatsApp do Théo antes de mandar. */
  whatsapp: '5544000000000',
  whatsappExibicao: '(00) 00000-0000',
  telefone: '5544000000000',
  telefoneExibicao: '(00) 0000-0000',

  instagram: 'https://www.instagram.com/',
  instagramExibicao: '@suabarbearia',

  endereco: 'Rua da sua barbearia, 000 — Centro',
  maps: 'https://www.google.com/maps',

  /**
   * Fica `true` para sempre neste arquivo. Um modelo demonstrativo com
   * foto de banco NUNCA pode ir para a busca nem perder a faixa de aviso:
   * viraria um site que mente sobre ser a barbearia de alguém.
   */
  demo: true,
} as const;

/**
 * Sem "Antes e depois" nesta versão: banco de imagem de barba/corte tem
 * fartura, mas não achei par verificável (mesmo cliente, mesmo dia) que
 * passasse no critério usado no salão — ver `comparador-so-com-pares-de-verdade`.
 * Em vez de forçar um par fraco, a seção não entra, e o nav aponta só
 * para o que existe de fato: vídeos, trabalhos e serviços.
 */
export const nav = [
  { label: 'Vídeos', href: '#videos' },
  { label: 'Trabalhos', href: '#portfolio' },
  { label: 'Serviços', href: '#servicos' },
] as const;

export const hero = {
  eyebrow: 'Barbearia',
  titulo: ['A sua', 'barbearia,', 'no ar'],
  texto:
    'Este é um modelo de site para barbearia. No seu, entram o seu nome, as suas fotos e as suas cores — com agendamento direto pelo WhatsApp.',
  cta: 'Quero um site assim',
  ctaSecundario: 'Ver o modelo inteiro',
  imagem: 'hero-barbeiro-avental',
  alt: 'Barbeiro de avental vermelho cortando o cabelo de um cliente em barbearia de ambiente escuro',
} as const;

/* ── VÍDEOS ──────────────────────────────────────────────────────────── */

/**
 * ⚠️ O PÔSTER NÃO É UM QUADRO REAL DO VÍDEO. Nos outros mockups da pasta o
 * pôster sai do próprio arquivo de vídeo (frame extraído); aqui isso não foi
 * possível — sem acesso a ferramenta de vídeo neste ambiente — e a saída foi
 * usar uma FOTO do mesmo assunto (corte/barba) como capa. Se algum dia
 * `ffmpeg` estiver disponível, o correto é extrair o frame de verdade e
 * substituir.
 *
 * ⚠️ CAIXA LARGA (16:9), não vertical como no modelo do salão. O acervo de
 * antes era recorte de story do Instagram, vertical. Este é vídeo de banco,
 * filmado horizontal — forçar 9:16 aqui cortaria a cena pela metade.
 */
export const videos = {
  eyebrow: 'Em movimento',
  titulo: 'Vídeo também cabe',
  texto:
    'Dois blocos de vídeo, que só baixam quando a pessoa toca — o site continua leve para quem está no 4G.',
  largura: 16,
  altura: 9,
  itens: [
    {
      id: 'corte',
      arquivo: '/video/video-corte.mp4',
      poster: 'corte-maquina-pb',
      titulo: 'Corte na máquina',
      texto: 'Acabamento e contorno, do início ao fim.',
      alt: 'Vídeo de corte de cabelo masculino sendo feito com máquina em barbearia',
    },
    {
      id: 'barba',
      arquivo: '/video/video-barba.mp4',
      poster: 'navalha-toalha-quente',
      titulo: 'Barba',
      texto: 'Aparo e desenho da barba, com atenção ao detalhe.',
      alt: 'Vídeo de barbeiro aparando a barba de um cliente',
    },
  ],
} as const;

/* ── PORTFÓLIO ───────────────────────────────────────────────────────── */

/**
 * 12 fotos, alternando CORTE / BARBA / AMBIENTE em vez de agrupar por tipo
 * — mesmo raciocínio do salão: quatro cortes seguidos leem como "só cortam
 * cabelo"; alternado, a grade mostra corte, barba e o espaço em si.
 */
export const portfolio = {
  eyebrow: 'Trabalhos',
  titulo: 'A galeria da sua barbearia',
  texto: 'Corte, barba e o ambiente na mesma grade. Aqui entram as fotos do seu Instagram.',
  fotos: [
    { imagem: 'corte-penteado-espelho', alt: 'Barbeiro penteando o cabelo de um cliente, refletido no espelho iluminado' },
    { imagem: 'barba-ruiva-tesoura', alt: 'Barbeiro aparando barba ruiva com tesoura, em ambiente escuro' },
    { imagem: 'ambiente-tijolo-neon', alt: 'Interior de barbearia com parede de tijolo aparente e letreiro de neon' },
    { imagem: 'corte-maquina-pb', alt: 'Cliente tendo o cabelo cortado com máquina, foto em preto e branco' },
    { imagem: 'barba-tesoura-detalhe', alt: 'Detalhe de barbeiro aparando a barba de um cliente com tesoura' },
    { imagem: 'ambiente-fachada-vintage', alt: 'Fachada vintage de barbearia com poste giratório tradicional' },
    { imagem: 'corte-grupo-atendimento', alt: 'Dois clientes sendo atendidos ao mesmo tempo em barbearia' },
    { imagem: 'barba-navalha-relogio', alt: 'Barbeiro fazendo acabamento de barba com navalha' },
    { imagem: 'ambiente-newspaper-espera', alt: 'Cliente esperando sentado na cadeira de barbeiro, lendo o celular' },
    { imagem: 'corte-detalhe-grisalho', alt: 'Barbeiro finalizando corte de cliente grisalho com máquina e pente' },
    { imagem: 'navalha-toalha-quente', alt: 'Barbeiro fazendo acabamento com navalha e toalha quente' },
    { imagem: 'ambiente-pentes', alt: 'Pentes de barbeiro coloridos organizados lado a lado' },
  ],
} as const;

/* ── SERVIÇOS ────────────────────────────────────────────────────────── */

/**
 * ⚠️ SEM PREÇO, pelo mesmo motivo do salão: corte e barba variam com o
 * comprimento e a técnica, e preço publicado gera a pior conversa que existe
 * ("mas no site tava escrito..."). Cada cartão abre o WhatsApp com o
 * serviço já escrito.
 */
export const servicos = {
  eyebrow: 'Serviços',
  titulo: 'Os serviços, um a um',
  texto:
    'Cada cartão abre a conversa no WhatsApp com o serviço já escrito — o cliente não precisa explicar o que quer duas vezes.',
  itens: [
    {
      id: 'corte',
      nome: 'Corte',
      texto: 'Corte na máquina ou na tesoura, com risco e acabamento na régua.',
      imagem: 'corte-penteado-espelho',
      alt: 'Barbeiro penteando o cabelo de um cliente diante do espelho',
    },
    {
      id: 'barba',
      nome: 'Barba',
      texto: 'Aparo, desenho e alinhamento, do bigode ao contorno.',
      imagem: 'barba-tesoura-detalhe',
      alt: 'Barbeiro aparando a barba de um cliente com tesoura',
    },
    {
      id: 'navalha',
      nome: 'Navalha e acabamento',
      texto: 'Acabamento na navalha com toalha quente, no estilo clássico.',
      imagem: 'navalha-toalha-quente',
      alt: 'Barbeiro fazendo acabamento com navalha e toalha quente no rosto do cliente',
    },
    {
      id: 'infantil',
      nome: 'Corte infantil',
      texto: 'Atendimento com paciência para os pequenos, do jeito que a família pedir.',
      imagem: 'corte-infantil',
      alt: 'Menino sendo atendido por um barbeiro, tendo o cabelo cortado com máquina',
    },
  ],
  mensagem: 'Olá! Vi o modelo de site e queria saber mais.',
  cta: 'Falar no WhatsApp',
} as const;

/* ── SOBRE ───────────────────────────────────────────────────────────── */

export const sobre = {
  eyebrow: 'A barbearia',
  titulo: 'A sua história entra aqui',
  paragrafos: [
    'Este bloco é onde a barbearia se apresenta: há quanto tempo existe, quem são os barbeiros, o que faz diferente. É o pedaço que nenhum concorrente consegue copiar, porque é o único que fala de você.',
    'No modelo, ele está preenchido com texto de exemplo. No seu site, entra o que você contar na conversa — e só o que for verdade.',
  ],
  destaques: [
    { rotulo: 'Onde', texto: 'O endereço da sua barbearia' },
    { rotulo: 'O que', texto: 'Corte, barba e navalha' },
    { rotulo: 'Como', texto: 'Horário e agendamento pelo WhatsApp' },
  ],
  imagem: 'sobre-barbeiro-cadeira',
  alt: 'Barbeiro em pé ao lado da cadeira de atendimento, em ambiente de barbearia',
} as const;

export const contato = {
  eyebrow: 'Contato',
  titulo: 'Quer um site assim?',
  texto:
    'Este modelo vira o site da sua barbearia com o seu nome, as suas fotos e as suas cores. Chame no WhatsApp e eu monto uma prévia com a cara do seu negócio.',
  mensagem: 'Olá! Vi o modelo de site e queria uma prévia com a cara da minha barbearia.',
} as const;

export const og = {
  imagem: 'hero-barbeiro-avental',
} as const;
