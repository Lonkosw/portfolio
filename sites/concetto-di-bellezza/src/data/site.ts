/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * REGRA DESTE ARQUIVO: só entra o que dá para conferir nos canais públicos
 * deles (Instagram @concettodibellezzamaringa, o perfil no Google e os
 * destaques de story). Nada de prêmio, tempo de casa ou número de clientes
 * inventado.
 *
 * ⚠️ E NADA DE PREÇO. Os valores que circulam nos stories deles são de duas
 * naturezas, e as duas são armadilha para um site:
 *
 *   1. PROMO DO MÊS — "AGOSTO: corte R$167 nas segundas", "barbeiro R$100
 *      nas quartas". Vencem em semanas. Um site que ninguém atualiza vira
 *      mentira publicada;
 *   2. TABELA POR PROFISSIONAL — as unhas da Rai e da Alice saem 318/291,
 *      as da Dih saem 384/346. Publicar os dois lado a lado obriga a
 *      explicar por que uma custa mais, e essa não é conversa de site.
 *
 * Cada serviço abre o WhatsApp com o assunto já escrito. O preço sai de lá.
 *
 * Ver a tabela "o que é real e o que não é" no README.md.
 */

export const site = {
  nome: 'Concetto di Bellezza',
  /** Palavras deles, copiadas da descrição do próprio perfil no Google. */
  tagline: 'Ambiente acolhedor, atendimento humanizado.',
  /** A descrição também é deles, verbatim, do perfil no Google. */
  descricao:
    'Salão de beleza em Maringá especializado em coloração, cortes femininos e masculinos, manicure, pedicure e tratamentos. Ambiente acolhedor, atendimento humanizado, equipe capacitada e produtos profissionais.',
  cidade: 'Maringá',
  estado: 'PR',

  /* CONFERIDO no perfil do Google. O print do story tem o número tapado
     pela caixa de "responder", então o Google é a fonte aqui. */
  whatsapp: '5544991067953',
  whatsappExibicao: '(44) 99106-7953',
  instagram: 'https://www.instagram.com/concettodibellezzamaringa',
  instagramExibicao: '@concettodibellezzamaringa',

  endereco: 'R. Mathias de Albuquerque, 155a',
  bairro: 'Zona 03',
  cep: '87050-240',
  maps: 'https://www.google.com/maps/search/?api=1&query=Concetto+di+Bellezza+R.+Mathias+de+Albuquerque+155a+Zona+03+Maring%C3%A1+PR&query_place_id=ChIJL531Su_L8QERZcbLJdG8GdM',
  avaliacoesGoogle:
    'https://www.google.com/search?q=Concetto+di+Bellezza+-+Sal%C3%A3o+de+Beleza+Maring%C3%A1',

  /**
   * O ATIVO MAIS FORTE DELES, e por larga margem. Lido na página do perfil
   * do Google em 05/08/2026.
   *
   * ⚠️ Número muda. Conferir antes de publicar de verdade — um "166" que
   * virou 180 não é grave, mas um "5,0" que virou 4,9 é.
   */
  google: {
    nota: '5,0',
    avaliacoes: 166,
    lido: '5 de agosto de 2026',
  },

  /**
   * Horários do perfil do Google, dia a dia. A quarta destoa (abre mais
   * cedo e fecha mais cedo) — por isso ela tem linha própria em vez de ser
   * espremida num "segunda a sexta" que estaria errado.
   */
  horarios: [
    { dias: 'Segunda, terça, quinta e sexta', horas: '9h às 18h' },
    { dias: 'Quarta', horas: '8h às 16h30' },
    { dias: 'Sábado', horas: '9h às 16h' },
    { dias: 'Domingo', horas: 'Fechado' },
  ],

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no rodapé,
   * <meta name="robots" content="noindex, nofollow"> e aviso no robots.txt.
   * Virar false só se o salão contratar e este virar o site oficial.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'O espaço', href: '#espaco' },
  { label: 'Cabelo', href: '#cabelo' },
  { label: 'Antes e depois', href: '#antes-depois' },
  { label: 'Produção', href: '#producao' },
  { label: 'Unhas', href: '#unhas' },
  { label: 'Agendar', href: '#agendar' },
] as const;

