/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * ══════════════════════════════════════════════════════════════════════
 * REGRA DESTE ARQUIVO
 * ══════════════════════════════════════════════════════════════════════
 * Só entra o que dá para conferir nos canais públicos deles (Instagram
 * @anaemporiobistro e @chefanadaleffe, e a matéria de turismo). Nada de
 * preço, prêmio, avaliação ou tempo de casa inventado.
 *
 * Tudo que está marcado com ⚠️ CONFERIR foi lido de uma imagem de post e
 * PODE ESTAR DESATUALIZADO — preço de restaurante muda, dia de festival
 * muda. Confirme antes de mandar o link para eles.
 *
 * Ver a tabela "o que é real e o que não é" no README.md.
 */

export const site = {
  nome: 'Ana Empório Bistrô',
  nomeCurto: 'Ana Bistrô',
  chef: 'Ana Paula Daleffe',
  /** Assinatura curta, como ela aparece no avental e nas artes. */
  chefAssinatura: 'Chef Ana Daleffe',
  tagline: 'A cozinha como quem recebe em casa.',
  descricao:
    'Bistrô e empório em Campo Mourão — PR. Cozinha autoral da chef Ana Paula Daleffe, com menu experiência, festivais e uma carta pensada prato a prato.',
  cidade: 'Campo Mourão',
  estado: 'PR',

  /**
   * ⚠️ CONFERIR — NÃO TENHO o telefone nem o endereço deles.
   * Os campos abaixo são PLACEHOLDER e precisam ser preenchidos antes de
   * qualquer envio. O site inteiro monta os links de reserva a partir daqui.
   */
  whatsapp: '5544000000000',
  whatsappExibicao: '(44) 0000-0000',
  endereco: 'Endereço a confirmar',
  bairro: 'Campo Mourão',

  instagram: 'https://www.instagram.com/anaemporiobistro',
  instagramExibicao: '@anaemporiobistro',
  instagramChef: 'https://www.instagram.com/chefanadaleffe',
  instagramChefExibicao: '@chefanadaleffe',

  /**
   * ⚠️ CONFERIR — horários não confirmados. Deixados genéricos de
   * propósito: é melhor não dizer do que dizer errado e a pessoa chegar
   * na porta fechada.
   */
  horarios: [
    { dias: 'Terça a sábado', horas: 'Almoço e jantar' },
    { dias: 'Domingo', horas: 'Almoço' },
  ],

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no
   * rodapé, <meta name="robots" content="noindex, nofollow"> e aviso no
   * robots.txt. Virar false só se o restaurante contratar.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'A casa', href: '#casa' },
  { label: 'A chef', href: '#chef' },
  { label: 'A cozinha', href: '#cozinha' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Reservar', href: '#reservar' },
] as const;

export const hero = {
  eyebrow: 'Bistrô e empório · Campo Mourão — PR',
  /* Uma linha por <span>: é o que permite a entrada linha a linha sem
     plugin de split. Mexeu aqui? A animação acompanha sozinha. */
  titulo: ['Ana', 'Empório', 'Bistrô'],
  texto:
    'Uma casa pequena onde cada prato passa pela mão da chef. Cozinha autoral, produto de estação e uma carta que muda quando o mercado muda.',
  cta: 'Reservar uma mesa',
  ctaSecundario: 'Ver o cardápio',
  imagem: 'casa-salao',
  alt: 'Salão do Ana Empório Bistrô à noite, com luminárias âmbar e parede de pratos antigos',
} as const;

/** Faixa rolante. Só o que eles de fato oferecem. */
export const marquee = [
  'Menu experiência',
  'Cozinha autoral',
  'Carta de vinhos',
  'Massas artesanais',
  'Produto de estação',
  'Empório',
  'Eventos privados',
] as const;

/* ── A CASA ──────────────────────────────────────────────────────────── */

