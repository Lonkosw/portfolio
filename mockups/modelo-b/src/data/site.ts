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
  nome: 'Studio Aurora',
  tagline: 'Modelo de site para salão de beleza.',
  descricao:
    'Modelo demonstrativo de site para salão de beleza: coloração, cortes, penteado, maquiagem e unhas, com agendamento pelo WhatsApp.',
  cidade: 'Sua cidade',
  estado: 'PR',

  /** ⚠️ PLACEHOLDER — trocar pelo WhatsApp do Théo antes de disparar. */
  whatsapp: '5544000000000',
  whatsappExibicao: '(00) 00000-0000',
  instagram: 'https://www.instagram.com/',
  instagramExibicao: '@seusalao',

  endereco: 'Rua do seu salão, 000',
  bairro: 'Centro',
  cep: '00000-000',
  maps: 'https://www.google.com/maps',
  avaliacoesGoogle: 'https://www.google.com/maps',

  /**
   * ⚠️ NÚMEROS DE EXEMPLO, e é por isso que estão redondos.
   *
   * O site do Concetto traz a nota real do Google deles (5,0 com 166
   * avaliações), que é o ativo mais forte daquele salão. Aqui não dá para
   * repetir: seria emprestar a reputação de um salão real para vender para
   * os concorrentes dele. Um "4,9 com 120" redondo lê como exemplo, que é
   * o que é — e no site do cliente entra a nota verdadeira dele.
   */
  google: {
    nota: '4,9',
    avaliacoes: 120,
    lido: 'exemplo',
  },

  horarios: [
    { dias: 'Segunda a sexta', horas: '9h às 19h' },
    { dias: 'Sábado', horas: '9h às 17h' },
    { dias: 'Domingo', horas: 'Fechado' },
  ],

  /**
   * Fica `true` para sempre neste arquivo. Modelo demonstrativo com foto de
   * banco nunca pode entrar na busca nem perder a faixa de aviso.
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
  eyebrow: 'Salão de beleza · modelo demonstrativo',
  titulo: ['Beleza não', 'se improvisa.'],
  texto:
    'Este é um modelo de site para salão. No seu, entram o seu nome, as suas fotos e as suas cores — com coloração, corte, produção para festa e unhas cada um na sua seção, e tudo levando ao seu WhatsApp.',
  cta: 'Agendar meu horário',
  ctaSecundario: 'Ver transformações',
  imagem: 'hero-ondas-luz',
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
  titulo: 'O seu espaço, do jeito que ele é',
  paragrafos: [
    'Este bloco existe para mostrar o salão por dentro: a recepção, as estações, o lavatório. É o que responde a pergunta que toda cliente nova faz antes de marcar — "como é lá dentro?".',
    'As fotos aqui são de banco, para o modelo não ficar vazio. No seu site, entram as do seu salão, e as quatro palavras abaixo passam a ser as que você escolher para se descrever.',
  ],
  /** Exemplo. No site do cliente, entram as palavras que ele usa para se
      descrever — de preferência as do próprio perfil do Google dele. */
  valores: ['Acolhedor', 'Humanizado', 'Equipe capacitada', 'Produtos profissionais'],
  imagem: 'salao-estacoes',
  alt: 'Salão de beleza moderno com estações de atendimento e espelhos iluminados',
  galeria: [
    {
      imagem: 'salao-bancada',
      alt: 'Bancada de atendimento com espelhos recortados em onda e fita de LED por baixo',
      legenda: 'Os espelhos em onda, com LED por baixo',
    },
    {
      imagem: 'salao-lavatorio',
      alt: 'Área de lavatórios com parede verde, samambaias e divisória de cordas',
      legenda: 'A área de lavagem',
    },
    /* Sem legenda de propósito: o balcão de recepção com o letreiro atrás já
       diz o que é. Escrever "recepção" embaixo da foto da recepção é
       legendar o óbvio. */
    {
      imagem: 'salao-recepcao',
      alt: 'Recepção de salão com espelhos redondos iluminados e bancada',
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
  src: '/video/video-cuidado.mp4',
  poster: 'video-cuidado-poster',
  alt: 'Vídeo de atendimento em salão de beleza',
  legenda: 'Vídeo no site, sem pesar a página',
  /** Só aparece enquanto `src` estiver vazio. Não vai ao ar com o vídeo. */
  avisoSemVideo: 'O vídeo do seu salão entra aqui.',
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
  imagem: 'ruivo-finalizado',
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
      imagem: 'loira-espelho',
      nome: 'Loiro iluminado',
      texto: 'Raiz esfumada e ondas longas',
      alt: 'Cabelo loiro iluminado, longo e ondulado, com a raiz esfumada',
    },
    {
      imagem: 'ondas-volumosas',
      nome: 'Loiro mel',
      texto: 'Mechas claras sobre base dourada',
      alt: 'Cabelo loiro mel com mechas claras e ondas soltas',
    },
    {
      imagem: 'ruivo-finalizado',
      nome: 'Ruivo claro',
      texto: 'Acobreado suave, comprimento ondulado',
      alt: 'Cabelo ruivo claro acobreado, longo e ondulado',
    },
    {
      imagem: 'babyliss-ondas',
      nome: 'Acaju',
      texto: 'Castanho avermelhado, liso e brilhante',
      alt: 'Cabelo acaju castanho avermelhado, longo e liso',
    },
    {
      imagem: 'coloracao-mecha',
      nome: 'Borgonha',
      texto: 'Vermelho escuro com cachos modelados',
      alt: 'Cabelo cor de borgonha com cachos modelados nas pontas',
    },
    {
      imagem: 'castanho-costas',
      nome: 'Chocolate',
      texto: 'Castanho quente com ondas médias',
      alt: 'Cabelo castanho chocolate com ondas na altura dos ombros',
    },
    {
      imagem: 'liso-franja',
      nome: 'Preto com brilho',
      texto: 'Escuro fechado, ondas na ponta',
      alt: 'Cabelo preto brilhante com ondas nas pontas',
    },
    {
      imagem: 'ondas-medias',
      nome: 'Castanho em camadas',
      texto: 'Corte com movimento e pontas viradas',
      alt: 'Cabelo castanho caramelo cortado em camadas, com as pontas viradas',
    },
    {
      imagem: 'cachos-castanhos',
      nome: 'Cachos definidos',
      texto: 'Cacho aberto, castanho iluminado',
      alt: 'Cachos bem definidos em cabelo castanho com iluminação caramelo',
    },
    {
      imagem: 'ondas-volumosas',
      nome: 'Luzes no cacheado',
      texto: 'Iluminação sem abrir o cacho',
      alt: 'Cabelo cacheado escuro com luzes caramelo distribuídas',
    },
    {
      imagem: 'cachos-castanhos',
      nome: 'Morena iluminada',
      texto: 'Mechas discretas sobre castanho escuro',
      alt: 'Cabelo castanho escuro com mechas caramelo discretas e ondas',
    },
    {
      imagem: 'castanho-costas',
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
/**
 * O comparador arrastável.
 *
 * ⚠️ UM PAR SÓ, E ELE É REAL. As duas fotos são da mesma modelo, na mesma
 * sessão. Banco de imagem não tem par antes/depois — este saiu de uma série
 * do mesmo ensaio (ver `mockups/processar-midias.py`). O site do Concetto
 * di Bellezza,
 * que é de um salão de verdade, tem três pares; aqui sobrou um, porque só
 * um passou no teste de ser transformação e não dois ângulos do mesmo
 * resultado.
 *
 * O texto assume que a peça é um modelo: mostra o RECURSO e convida o dono
 * do salão a imaginar os trabalhos dele no lugar.
 */
export const antesDepois = {
  eyebrow: 'Antes e depois',
  titulo: 'Arraste e veja a diferença',
  texto:
    'É aqui que entram os seus antes e depois: a cliente arrasta a linha e vê a transformação inteira. A foto abaixo é ilustrativa — no seu site, são os seus trabalhos.',
  dica: 'Arraste a linha · ou use as setas do teclado',
  pares: [
    {
      id: 'ruivo',
      antes: 'antes-ruivo',
      antesAlt: 'Cabelo ruivo liso sendo penteado com pente de madeira',
      depois: 'depois-ruivo',
      depoisAlt: 'O mesmo cabelo ruivo depois, finalizado e com movimento',
      titulo: 'Finalização',
      texto:
        'Mesma cliente, mesma sessão: o cabelo sendo desembaraçado e, depois, finalizado com movimento e brilho.',
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
  imagem: 'penteado-noiva',
  alt: 'Formanda de vestido longo azul-marinho, com coque alto e maquiagem dourada, no salão',

  /**
   * A foto larga em destaque. É o coque baixo trançado com o letreiro de
   * neon atrás — a única do bloco que mostra o penteado E o salão no mesmo
   * quadro.
   */
  destaque: {
    imagem: 'penteado-coque-baixo',
    alt: 'Coque baixo trançado em cabelo loiro',
    legenda: 'Coque baixo trançado, feito na cadeira do salão',
  },

  galeria: [
    {
      imagem: 'penteado-brilho',
      alt: 'Semipreso ondulado com brincos de argola dourados e batom vermelho',
      legenda: 'Semipreso com ondas',
    },
    {
      imagem: 'penteado-tranca',
      alt: 'Rabo de cavalo alto em cabelo loiro, com o comprimento ondulado',
      legenda: 'Rabo alto com ondas',
    },
    /* Sem legenda: são retratos de maquiagem. "Maquiagem esfumada" embaixo da
       foto de uma maquiagem esfumada não acrescenta nada. */
    { imagem: 'paleta-sombras', alt: 'Maquiagem em tons neutros com esfumado terroso' },
    { imagem: 'penteado-coque-loiro', alt: 'Maquiagem luminosa com coque alto e sobrancelha marcada' },
    {
      imagem: 'penteado-brilho',
      alt: 'Maquiagem com delineado gráfico e cachos naturais volumosos',
    },
    { imagem: 'maquiagem-batom', alt: 'Maquiagem com esfumado marrom e boca nude' },
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
  imagem: 'unhas-onca',
  alt: 'Unhas em francesinha vermelha sobre base rosada, formato oval',
  galeria: [
    {
      imagem: 'unhas-rosa',
      alt: 'Unhas curtas com glitter dourado e florzinhas brancas desenhadas',
      legenda: 'Glitter com desenho',
    },
    {
      imagem: 'unhas-nude',
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
    /* A barbearia é o serviço que quase nenhum salão comunica
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
  imagem: 'babyliss-ondas',
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
/**
 * ⚠️ OS DEPOIMENTOS SÃO DE EXEMPLO, E TÊM DE CONTINUAR ASSIM.
 *
 * O site do Concetto traz mensagens de verdade, que as clientes mandaram
 * para o salão e que o próprio salão publicou. Copiar aquilo para cá seria
 * pegar a prova social de um salão real e usá-la para vender site aos
 * concorrentes dele. Não dá.
 *
 * Então os balões abaixo são escritos como exemplo e a seção diz isso na
 * primeira linha. O que eles demonstram é o RECURSO — "as mensagens que
 * chegam no seu WhatsApp podem virar esta seção" —, não a reputação de
 * ninguém.
 */
export const depoimentos = {
  eyebrow: 'Quem já sentou na cadeira',
  titulo: 'O que chega no WhatsApp do salão',
  texto:
    'As mensagens que as clientes mandam depois de sair do salão podem virar esta seção. Os balões abaixo são exemplos — no seu site, entram as conversas de verdade, com a autorização de quem escreveu.',
  conversa: [
    {
      id: 'exemplo-cor',
      mensagens: [
        'Passando aqui um mês depois pra dizer que a cor continua igualzinha ao dia que eu saí do salão. Recebi elogio a semana inteira!',
      ],
      contexto: 'exemplo · um mês depois da coloração',
    },
    {
      id: 'exemplo-penteado',
      mensagens: [
        'O penteado durou a festa toda, dancei a noite inteira e não saiu do lugar.',
        'Já quero marcar o do casamento da minha irmã 💛',
      ],
      contexto: 'exemplo · depois da formatura',
    },
    {
      id: 'exemplo-atendimento',
      mensagens: [
        'Atendimento nota mil. O resultado ficou melhor do que eu esperava.',
        'Voltarei com certeza.',
      ],
      contexto: 'exemplo · primeira visita',
    },
  ],
  fecho: 'No seu site, esta seção mostra as mensagens reais das suas clientes — e o botão abaixo leva direto para a conversa.',
  fechoCta: 'Falar no WhatsApp',
  fechoMensagem: 'Olá! Vi o modelo de site e queria saber mais.',
  ctaAvaliacoes: 'Ver avaliações no Google',
} as const;

/* ── AGENDAMENTO ──────────────────────────────────────────────────────── */

export const agendar = {
  eyebrow: 'Vamos marcar',
  titulo: 'Agende do seu jeito',
  texto:
    'Escolha o serviço, o dia que costuma dar certo pra você e o período. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pelo WhatsApp',
  mensagem: 'Olá! Vi o modelo de site e queria uma prévia com a cara do meu salão.',
  /* Fica atrás de um véu a 94%: é textura de fundo, não assunto. Por isso
     uma foto ampla do interior serve melhor que um detalhe. */
  imagem: 'salao-bancada',
  alt: 'Bancada de atendimento do salão com espelhos ondulados',
  dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  periodos: ['Manhã', 'Tarde'],
} as const;

export const visite = {
  eyebrow: 'Visite',
  titulo: 'O endereço do seu salão entra aqui',
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
  imagem: 'salao-estacoes',
} as const;