export const hero = {
  eyebrow: 'Salão de beleza · Zona 03, Maringá — PR',
  titulo: ['Beleza não', 'se improvisa.'],
  texto:
    'Coloração, corte, produção para festa e unhas na Zona 03. Antes de mexer na cor, a gente lê o histórico do seu fio — porque o mesmo tom não se faz do mesmo jeito em quem já descoloriu e em quem nunca pintou.',
  cta: 'Agendar meu horário',
  ctaSecundario: 'Ver transformações',
  imagem: 'hero-loiro-letreiro',
  alt: 'Cabelo loiro iluminado com ondas, fotografado contra a parede verde do salão',
} as const;

export const marquee = [
  'Coloração',
  'Loiras e mechas',
  'Ruivo',
  'Morena iluminada',
  'Cachos definidos',
  'Corte feminino e masculino',
  'Escova',
  'Tranças',
  'Maquiagem',
  'Penteado',
  'Manicure e pedicure',
  'Alongamento de unhas',
  'Barba',
] as const;

/* ── O ESPAÇO ─────────────────────────────────────────────────────────── */

export const espaco = {
  eyebrow: 'O espaço',
  titulo: 'A parede verde que você já viu no Instagram',
  paragrafos: [
    'O Concetto di Bellezza fica na Rua Mathias de Albuquerque, na Zona 03. Lá dentro: espelhos recortados em onda com fita de LED correndo por baixo, cordas do teto ao chão, um sofá de couro verde e planta em cada canto. É o cenário de quase toda foto do perfil — e não é estúdio montado, é o salão mesmo.',
    'As quatro palavras abaixo não são slogan escrito por mim: são as que eles escolheram para se descrever no próprio perfil do Google.',
  ],
  /**
   * VERBATIM da descrição do Google deles: "Ambiente acolhedor, atendimento
   * humanizado, equipe capacitada e produtos profissionais."
   */
  valores: ['Acolhedor', 'Humanizado', 'Equipe capacitada', 'Produtos profissionais'],
  imagem: 'espaco-salao',
  alt: 'Salão do Concetto di Bellezza: parede verde, sofá de couro verde-musgo, espelhos ondulados e plantas',
  galeria: [
    {
      imagem: 'espaco-bancadas',
      alt: 'Bancada de atendimento com espelhos recortados em onda e fita de LED por baixo',
      legenda: 'Os espelhos em onda, com LED por baixo',
    },
    {
      imagem: 'espaco-lavatorios',
      alt: 'Área de lavatórios com parede verde, samambaias e divisória de cordas',
      legenda: 'A área de lavagem',
    },
    /* Sem legenda de propósito: o balcão de recepção com o letreiro atrás já
       diz o que é. Escrever "recepção" embaixo da foto da recepção é
       legendar o óbvio. */
    {
      imagem: 'espaco-recepcao',
      alt: 'Balcão de recepção arredondado com plantas e o letreiro Concetto di Bellezza ao fundo',
    },
  ],
} as const;

/**
 * Bloco de vídeo — MONTADO E VAZIO, de propósito.
 *
 * O vídeo do espaço ainda não chegou. Em vez de deixar a seção fora e ter de
 * remontá-la depois, ela está aqui inteira e funcionando: pôster, botão de
 * play, pausa automática com movimento reduzido e legenda.
 *
 * PARA LIGAR: ponha o arquivo em `public/video/` e escreva o nome em `src`
 * abaixo (ex.: `src: '/video/espaco.mp4'`). Nada mais precisa mudar — o
 * componente troca o cartaz pelo vídeo sozinho.
 */