export const casa = {
  eyebrow: 'A casa',
  titulo: 'Um endereço que vale o desvio',
  paragrafos: [
    'O Ana Empório Bistrô nasceu da ideia de que uma cidade do interior não precisa pedir licença para ter cozinha de verdade. São poucas mesas, luz baixa e uma parede de pratos antigos que a chef foi juntando ao longo dos anos.',
    'Cada serviço é conduzido como um jantar em casa: o tempo entre um prato e outro é escolhido, não sofrido. Quem senta aqui não está com pressa.',
  ],
  /**
   * Frase da matéria de turismo publicada sobre a casa. É citação real —
   * o título do artigo. ⚠️ CONFERIR o nome do veículo antes de publicar.
   */
  citacao: 'O restaurante que faz Campo Mourão valer o desvio da rota',
  citacaoFonte: 'Matéria publicada sobre a casa',
  imagem: 'casa-mesa',
  alt: 'Mesa posta com toalha xadrez, taças de cristal e guardanapo lacrado com selo de cera',
} as const;

/* ── A CHEF ──────────────────────────────────────────────────────────── */

/**
 * Sem foto de propósito.
 *
 * As fotos da chef são o ativo mais forte que eles têm, e são dela — não
 * vou preencher com foto genérica de banco, e muito menos gerar um rosto
 * de IA que fingiria ser ela. O bloco é resolvido em tipografia, o que
 * funciona sozinho, e o espaço para o retrato está reservado e marcado no
 * README.
 */
export const chef = {
  eyebrow: 'A chef',
  nome: 'Ana Paula Daleffe',
  titulo: 'Formação lá fora, mão daqui',
  paragrafos: [
    'A chef Ana Paula Daleffe estudou cozinha clássica fora do Brasil e voltou para Campo Mourão em vez de ficar. É essa decisão que explica a casa: técnica de escola europeia aplicada ao que se planta e se cria aqui em volta.',
    'Ela cozinha, atende as mesas e assina o menu. Não há chef executivo por trás de um nome na fachada — quem está na cozinha é quem está na placa.',
  ],
  /**
   * ⚠️ CONFERIR — os destaques do Instagram dela citam Paris, Genebra,
   * Suíça e uma escola de gastronomia. Os detalhes exatos (nome da escola,
   * anos, títulos) NÃO foram confirmados e por isso não estão no site.
   * Peça a ela a formação correta antes de publicar qualquer linha do
   * tempo — errar a escola de um chef é o tipo de erro que queima.
   */
  marcos: [
    { rotulo: 'Formação', texto: 'Cozinha clássica na Europa' },
    { rotulo: 'Base', texto: 'Campo Mourão, Paraná' },
    { rotulo: 'No comando', texto: 'Menu, cozinha e salão' },
  ],
  assinatura: 'Ana Daleffe',
} as const;

/* ── A COZINHA ───────────────────────────────────────────────────────── */

export const cozinha = {
  eyebrow: 'A cozinha',
  titulo: 'Poucos pratos, feitos como se deve',
  texto:
    'A carta é curta por escolha. Cada prato fica no menu enquanto o produto estiver bom — e sai quando deixa de estar.',
  pratos: [
    {
      imagem: 'prato-risoto',
      nome: 'Risoto de açafrão',
      texto: 'Arroz carnaroli, açafrão em pistilo e lascas de trufa negra.',
      alt: 'Risoto de açafrão com lascas de trufa negra em prato escuro',
    },
    {
      imagem: 'prato-mignon',
      nome: 'Mignon ao vinho',
      texto: 'Medalhão selado, redução de vinho tinto e legumes assados.',
      alt: 'Medalhão de filé mignon com redução de vinho tinto e legumes assados',
    },
    {
      imagem: 'prato-massa',
      nome: 'Massa fresca',
      texto: 'Tagliatelle aberto na casa, todos os dias, com ovo caipira.',
      alt: 'Ninho de tagliatelle fresco sendo erguido com um garfo sobre tábua de madeira',
    },
  ],
} as const;

/* ── CARDÁPIO ────────────────────────────────────────────────────────── */

/**
 * ⚠️ CONFERIR — TODOS OS PREÇOS E PRATOS DESTA SEÇÃO SÃO EXEMPLO.
 *
 * O único preço que apareceu num post foi o da feijoada (R$ 89 com reserva
 * antecipada / R$ 98 sem), e mesmo esse pode ter mudado. O resto é
 * ESTRUTURA DE DEMONSTRAÇÃO: serve para a chef ver como o cardápio dela
 * ficaria no site, não para informar cliente nenhum.
 *
 * Antes de publicar: substituir por uma carta real, ou remover os preços e
 * deixar só os nomes. Cardápio errado no ar é pior do que não ter cardápio.
 */
