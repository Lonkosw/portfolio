/**
 * Conteúdo do MODELO A — o mockup curto (6 seções).
 *
 * ══════════════════════════════════════════════════════════════════════
 * ISTO NÃO É O SITE DE NENHUM SALÃO
 * ══════════════════════════════════════════════════════════════════════
 * É a peça que vai no primeiro contato frio: "olha o tipo de site que eu
 * faço". O nome, os textos e as fotos são demonstrativos. Quando um lead
 * demonstrar interesse de verdade, aí sim nasce um mockup com o nome, as
 * fotos e as cores DELE — e é esse que vira `mockup-lead-N`.
 *
 * Por isso o nome é fictício e a faixa do topo diz isso em voz alta. O erro
 * a evitar é o oposto: mandar para um salão um site com o nome de OUTRO
 * salão real estampado, que é o que aconteceria reaproveitando o site do
 * Claus direto.
 *
 * ⚠️ O WHATSAPP AINDA É PLACEHOLDER. Num modelo demonstrativo os botões
 * devem cair na conversa com o Théo, não num salão que não existe — quem
 * clicar em "agendar" está, na prática, pedindo orçamento de site. Trocar
 * `whatsapp` pelo número real antes de disparar.
 */

export const site = {
  nome: 'Aurora',
  nomeCompleto: 'Studio Aurora',
  tagline: 'Modelo de site para salão de beleza.',
  descricao:
    'Modelo demonstrativo de site para salão de beleza: coloração e mechas, corte, penteado, maquiagem e unhas, com agendamento pelo WhatsApp.',
  cidade: 'Sua cidade',
  estado: 'PR',

  /** ⚠️ PLACEHOLDER — trocar pelo WhatsApp do Théo antes de mandar. */
  whatsapp: '5544000000000',
  whatsappExibicao: '(00) 00000-0000',
  telefone: '5544000000000',
  telefoneExibicao: '(00) 0000-0000',

  instagram: 'https://www.instagram.com/',
  instagramExibicao: '@seusalao',

  endereco: 'Rua do seu salão, 000 — Centro',
  maps: 'https://www.google.com/maps',

  /**
   * Fica `true` para sempre neste arquivo. Um modelo demonstrativo com
   * foto de banco NUNCA pode ir para a busca nem perder a faixa de aviso:
   * viraria um site que mente sobre ser o salão de alguém.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'Antes e depois', href: '#antes-depois' },
  { label: 'Trabalhos', href: '#portfolio' },
  { label: 'Serviços', href: '#servicos' },
] as const;

export const hero = {
  eyebrow: 'Salão de beleza',
  titulo: ['O seu', 'salão,', 'no ar'],
  texto:
    'Este é um modelo de site para salão. No seu, entram o seu nome, as suas fotos e as suas cores — com agendamento direto pelo WhatsApp.',
  cta: 'Quero um site assim',
  ctaSecundario: 'Ver o modelo inteiro',
  imagem: 'hero-ondas-luz',
  alt: 'Cabelo ondulado iluminado por luz de neon em ambiente escuro',
} as const;

/* ── ANTES E DEPOIS ──────────────────────────────────────────────────── */

/**
 * O comparador arrastável — o recurso que mais impressiona quem recebe o
 * link, porque quase nenhum site de salão tem.
 *
 * ⚠️ UM PAR SÓ, E ELE É REAL. As duas fotos são da mesma modelo, na mesma
 * sessão, uma com o cabelo sendo penteado e outra finalizado. Banco de
 * imagem não tem par antes/depois — este saiu de uma série do mesmo ensaio
 * (ver `mockups/processar-midias.py`). Foi a única forma de ter a seção sem
 * fingir que duas pessoas diferentes são a mesma.
 *
 * O texto assume o que a peça é: um modelo. Em vez de vender a
 * transformação (que é discreta, e não é de nenhum cliente meu), ele mostra
 * o RECURSO e convida o dono do salão a imaginar os trabalhos dele ali. É
 * mais honesto e vende melhor.
 */
export const antesDepois = {
  eyebrow: 'Antes e depois',
  titulo: 'Arraste e veja a diferença',
  texto:
    'É aqui que entram os seus antes e depois: a cliente arrasta a linha e vê a transformação inteira, sem sair do site. A foto abaixo é ilustrativa — no seu site, são os seus trabalhos.',
  dica: 'Arraste a alça — ou use as setas do teclado.',
  pares: [
    {
      antes: 'antes-ruivo',
      depois: 'depois-ruivo',
      titulo: 'Finalização',
      texto:
        'Mesma cliente, mesma sessão: o cabelo sendo desembaraçado e, depois, finalizado com movimento e brilho.',
      antesAlt: 'Cabelo ruivo liso sendo penteado com pente de madeira',
      depoisAlt: 'O mesmo cabelo ruivo depois, finalizado e com movimento',
    },
  ],
} as const;

/* ── VÍDEOS ──────────────────────────────────────────────────────────── */

export const videos = {
  eyebrow: 'Em movimento',
  titulo: 'Vídeo também cabe',
  texto:
    'Dois blocos de vídeo, que só baixam quando a pessoa toca — o site continua leve para quem está no 4G.',
  largura: 720,
  altura: 1280,
  itens: [
    {
      id: 'cuidado',
      arquivo: '/video/video-cuidado.mp4',
      poster: 'video-cuidado-poster',
      titulo: 'Cuidado com o fio',
      texto: 'Tratamento sendo aplicado, do começo ao fim.',
      alt: 'Vídeo de tratamento capilar sendo aplicado em salão',
    },
    {
      id: 'finalizacao',
      arquivo: '/video/video-finalizacao.mp4',
      poster: 'video-finalizacao-poster',
      titulo: 'Finalização',
      texto: 'O acabamento que a cliente leva para casa.',
      alt: 'Vídeo de finalização de cabelo em salão',
    },
  ],
} as const;

/* ── PORTFÓLIO ───────────────────────────────────────────────────────── */

/**
 * São 12, e o número não é acaso: fecha linha certa nas duas larguras que
 * importam — 6 fileiras de 2 no celular, 4 fileiras de 3 no desktop. Com 11
 * ou 13 sobra buraco no fim da grade.
 *
 * A ORDEM ALTERNA os quatro serviços em vez de agrupar por tipo. Quatro
 * fotos de cabelo em sequência leem como "só fazem cabelo"; alternadas, a
 * mesma grade diz que o salão faz cabelo, maquiagem e unha.
 */
export const portfolio = {
  eyebrow: 'Trabalhos',
  titulo: 'A galeria do seu salão',
  texto: 'Cabelo, maquiagem e unhas na mesma grade. Aqui entram as fotos do seu Instagram.',
  fotos: [
    { imagem: 'cachos-castanhos', alt: 'Cabelo castanho com cachos definidos, em salão' },
    { imagem: 'maquiagem-batom', alt: 'Maquiadora aplicando batom em cliente' },
    { imagem: 'unhas-onca', alt: 'Unhas com esmaltação preta e desenho de onça' },
    { imagem: 'ondas-volumosas', alt: 'Cabelo escuro com ondas volumosas' },
    { imagem: 'paleta-sombras', alt: 'Paleta de sombras sendo usada durante a maquiagem' },
    { imagem: 'unhas-nude', alt: 'Unhas curtas com esmaltação nude' },
    { imagem: 'liso-franja', alt: 'Cabelo liso escuro com franja, finalizado em salão' },
    { imagem: 'ruivo-finalizado', alt: 'Cabelo ruivo finalizado com ondas' },
    { imagem: 'unhas-rosa', alt: 'Unhas com esmaltação rosa e anel dourado' },
    { imagem: 'loira-espelho', alt: 'Cliente loira diante do espelho do salão' },
    { imagem: 'ondas-medias', alt: 'Cabelo com ondas na altura dos ombros' },
    { imagem: 'castanho-costas', alt: 'Cabelo castanho na altura dos ombros, visto de costas' },
  ],
} as const;

/* ── SERVIÇOS ────────────────────────────────────────────────────────── */

/**
 * ⚠️ SEM PREÇO. Num site de salão, preço publicado gera a pior conversa que
 * existe ("mas no site tava escrito..."), porque coloração depende do
 * comprimento e do histórico químico do cabelo. Cada cartão abre o WhatsApp
 * com o assunto já escrito.
 */
export const servicos = {
  eyebrow: 'Serviços',
  titulo: 'Os serviços, um a um',
  texto:
    'Cada cartão abre a conversa no WhatsApp com o assunto já escrito — a cliente não precisa explicar o que quer duas vezes.',
  itens: [
    {
      id: 'cor',
      nome: 'Cor e mechas',
      texto: 'Loiro, acobreado, morena iluminada, retoque de raiz e matização.',
      imagem: 'coloracao-mecha',
      alt: 'Mechas sendo aplicadas com papel alumínio',
    },
    {
      id: 'corte',
      nome: 'Corte e penteado',
      texto: 'Corte, escova e penteado preso para festa, formatura e casamento.',
      imagem: 'babyliss-ondas',
      alt: 'Cabelo sendo ondulado com modelador',
    },
    {
      id: 'maquiagem',
      nome: 'Maquiagem',
      texto: 'Maquiagem social para o dia ou para a noite, feita no salão.',
      imagem: 'maquiagem-batom',
      alt: 'Maquiadora aplicando batom em cliente',
    },
    {
      id: 'unhas',
      nome: 'Unhas',
      texto: 'Manicure e esmaltação, do nude discreto ao desenho de festa.',
      imagem: 'unhas-onca',
      alt: 'Unhas com esmaltação e desenho',
    },
  ],
  mensagem: 'Olá! Vi o modelo de site e queria saber mais.',
  cta: 'Falar no WhatsApp',
} as const;

/* ── SOBRE ───────────────────────────────────────────────────────────── */

export const sobre = {
  eyebrow: 'O salão',
  titulo: 'A sua história entra aqui',
  paragrafos: [
    'Este bloco é onde o salão se apresenta: há quanto tempo existe, quem é a equipe, o que faz diferente. É o pedaço que nenhum concorrente consegue copiar, porque é o único que fala de você.',
    'No modelo, ele está preenchido com texto de exemplo. No seu site, entra o que você contar na conversa — e só o que for verdade.',
  ],
  destaques: [
    { rotulo: 'Onde', texto: 'O endereço do seu salão' },
    { rotulo: 'O que', texto: 'Cabelo, maquiagem e unhas' },
    { rotulo: 'Como', texto: 'Horário e valor pelo WhatsApp' },
  ],
  imagem: 'salao-atendimento',
  alt: 'Profissional atendendo cliente em salão de beleza',
} as const;

export const contato = {
  eyebrow: 'Contato',
  titulo: 'Quer um site assim?',
  texto:
    'Este modelo vira o site do seu salão com o seu nome, as suas fotos e as suas cores. Chame no WhatsApp e eu monto uma prévia com a cara do seu salão.',
  mensagem: 'Olá! Vi o modelo de site e queria uma prévia com a cara do meu salão.',
} as const;

export const og = {
  imagem: 'hero-ondas-luz',
} as const;