export const video = {
  /** Vazio = mostra o pôster com o aviso. Preencher liga o vídeo. */
  src: '',
  poster: 'video-poster',
  alt: 'Vista ampla do salão: parede verde, espelhos ondulados e o sofá verde-musgo',
  legenda: 'Um passeio pelo salão',
  /** Só aparece enquanto `src` estiver vazio. Não vai ao ar com o vídeo. */
  avisoSemVideo: 'O vídeo do espaço entra aqui — o bloco já está pronto para receber.',
} as const;

/* ── PILAR 1 · CABELO ─────────────────────────────────────────────────── */

export const cabelo = {
  eyebrow: 'Pilar 1 · Cabelo',
  titulo: 'Loira, ruiva, morena iluminada, cacho definido',
  texto:
    'Coloração é o forte da casa — e é também o serviço que mais dá errado quando se pula etapa. Aqui a conversa começa pelo histórico: o que já foi feito no fio decide quantos tons dá para subir com segurança, e em quantas sessões.',
  itens: [
    {
      nome: 'Coloração e cobertura de brancos',
      texto: 'Mudança de tom, retoque de raiz e manutenção.',
    },
    {
      nome: 'Mechas, loiras e morena iluminada',
      texto: 'Balayage, luzes e reflexos lidos a partir do histórico do fio.',
    },
    {
      nome: 'Ruivo e tons vermelhos',
      texto: 'Do acobreado ao borgonha — a família de cor que eles mais postam.',
    },
    {
      nome: 'Corte feminino e masculino',
      texto: 'Corte, acabamento e finalização. Barba na barbearia da casa.',
    },
    {
      nome: 'Cachos e tratamento',
      texto: 'Definição, hidratação e reconstrução, inclusive pós-química.',
    },
    {
      nome: 'Escova e tranças',
      texto: 'Escova modelada e tranças — as duas com pacote fechado no salão.',
    },
  ],
  imagem: 'cabelo-ruivo-fogo',
  alt: 'Cabelo ruivo alaranjado vibrante, longo e com ondas nas pontas',
} as const;

/**
 * Carrossel de tipos de cabelo — um trabalho de cada tipo, lado a lado.
 *
 * Existe porque a lista de serviços é texto: "morena iluminada" e "balayage"
 * não significam nada para quem não é do ramo. Aqui a cliente aponta o que
 * quer e a mensagem sai pronta.
 *
 * ⚠️ REGRA DE OURO DESTA LISTA: o nome descreve A FOTO, não o serviço que a
 * gente gostaria de vender. Chamar de "morena iluminada" uma foto de loiro
 * platinado destrói a confiança na hora — e quem está escolhendo cabelo
 * repara na cor antes de ler qualquer coisa. Cada linha abaixo foi conferida
 * olhando a imagem processada, não o nome do arquivo original.
 *
 * Todas são 4:5 (o formato nativo do Instagram deles). Trocar por horizontal
 * quebra o alinhamento da fila inteira.
 */