export const cardapio = {
  eyebrow: 'Cardápio',
  titulo: 'A carta',
  texto:
    'Uma amostra do que costuma estar na casa. A carta completa muda com a estação — e é sempre a chef quem decide o que entra.',
  aviso:
    'Esta é uma carta de demonstração. Preços e pratos precisam ser confirmados com o restaurante.',
  secoes: [
    {
      nome: 'Para começar',
      itens: [
        { nome: 'Burrata com tomates da estação', texto: 'Azeite verde, manjericão e pão de fermentação natural', preco: '68' },
        { nome: 'Carpaccio de mignon', texto: 'Alcaparras, parmesão de 24 meses e mostarda antiga', preco: '72' },
        { nome: 'Polvo grelhado', texto: 'Purê de batata-baroa e páprica defumada', preco: '96' },
      ],
    },
    {
      nome: 'Massas',
      itens: [
        { nome: 'Tagliatelle ao ragu', texto: 'Massa aberta na casa, ragu de cozimento longo', preco: '89' },
        { nome: 'Ravióli de queijo da serra', texto: 'Manteiga de sálvia e nozes tostadas', preco: '92' },
        { nome: 'Risoto de açafrão e trufa', texto: 'Carnaroli, açafrão em pistilo, lascas de trufa negra', preco: '118' },
      ],
    },
    {
      nome: 'Principais',
      itens: [
        { nome: 'Mignon ao vinho tinto', texto: 'Redução de vinho, legumes assados e batata confitada', preco: '134' },
        { nome: 'Peixe do dia', texto: 'Conforme a chegada do mercado — pergunte ao salão', preco: '—' },
        { nome: 'Costela de cozimento longo', texto: 'Doze horas de forno baixo, purê rústico', preco: '126' },
      ],
    },
    {
      nome: 'Para terminar',
      itens: [
        { nome: 'Petit gâteau', texto: 'Chocolate 70% e sorvete de baunilha de verdade', preco: '42' },
        { nome: 'Tiramisù da casa', texto: 'Receita da chef, montado na hora', precoNota: 'porção para dois', preco: '54' },
      ],
    },
  ],
} as const;

/* ── AGENDA ──────────────────────────────────────────────────────────── */

/**
 * ⚠️ CONFERIR — lido de posts do Instagram. Dia da semana e preço de
 * festival mudam com frequência; confirme antes de publicar.
 */
export const agenda = {
  eyebrow: 'Na semana',
  titulo: 'Tem dia que a casa muda',
  texto:
    'Além da carta, alguns dias têm programa próprio. Vale reservar com antecedência — essas datas costumam lotar.',
  itens: [
    {
      dia: 'Sexta',
      nome: 'Festival do Mignon',
      texto: 'No jantar, o mignon ganha a carta inteira.',
    },
    {
      dia: 'Sábado',
      nome: 'Feijoada',
      texto: 'No almoço, feijoada completa da casa.',
      nota: 'R$ 89 com reserva antecipada · R$ 98 sem reserva',
    },
    {
      dia: 'Datas marcadas',
      nome: 'Menu Experiência',
      texto: 'Um menu fechado, servido em tempos, com data anunciada.',
    },
  ],
} as const;

/* ── RESERVA ─────────────────────────────────────────────────────────── */

export const reservar = {
  eyebrow: 'Reservar',
  titulo: 'Guarde a sua mesa',
  texto:
    'Diga quantas pessoas, o dia e o horário. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pelo WhatsApp',
  mensagem: 'Olá! Vim pelo site e gostaria de reservar uma mesa.',
  imagem: 'casa-mesa',
  alt: 'Mesa posta do bistrô à luz de vela',
  ocasioes: ['Jantar a dois', 'Aniversário', 'Almoço em família', 'Jantar de negócios', 'Só conhecer'],
  periodos: ['Almoço', 'Jantar'],
  /** Faixas em vez de horário cravado: ninguém sabe o minuto exato. */
  horarios: ['12h — 13h', '13h — 14h', '19h — 20h', '20h — 21h', '21h — 22h'],
  maxPessoas: 12,
} as const;

export const visite = {
  eyebrow: 'Visite',
  titulo: 'A casa espera por você',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site
 * vai ser mostrado. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'casa-salao',
} as const;