export const tiposCabelo = {
  eyebrow: 'Escolha o seu',
  titulo: 'Qual desses é o cabelo que você quer?',
  texto:
    'Arraste para o lado. Ao tocar em um deles, o WhatsApp abre com o nome já escrito — sem precisar explicar por texto o que você quer.',
  itens: [
    {
      imagem: 'tipo-loiro-iluminado',
      nome: 'Loiro iluminado',
      texto: 'Raiz esfumada e ondas longas',
      alt: 'Cabelo loiro iluminado, longo e ondulado, com a raiz esfumada',
    },
    {
      imagem: 'tipo-loiro-mel',
      nome: 'Loiro mel',
      texto: 'Mechas claras sobre base dourada',
      alt: 'Cabelo loiro mel com mechas claras e ondas soltas',
    },
    {
      imagem: 'tipo-ruivo-claro',
      nome: 'Ruivo claro',
      texto: 'Acobreado suave, comprimento ondulado',
      alt: 'Cabelo ruivo claro acobreado, longo e ondulado',
    },
    {
      imagem: 'tipo-acaju',
      nome: 'Acaju',
      texto: 'Castanho avermelhado, liso e brilhante',
      alt: 'Cabelo acaju castanho avermelhado, longo e liso',
    },
    {
      imagem: 'tipo-borgonha',
      nome: 'Borgonha',
      texto: 'Vermelho escuro com cachos modelados',
      alt: 'Cabelo cor de borgonha com cachos modelados nas pontas',
    },
    {
      imagem: 'tipo-chocolate',
      nome: 'Chocolate',
      texto: 'Castanho quente com ondas médias',
      alt: 'Cabelo castanho chocolate com ondas na altura dos ombros',
    },
    {
      imagem: 'tipo-preto-brilho',
      nome: 'Preto com brilho',
      texto: 'Escuro fechado, ondas na ponta',
      alt: 'Cabelo preto brilhante com ondas nas pontas',
    },
    {
      imagem: 'tipo-castanho-camadas',
      nome: 'Castanho em camadas',
      texto: 'Corte com movimento e pontas viradas',
      alt: 'Cabelo castanho caramelo cortado em camadas, com as pontas viradas',
    },
    {
      imagem: 'tipo-cachos-definidos',
      nome: 'Cachos definidos',
      texto: 'Cacho aberto, castanho iluminado',
      alt: 'Cachos bem definidos em cabelo castanho com iluminação caramelo',
    },
    {
      imagem: 'tipo-cachos-luzes',
      nome: 'Luzes no cacheado',
      texto: 'Iluminação sem abrir o cacho',
      alt: 'Cabelo cacheado escuro com luzes caramelo distribuídas',
    },
    {
      imagem: 'tipo-morena-iluminada',
      nome: 'Morena iluminada',
      texto: 'Mechas discretas sobre castanho escuro',
      alt: 'Cabelo castanho escuro com mechas caramelo discretas e ondas',
    },
    {
      imagem: 'tipo-bob-castanho',
      nome: 'Long bob liso',
      texto: 'Corte reto com reflexos claros',
      alt: 'Long bob castanho liso com reflexos mais claros',
    },
  ],
} as const;

/** Perguntas do diagnóstico. Nenhuma resposta promete resultado ou preço. */
export const diagnostico = {
  eyebrow: 'Antes de marcar',
  titulo: 'Diagnóstico em 3 perguntas',
  texto:
    'Responda três coisas sobre o seu cabelo hoje. A gente indica por onde começar e abre o WhatsApp com tudo escrito — sem cadastro e sem esperar e-mail.',
  perguntas: [
    {
      id: 'tipo',
      rotulo: 'Como é o seu cabelo hoje?',
      opcoes: ['Liso', 'Ondulado', 'Cacheado', 'Crespo'],
    },
    {
      id: 'quimica',
      rotulo: 'Já fez química no cabelo?',
      opcoes: [
        'Nunca fiz química',
        'Já pintei ou retoco raiz',
        'Já descolori (mechas ou loira)',
        'Já alisei ou relaxei',
      ],
    },
    {
      id: 'objetivo',
      rotulo: 'O que você quer agora?',
      opcoes: [
        'Clarear ou ficar loira',
        'Ficar ruiva ou puxar para o vermelho',
        'Cobrir brancos ou mudar o tom',
        'Recuperar cabelo danificado',
        'Cortar e repaginar',
        'Definir o cacho',
      ],
    },
  ],
  /**
   * Encaminhamento por objetivo. É indicação de POR ONDE COMEÇAR, nunca
   * promessa de resultado — e sempre condicionada à avaliação presencial.
   */
  encaminhamentos: {
    'Clarear ou ficar loira': {
      titulo: 'Avaliação para clareamento',
      texto:
        'Clareamento depende do histórico do fio: quantos tons dá para subir com segurança só se define olhando o cabelo de perto. O primeiro passo é uma avaliação — em alguns casos ela vem junto de um tratamento antes da química.',
    },
    'Ficar ruiva ou puxar para o vermelho': {
      titulo: 'Coloração em tons quentes',
      texto:
        'Do acobreado ao borgonha, o vermelho é a família de cor que a casa mais publica. O tom exato depende da base que o seu cabelo tem hoje — e o vermelho desbota diferente de qualquer outro, então a manutenção entra na conversa desde o começo.',
    },
    'Cobrir brancos ou mudar o tom': {
      titulo: 'Coloração',
      texto:
        'Mudança de tom ou cobertura de brancos, com escolha do tom na hora e retoque de raiz combinado depois.',
    },
    'Recuperar cabelo danificado': {
      titulo: 'Tratamento e reconstrução',
      texto:
        'Antes de qualquer cor nova, devolver estrutura ao fio. É o que faz a próxima química pegar por igual e durar.',
    },
    'Cortar e repaginar': {
      titulo: 'Corte com consultoria',
      texto:
        'Corte pensado junto com você, considerando a rotina de finalização e o tempo que você tem de manhã.',
    },
    'Definir o cacho': {
      titulo: 'Definição de cachos',
      texto:
        'Corte e finalização pensados para o seu padrão de curvatura. Saber o que já foi feito no cabelo importa: alisamento antigo muda o caminho.',
    },
  },
} as const;

/**
 * Antes e depois com divisor arrastável.
 *
 * ⚠️ REGRA: as duas fotos de um par têm de ser da MESMA cliente e do MESMO
 * trabalho. Um "antes" de uma pessoa com o "depois" de outra não é
 * comparação, é propaganda enganosa — e destrói a credibilidade da seção
 * inteira no primeiro comentário de quem reconhecer a cliente.
 *
 * São só TRÊS pares, e não mais, porque só três resistiram à conferência.
 * Cada um foi confirmado por roupa, comprimento, corte e cenário:
 *
 *   ruivo — mesma camisa verde de time, mesma tatuagem no pescoço, mesmo bob
 *   loiro — mesma camiseta verde-acinzentada, mesmo comprimento
 *   luzes — mesma regata branca, mesmo corte na altura do queixo
 *
 * Havia outros candidatos no acervo. Foram descartados por não dar para
 * garantir que fossem a mesma pessoa. Três pares verdadeiros valem mais que
 * cinco duvidosos.
 */
export const antesDepois = {
  eyebrow: 'Antes e depois',
  titulo: 'Arraste e veja a diferença',
  texto:
    'Duas fotos da mesma cliente, no mesmo dia: antes de sentar na cadeira e depois de terminar. Arraste a linha para atravessar de um lado ao outro.',
  dica: 'Arraste a linha · ou use as setas do teclado',
  pares: [
    {
      id: 'ruivo',
      antes: 'ad-ruivo-antes',
      antesAlt: 'Bob curto castanho muito escuro, visto de costas dentro do salão',
      depois: 'ad-ruivo-depois',
      depoisAlt: 'O mesmo bob agora em ruivo acobreado, fotografado na luz do sol',
      titulo: 'Do escuro ao acobreado',
      /* A mudança de cenário (dentro → calçada) é real e está explicada: sem
         isso, quem arrasta acha que são duas pessoas. */
      texto:
        'Mesmo corte, cor nova. O depois foi na calçada, no sol — é onde o acobreado aparece de verdade.',
    },
    {
      id: 'loiro',
      antes: 'ad-loiro-antes',
      antesAlt: 'Cabelo loiro desbotado com a raiz escura crescida, liso e sem brilho',
      depois: 'ad-loiro-depois',
      depoisAlt: 'O mesmo cabelo loiro por inteiro, com a raiz esfumada e brilho',
      titulo: 'Raiz crescida resolvida',
      texto: 'Raiz escura e comprimento desbotado igualados, com a passagem esfumada.',
    },
    {
      id: 'luzes',
      antes: 'ad-luzes-antes',
      antesAlt: 'Cabelo castanho ondulado na altura do ombro, sem iluminação',
      depois: 'ad-luzes-depois',
      depoisAlt: 'O mesmo cabelo com luzes loiras marcadas e escova modelada',
      titulo: 'Luzes e escova',
      texto: 'Mechas loiras num castanho médio, com a escova modelando o movimento.',
    },
  ],
} as const;

/* ── PILAR 2 · PRODUÇÃO ───────────────────────────────────────────────── */

export const producao = {
  eyebrow: 'Pilar 2 · Produção',
  titulo: 'Para o dia em que você é a foto',
  texto:
    'Formatura, casamento de amiga, aniversário, ensaio. Maquiagem e penteado feitos juntos, no horário do evento — e não três horas antes, torcendo para durar. Monte abaixo o que você precisa e a gente devolve o pedido pronto no WhatsApp.',
  itens: [
    { nome: 'Maquiagem', texto: 'Do social discreto ao esfumado marcante.' },
    { nome: 'Penteado', texto: 'Coque, semipreso, rabo alto e trança.' },
    { nome: 'Escova modelada', texto: 'Quando o penteado é o próprio cabelo solto.' },
    { nome: 'Produção completa', texto: 'Maquiagem e penteado (ou escova) em sequência.' },
  ],
  imagem: 'producao-formanda',
  alt: 'Formanda de vestido longo azul-marinho, com coque alto e maquiagem dourada, no salão',

  /**
   * A foto larga em destaque. É o coque baixo trançado com o letreiro de
   * neon atrás — a única do bloco que mostra o penteado E o salão no mesmo
   * quadro.
   */
  destaque: {
    imagem: 'producao-coque-baixo',
    alt: 'Coque baixo trançado em cabelo loiro, com o letreiro de neon Concetto di Bellezza ao fundo',
    legenda: 'Coque baixo trançado, feito na cadeira do salão',
  },

  galeria: [
    {
      imagem: 'producao-semipreso',
      alt: 'Semipreso ondulado com brincos de argola dourados e batom vermelho',
      legenda: 'Semipreso com ondas',
    },
    {
      imagem: 'producao-rabo-alto',
      alt: 'Rabo de cavalo alto em cabelo loiro, com o comprimento ondulado',
      legenda: 'Rabo alto com ondas',
    },
    /* Sem legenda: são retratos de maquiagem. "Maquiagem esfumada" embaixo da
       foto de uma maquiagem esfumada não acrescenta nada. */
    { imagem: 'producao-make-neutra', alt: 'Maquiagem em tons neutros com esfumado terroso' },
    { imagem: 'producao-make-coque', alt: 'Maquiagem luminosa com coque alto e sobrancelha marcada' },
    {
      imagem: 'producao-make-cachos',
      alt: 'Maquiagem com delineado gráfico e cachos naturais volumosos',
    },
    { imagem: 'producao-make-esfumada', alt: 'Maquiagem com esfumado marrom e boca nude' },
  ],
} as const;

/** Opções do "monte sua produção". Nenhuma implica preço. */
export const montagemProducao = {
  ocasioes: ['Formatura', 'Casamento', 'Aniversário', 'Ensaio de fotos', 'Outro evento'],
  servicos: ['Maquiagem', 'Penteado', 'Escova modelada', 'Unhas', 'Cabelo (cor ou corte)'],
  acompanhantes: [
    { id: 'amigas', rotulo: 'Amigas e madrinhas', max: 12 },
    { id: 'familia', rotulo: 'Mães e família', max: 8 },
  ],
  meses: [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
  anosAFrente: 2,
  /** Horário do evento, em faixas — ninguém sabe o minuto exato meses antes. */
  horariosEvento: ['Manhã', 'Início da tarde', 'Fim da tarde', 'Noite'],
} as const;

/* ── PILAR 3 · UNHAS ──────────────────────────────────────────────────── */

export const unhas = {
  eyebrow: 'Pilar 3 · Unhas',
  titulo: 'Manicure, gel e alongamento',
  texto:
    'Três profissionais atendendo só unhas, com pacote fechado de manutenção. Do esmalte tradicional ao alongamento em molde, com manutenção combinada a cada 20 a 25 dias.',
  itens: [
    { nome: 'Manicure e pedicure', texto: 'Esmaltação tradicional, mão e pé.' },
    { nome: 'Esmaltação em gel', texto: 'Dura mais e não lasca na primeira semana.' },
    {
      nome: 'Alongamento em molde',
      texto: 'Molde F1, com manutenção a cada 20 a 25 dias.',
    },
    { nome: 'Decoração', texto: 'Francesinha, glitter, folha dourada e desenho.' },
  ],
  imagem: 'unhas-francesinha-vermelha',
  alt: 'Unhas em francesinha vermelha sobre base rosada, formato oval',
  galeria: [
    {
      imagem: 'unhas-glitter-flores',
      alt: 'Unhas curtas com glitter dourado e florzinhas brancas desenhadas',
      legenda: 'Glitter com desenho',
    },
    {
      imagem: 'unhas-marrom-dourado',
      alt: 'Unhas marrom-chocolate com detalhe de folha dourada na base',
      legenda: 'Marrom com folha dourada',
    },
  ],
} as const;

/* ── TODOS OS SERVIÇOS ────────────────────────────────────────────────── */

/**
 * As categorias saem do que o Google lista para o perfil deles (Manicure e
 * Pedicure, Corte, Atendimento Homens), da descrição que eles escreveram e
 * dos destaques de story. Nada aqui é chute.
 */
export const servicos = {
  eyebrow: 'Serviços',
  titulo: 'Tudo o que a casa faz',
  texto:
    'Se o que você procura não estiver aqui, pergunte no WhatsApp — a lista abaixo é o que dá para confirmar pelos canais deles.',
  itens: [
    {
      nome: 'Coloração',
      texto: 'Loiras, ruivos, morena iluminada, cobertura de brancos.',
      destaque: true,
    },
    {
      nome: 'Corte e escova',
      texto: 'Corte feminino e masculino, escova modelada, finalização.',
      destaque: true,
    },
    {
      nome: 'Tratamento e cachos',
      texto: 'Hidratação, reconstrução e definição de cacho.',
      destaque: false,
    },
    {
      nome: 'Maquiagem e penteado',
      texto: 'Produção para formatura, casamento e ensaio.',
      destaque: false,
    },
    {
      nome: 'Unhas · mãos e pés',
      texto: 'Manicure, pedicure, gel e alongamento em molde.',
      destaque: false,
    },
    {
      nome: 'Tranças',
      texto: 'Feitas no salão, com pacote fechado.',
      destaque: false,
    },
    /* A barbearia é o serviço que quase nenhum salão de Maringá comunica
       direito — e o Google já lista "Atendimento Homens" no perfil deles.
       Ocupa a linha inteira porque é o sétimo item numa grade de 3 e
       sozinho na última linha viraria sobra em vez de fecho. */
    {
      nome: 'Barbearia',
      texto:
        'Corte masculino e barba, com barbeiro próprio. O perfil do Google já traz "Atendimento Homens" — poucos salões da cidade dizem isso em voz alta.',
      destaque: false,
      larguraCheia: true,
    },
  ],
  imagem: 'servicos-ruivo-mel',
  alt: 'Cabelo ruivo mel longo e ondulado, fotografado contra a parede verde do salão',
} as const;

/* ── DEPOIMENTOS ──────────────────────────────────────────────────────── */

/**
 * ⚠️ LEIA ANTES DE MEXER AQUI.
 *
 * Estas mensagens são REAIS. São prints de conversa que as clientes mandaram
 * para o salão e que o próprio salão republicou no Instagram. Não são
 * avaliações do Google, e não foram escritas por mim.
 *
 * TRÊS REGRAS:
 *
 *  1. NÃO INVENTE UMA QUINTA. A quarta é a última que existe. Uma frase
 *     inventada no meio de quatro verdadeiras contamina as quatro.
 *  2. NÃO INVENTE NOMES. As mensagens estão anônimas na fonte e continuam
 *     anônimas aqui. "Maria S., 32 anos" seria a mentira mais fácil de
 *     desmontar do site inteiro.
 *  3. NÃO INVENTE RESPOSTA DO SALÃO. O último balão é assinado como sendo
 *     do site, não deles — está escrito na tela.
 *
 * ÚNICA EDIÇÃO FEITA: no depoimento 3, uma frase do meio saiu. No original
 * está "Mesmo em dias de difíceis, fique muito feliz. E meu esposo ia amar
 * muito." — a digitação truncou e a frase não fecha sentido. O elogio e a
 * intenção de voltar foram mantidos palavra por palavra. Nada foi acrescentado.
 */
export const depoimentos = {
  eyebrow: 'Quem já sentou na cadeira',
  titulo: 'O que chega no WhatsApp do salão',
  texto:
    'Não são avaliações escritas para aparecer: são mensagens que as clientes mandaram direto para o salão depois de sair daqui. O próprio Concetto publicou os prints no Instagram — os nomes ficam de fora porque quem escreveu não autorizou aparecer neste site.',
  /** Cada item é um balão. `mensagens` vira mais de um balão seguido, como
      chegou na conversa original. */
  conversa: [
    {
      id: 'cabelo-impecavel',
      mensagens: [
        'Olá, boa tarde! César, tudo bem? Passando aqui depois de um mês para te dizer que meu cabelo continua impecável! Você foi sensacional no trabalho, já estou ansiosa para te reencontrar em breve. Obrigada!!',
      ],
      contexto: 'um mês depois da coloração',
    },
    {
      id: 'trancas',
      mensagens: [
        'Oii, várias pessoas elogiaram minhas tranças! Além de eu me sentir linda com elas.',
        'E a durabilidade foi impecável. Fiz todas as provas, viajei, dormi, acordei e elas ainda estavam lá intactas 😂 Amei muito! Obrigada 💛',
      ],
      contexto: 'sobre as tranças',
    },
    {
      id: 'atendimento',
      mensagens: [
        'Excelente atendimento! Resultado, melhor que o esperado.',
        'Em breve irei novamente. É organizar com minha mudança.',
      ],
      contexto: 'depois de mudar de cidade',
    },
    {
      id: 'carinho',
      mensagens: [
        'Estava agora mesmo falando com meu marido de vocês. O quanto vocês são incríveis 🥰',
        'Incríveis profissionais e incríveis pessoas. Obrigada pelo carinho que tem comigo cada vez que vou ao salão. Minha filha ficou encantada com tudo.',
      ],
      contexto: 'cliente de casa',
    },
  ],
  /** O fecho. Assinado como sendo do site — está escrito na tela. */
  fecho: 'Quer ser a próxima?',
  fechoCta: 'Chamar no WhatsApp',
  fechoMensagem:
    'Olá, Concetto di Bellezza! Vim pelo site e gostaria de agendar um horário.',
  ctaAvaliacoes: 'Ver as avaliações no Google',
} as const;

/* ── AGENDAMENTO ──────────────────────────────────────────────────────── */

export const agendar = {
  eyebrow: 'Vamos marcar',
  titulo: 'Agende do seu jeito',
  texto:
    'Escolha o serviço, o dia que costuma dar certo pra você e o período. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pelo WhatsApp',
  mensagem: 'Olá, Concetto di Bellezza! Vim pelo site e gostaria de agendar um horário.',
  /* Fica atrás de um véu a 94%: é textura de fundo, não assunto. Por isso
     uma foto ampla do interior serve melhor que um detalhe. */
  imagem: 'espaco-bancadas',
  alt: 'Bancada de atendimento do salão com espelhos ondulados',
  dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  periodos: ['Manhã', 'Tarde'],
} as const;

export const visite = {
  eyebrow: 'Visite',
  titulo: 'Estamos na Mathias de Albuquerque, na Zona 03',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site vai
 * ser distribuído. Sem isto, a mensagem vira um link pelado.
 *
 * A foto do salão, e não a do cabelo: em 1200x630 (bem horizontal) um 4:5 de
 * cabelo vira uma faixa de fios sem contexto, enquanto a vista ampla do
 * espaço se lê inteira. E é o espaço que ganha elogio nas avaliações.
 */
export const og = {
  imagem: 'espaco-salao',
} as const;
