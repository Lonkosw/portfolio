/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * REGRA DESTE ARQUIVO: só entra o que dá para conferir nos canais públicos
 * deles. Nada de preço, prêmio, depoimento, nome de profissional ou número de
 * clientes inventado.
 *
 * ⚠️ ESTADO DA APURAÇÃO — LEIA ANTES DE MANDAR PARA ALGUÉM
 *
 * O Priorize foi escrito depois de uma entrevista. Este aqui nasceu de UMA
 * fonte só: o print da bio do Instagram (@stilocabeleireirosoficial). O que
 * está confirmado é exatamente isto:
 *
 *   · "Desde 1978 entregando excelência"
 *   · Seg à Sab | 8h às 19h
 *   · Av. São Paulo, 1260
 *   · wa.me/5544991527386
 *   · Destaques do perfil: Noivas, Produção, Mechas, Mega Hair
 *   · 554 posts · 5.945 seguidores
 *
 * TUDO o que estiver marcado com `CONFERIR` abaixo foi escrito por dedução e
 * precisa passar pelo olho deles — ou por uma visita ao salão — antes de virar
 * argumento de venda. São afirmações plausíveis, não apuradas.
 */

export const site = {
  nome: 'Stilo Cabeleireiro',
  /**
   * O logo é a palavra partida em duas: a primeira em creme, a segunda em
   * bronze. Fica aqui e não dentro do Header/Footer porque a regra da casa é
   * não ter texto de conteúdo hard-coded em componente.
   */
  logo: { primeira: 'Stilo', segunda: 'Cabeleireiro' },
  /** Palavra deles, copiada da bio do Instagram. */
  tagline: 'Desde 1978 entregando excelência.',
  descricao:
    'Salão de beleza em Maringá — PR, na Avenida São Paulo. Mechas e coloração, mega hair, dia da noiva, produção e maquiagem.',
  cidade: 'Maringá',
  estado: 'PR',

  /** Ano da bio. É o eixo do site inteiro — ver a seção `casa`. */
  fundacao: 1978,

  whatsapp: '5544991527386',
  whatsappExibicao: '(44) 99152-7386',
  /**
   * O perfil mostra UM número só. O Priorize tinha dois porque a placa da
   * fachada trazia os dois. Aqui fica vazio de propósito, e os componentes
   * escondem a linha — inventar um segundo número é o tipo de erro que só
   * aparece quando alguém liga.
   */
  telefoneSecundario: '',
  instagram: 'https://www.instagram.com/stilocabeleireirosoficial',
  instagramExibicao: '@stilocabeleireirosoficial',
  /**
   * CONFERIR — não tenho o link direto de avaliações deles. Este é o link de
   * BUSCA no Maps pelo nome e endereço: cai no perfil certo se ele existir, e
   * numa busca vazia se não existir. Trocar pelo `g.page/r/...` real assim que
   * alguém abrir o perfil do Google do salão.
   */
  avaliacoesGoogle:
    'https://www.google.com/maps/search/?api=1&query=Stilo+Cabeleireiro+Av.+S%C3%A3o+Paulo+1260+Maring%C3%A1+PR',
  maps: 'https://www.google.com/maps/search/?api=1&query=Stilo+Cabeleireiro+Av.+S%C3%A3o+Paulo+1260+Maring%C3%A1+PR',

  endereco: 'Av. São Paulo, 1260',
  /** CONFERIR — a Av. São Paulo corta várias zonas de Maringá. Não confirmei. */
  bairro: 'Centro',
  /** CONFERIR — genérico de Maringá, igual ao que se fez no Priorize. */
  cep: '87000-000',
  /** Bio: "Seg à Sab | 8h às 19h". Uma linha só porque não há distinção lá. */
  horarios: [{ dias: 'Segunda a sábado', horas: '8h às 19h' }],

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no rodapé,
   * <meta name="robots" content="noindex, nofollow"> e aviso no robots.txt.
   * Virar false só se o Stilo contratar e este virar o site oficial.
   */
  demo: true,
} as const;

/**
 * Seis itens é o teto para a barra caber sem quebrar no notebook — foi o
 * limite achado no Priorize e vale igual aqui.
 *
 * São QUATRO pilares neste site (Mechas, Mega hair, Noivas, Produção) contra
 * dois do Priorize. Os quatro não cabem no menu junto com casa/serviços/
 * agendar. "Produção" é o que fica de fora: ela entra logo depois de Noivas,
 * que é de onde vem quase todo mundo que quer produção — quem chega pelo
 * dia da noiva passa por ela de qualquer jeito.
 */
export const nav = [
  { label: 'Desde 1978', href: '#casa' },
  { label: 'Mechas', href: '#mechas' },
  { label: 'Mega hair', href: '#mega-hair' },
  { label: 'Noivas', href: '#noivas' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Agendar', href: '#agendar' },
] as const;

export const hero = {
  eyebrow: 'Salão de beleza · Maringá — PR',
  /* As palavras são deles, da bio. Não há por que escrever melhor do que o
     dono escreveu sobre a própria casa. */
  titulo: ['Desde 1978,', 'entregando excelência.'],
  texto:
    'Mechas, coloração, mega hair e dia da noiva na Avenida São Paulo. Quase meio século no mesmo ofício, na mesma cidade — e a agenda aberta de segunda a sábado.',
  cta: 'Agendar meu horário',
  ctaSecundario: 'Ver transformações',
  /* Interior de salão, não a fachada deles — é foto de banco. O alt descreve
     o que a imagem MOSTRA, sem afirmar que é o Stilo. */
  imagem: 'hero-salao',
  alt: 'Interior de um salão de beleza, com cadeiras enfileiradas e luz quente',
} as const;

export const marquee = [
  'Mechas',
  'Coloração',
  'Morena iluminada',
  'Mega hair',
  'Corte',
  'Dia da noiva',
  'Penteado',
  'Maquiagem',
  'Produção',
] as const;

/* ── A CASA ──────────────────────────────────────────────────────────── */

/**
 * Esta seção é o que o Priorize NÃO tem e não pode ter: 1978.
 *
 * É o único ativo do Stilo que nenhum salão novo consegue comprar, copiar ou
 * anunciar. Por isso ela vem antes dos pilares, e não como nota de rodapé.
 *
 * ⚠️ Cuidado de redação: quase tudo que se poderia contar aqui — quem fundou,
 * quantas gerações, se mudou de endereço — eu NÃO sei. Os parágrafos abaixo
 * afirmam só o que a bio afirma e evitam encher com história inventada. Está
 * curto de propósito. Depois de falar com eles, é aqui que entra a história de
 * verdade, e esta é a seção que mais vai crescer.
 */
export const casa = {
  eyebrow: 'A casa',
  titulo: 'Um salão que atravessou quase meio século na mesma cidade',
  paragrafos: [
    'O Stilo Cabeleireiro abriu em 1978 e continua atendendo na Avenida São Paulo, em Maringá. São quase cinco décadas no mesmo ofício, numa cidade que mudou de tamanho várias vezes no meio do caminho.',
    'Salão não dura esse tempo por acaso. Dura porque a cliente volta — e porque volta trazendo alguém. É esse o combinado que a casa mantém desde o primeiro ano: de segunda a sábado, das 8h às 19h.',
  ],
  /**
   * CONFERIR — a conta muda no aniversário. Em 2026 o salão faz 48 anos SE a
   * data já passou; senão, ainda são 47. Por isso o site escreve "desde 1978"
   * e "quase meio século", nunca um número fechado: assim ele não fica errado
   * sozinho na virada do ano.
   */
  numeros: [
    { valor: '1978', rotulo: 'Ano de fundação' },
    { valor: 'Seg a sáb', rotulo: '8h às 19h' },
    { valor: '554', rotulo: 'Trabalhos publicados no Instagram' },
  ],
  imagem: 'casa-salao',
  alt: 'Bancada de salão com espelho de aro iluminado e cadeira',
  /* Sem legenda de endereço nas fotos: são de banco, e escrever "Na Avenida
     São Paulo" embaixo da vitrine de outro lugar seria afirmar o que a
     imagem não mostra. O endereço está no texto e no rodapé, onde é fato. */
  galeria: [
    { imagem: 'casa-fachada', alt: 'Vitrine de um salão de cabeleireiro vista da calçada' },
    { imagem: 'casa-detalhe', alt: 'Tesouras, pentes e escova de cabeleireiro sobre a bancada' },
  ],
} as const;

/* ── PILAR 1 · MECHAS E COLORAÇÃO ────────────────────────────────────── */

export const mechas = {
  eyebrow: 'Pilar 1 · Mechas e coloração',
  titulo: 'Loira, morena iluminada, ruivo — sem chutar o resultado',
  texto:
    'Mechas, balayage, coloração e cobertura de brancos. Antes de qualquer química a gente olha o histórico do fio: o mesmo tom não se faz do mesmo jeito em quem já descoloriu e em quem nunca pintou.',
  itens: [
    { nome: 'Mechas e balayage', texto: 'Luzes, reflexos e iluminado com leitura do histórico do fio.' },
    { nome: 'Morena iluminada', texto: 'Clarear sem sair do castanho, preservando a raiz.' },
    { nome: 'Loiras', texto: 'Do platinado ao mel, conforme o que o cabelo aguenta subir.' },
    { nome: 'Coloração e cobertura de brancos', texto: 'Mudança de tom e manutenção de raiz combinada.' },
    { nome: 'Tratamento e reconstrução', texto: 'Antes e depois da química, para o fio aguentar o processo.' },
  ],
  imagem: 'mechas-principal',
  alt: 'Cabelo castanho longo com ombré e pontas iluminadas',
} as const;

/**
 * Carrossel de tipos de cabelo — um trabalho de cada tipo, lado a lado.
 *
 * Existe porque a lista de serviços é texto: "morena iluminada" e "butterfly"
 * não significam nada para quem não é do ramo. Aqui a cliente aponta o que
 * quer e a mensagem sai pronta.
 *
 * ⚠️ REGRA DE OURO DESTA LISTA: o nome descreve A FOTO, não o serviço que a
 * gente gostaria de vender. Chamar de "morena iluminada" uma foto de loiro
 * platinado destrói a confiança na hora — quem está escolhendo cabelo repara
 * na cor antes de ler qualquer coisa.
 *
 * ⚠️ SÃO FOTOS DE BANCO. Cada nome abaixo foi escrito OLHANDO a imagem que
 * entrou, uma por uma — por isso não há "loiro platinado" nem "corte
 * butterfly" na lista: nenhuma das fotos do pool mostrava isso, e batizar de
 * platinado um loiro acinzentado é exatamente o erro que a regra proíbe.
 *
 * Quando as fotos do Stilo chegarem, refaça o mesmo exercício: troque as
 * imagens e reescreva cada linha olhando o que entrou.
 *
 * Todas são 4:5 (o formato nativo do Instagram). Trocar por horizontal quebra
 * o alinhamento da fila inteira.
 */
export const tiposCabelo = {
  eyebrow: 'Escolha o seu',
  titulo: 'Qual desses é o cabelo que você quer?',
  texto:
    'Arraste para o lado. Ao tocar em um deles, o WhatsApp abre com o nome já escrito — sem precisar explicar por texto o que você quer.',
  itens: [
    { imagem: 'tipo-loiro-ondas', nome: 'Loiro com ondas', texto: 'Comprimento loiro em ondas soltas', alt: 'Cabelo loiro longo com ondas soltas' },
    { imagem: 'tipo-loiro-acinzentado', nome: 'Loiro acinzentado', texto: 'Loiro frio, sem amarelado', alt: 'Cabelo loiro acinzentado com ondas' },
    { imagem: 'tipo-morena-iluminada', nome: 'Morena iluminada', texto: 'Luz no castanho, sem perder a base', alt: 'Cabelo castanho com pontas iluminadas, visto de lado' },
    { imagem: 'tipo-castanho-ondas', nome: 'Castanho com ondas', texto: 'Escova modelada no castanho', alt: 'Cabelo castanho longo com ondas modeladas' },
    { imagem: 'tipo-ruivo', nome: 'Ruivo', texto: 'Vermelho quente no comprimento', alt: 'Cabelo ruivo longo sendo penteado' },
    { imagem: 'tipo-cachos', nome: 'Cachos definidos', texto: 'Definição sem alisar para clarear', alt: 'Cachos volumosos e definidos' },
    { imagem: 'tipo-cachos-luzes', nome: 'Cachos com luzes', texto: 'Iluminação respeitando o cacho', alt: 'Cabelo cacheado com mechas mais claras' },
    { imagem: 'tipo-comprimento', nome: 'Comprimento', texto: 'Cabelo longo com pontas alinhadas', alt: 'Cabelo longo visto de costas' },
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
        'Mudar a cor ou cobrir brancos',
        'Recuperar cabelo danificado',
        'Dar volume ou comprimento',
        'Cortar e repaginar',
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
        'Clareamento depende do histórico do fio: quantos tons dá para subir com segurança só se define olhando o cabelo. O primeiro passo é uma avaliação — em alguns casos ela vem junto de um tratamento antes da química.',
    },
    'Mudar a cor ou cobrir brancos': {
      titulo: 'Coloração',
      texto:
        'Mudança de tom ou cobertura de brancos, com escolha do tom na hora e manutenção de raiz combinada depois.',
    },
    'Recuperar cabelo danificado': {
      titulo: 'Tratamento e reconstrução',
      texto:
        'Antes de qualquer cor nova, devolver estrutura ao fio. É o que faz a próxima química pegar por igual e durar.',
    },
    /* Este encaminhamento é a ponte para o Pilar 2: quem quer volume ou
       comprimento agora normalmente está falando de mega hair sem saber o
       nome do serviço. */
    'Dar volume ou comprimento': {
      titulo: 'Avaliação para mega hair',
      texto:
        'Volume e comprimento se resolvem com mega hair, e a técnica certa depende do seu cabelo natural e da sua rotina. A avaliação define o método, a quantidade e a manutenção antes de qualquer coisa ser aplicada.',
    },
    'Cortar e repaginar': {
      titulo: 'Corte com consultoria',
      texto:
        'Corte pensado junto com você, considerando rotina de finalização e o tempo que você tem de manhã.',
    },
  },
} as const;

/**
 * Antes e depois com divisor arrastável.
 *
 * ⚠️ ESTA SEÇÃO MUDOU DE PROMESSA POR CAUSA DAS FOTOS DE BANCO.
 *
 * A versão original dizia "duas fotos da MESMA cliente, no MESMO dia". Isso
 * exige um par real, e banco de imagens não tem: não existe o mesmo rosto
 * fotografado antes e depois de um trabalho. Manter aquele texto com foto de
 * banco não seria licença poética — seria afirmar um fato falso sobre um
 * trabalho que não aconteceu, e a licença do Pexels ainda proíbe usar a
 * pessoa retratada de forma a sugerir endosso.
 *
 * O que a seção afirma agora: **processo → resultado**, com pessoas
 * diferentes, e o `aviso` dizendo isso na tela. É honesto e ainda demonstra o
 * recurso funcionando.
 *
 * QUANDO AS FOTOS DO STILO CHEGAREM: volte a regra antiga. Par = mesma
 * cliente, mesmo trabalho, mesmo enquadramento (4:5, 1080x1350 — formatos
 * diferentes fazem o rosto pular quando o divisor passa). Aí o `aviso` sai e
 * o texto volta a ser o de cima.
 *
 * Três pares, não quatro: preferi três coerentes a quatro forçados.
 */
export const antesDepois = {
  eyebrow: 'Antes e depois',
  titulo: 'Arraste e veja a diferença',
  texto:
    'De um lado o cabelo na cadeira, do outro o resultado do serviço. Arraste a linha para atravessar de um lado ao outro.',
  dica: 'Arraste a linha · ou use as setas do teclado',
  /** Sai junto com as fotos de banco. Ver o comentário acima. */
  aviso: 'Imagens ilustrativas de banco. Não são trabalhos do salão, e cada lado é uma pessoa diferente.',
  pares: [
    {
      id: 'ondas',
      antes: 'antes-ondas',
      antesAlt: 'Cabelo molhado sendo penteado no salão',
      depois: 'depois-ondas',
      depoisAlt: 'Cabelo castanho longo finalizado em ondas',
      titulo: 'Escova e ondas',
      texto: 'Da lavagem ao comprimento modelado e alinhado.',
    },
    {
      id: 'cor',
      antes: 'antes-cor',
      antesAlt: 'Cabelo preso em mechas com presilhas, durante a coloração',
      depois: 'depois-cor',
      depoisAlt: 'Cabelo castanho longo finalizado, com brilho',
      titulo: 'Coloração',
      texto: 'Da separação das mechas ao tom fechado por igual.',
    },
    {
      id: 'corte',
      antes: 'antes-corte',
      antesAlt: 'Cabelo escuro e molhado sendo cortado com tesoura',
      depois: 'depois-corte',
      depoisAlt: 'Cabelo ruivo escuro finalizado, com movimento',
      titulo: 'Corte e cor',
      texto: 'Do corte no molhado ao acabamento com a cor pronta.',
    },
  ],
} as const;

/* ── PILAR 2 · MEGA HAIR ─────────────────────────────────────────────── */

/**
 * Mega hair é destaque próprio no perfil deles, e é o serviço com a decisão
 * mais demorada do salão: ticket alto, muita dúvida e muito medo — de estragar
 * o cabelo natural, de ficar aparente, de não conseguir manter.
 *
 * Por isso esta seção EXPLICA em vez de exibir. As perguntas abaixo são as que
 * a cliente já traz na cabeça; respondê-las antes do WhatsApp é o que faz ela
 * chegar decidida em vez de só perguntar preço e sumir.
 *
 * ⚠️ CONFERIR TUDO: eu não sei quais técnicas o Stilo aplica nem qual a
 * política de manutenção deles. As respostas abaixo são genéricas e corretas
 * para o serviço em geral — não são a prática da casa. Confirmar antes de
 * mandar, e ajustar o que for diferente.
 */
export const megaHair = {
  eyebrow: 'Pilar 2 · Mega hair',
  titulo: 'Comprimento e volume, sem sacrificar o que é seu',
  texto:
    'Aplicação, manutenção e retirada. O método certo depende do seu cabelo natural, da sua rotina e de quanto tempo você quer manter — e isso se decide olhando o fio, não pelo WhatsApp.',
  itens: [
    { nome: 'Aplicação', texto: 'Escolha do método, da quantidade e do tom, com avaliação antes.' },
    { nome: 'Manutenção', texto: 'Reposicionamento conforme o cabelo natural cresce.' },
    { nome: 'Retirada', texto: 'Remoção feita no salão, sem puxar o que é seu.' },
    { nome: 'Cor e corte no mega', texto: 'Ajuste de tom e acabamento para o aplicado casar com o natural.' },
  ],
  imagem: 'mega-hair-principal',
  alt: 'Cabelo loiro muito longo sendo penteado, mostrando o comprimento',
  /** As dúvidas que travam a decisão. Nenhuma resposta promete resultado. */
  duvidas: {
    titulo: 'O que todo mundo pergunta antes',
    itens: [
      {
        pergunta: 'Estraga o meu cabelo?',
        resposta:
          'Aplicado e mantido corretamente, não. O que danifica é peso demais para a densidade do fio e manutenção atrasada — os dois se resolvem na avaliação e no acompanhamento.',
      },
      {
        pergunta: 'Dá para perceber?',
        resposta:
          'Depende da escolha do tom, do ponto de aplicação e do acabamento. É por isso que o corte e a cor entram junto: o aplicado tem de terminar igual ao seu.',
      },
      {
        pergunta: 'Quanto tempo dura?',
        resposta:
          'Varia com a velocidade de crescimento do seu cabelo e com a rotina. A manutenção é o que define a duração — e ela é combinada desde o primeiro dia.',
      },
      {
        pergunta: 'Posso lavar e prender normal?',
        resposta:
          'Pode, com os cuidados que a gente explica na hora da aplicação. Você sai do salão sabendo lavar, secar e dormir sem comprometer o trabalho.',
      },
    ],
  },
  cta: 'Tirar minhas dúvidas no WhatsApp',
} as const;

/* ── PILAR 3 · NOIVAS ────────────────────────────────────────────────── */

export const noivas = {
  eyebrow: 'Pilar 3 · Noivas',
  titulo: 'O dia da noiva sem relógio nas costas',
  texto:
    'Cabelo, maquiagem e prova de penteado para a noiva, as madrinhas e as mães. Monte abaixo quantas pessoas vão e a que horas é a cerimônia — a gente devolve o pedido pronto no WhatsApp.',
  itens: [
    { nome: 'Prova de penteado e maquiagem', texto: 'Antes do dia, para chegar sem surpresa.' },
    { nome: 'Dia da noiva', texto: 'Cabelo e maquiagem em sequência, no horário da cerimônia.' },
    { nome: 'Madrinhas, mães e convidadas', texto: 'Atendimento do grupo no mesmo horário.' },
    { nome: 'Pré-wedding e ensaio', texto: 'Cabelo e make para as fotos antes do casamento.' },
  ],
  imagem: 'noiva-principal',
  alt: 'Noiva com coque preso e arranjo de cristais',

  /**
   * O bloco largo era "a noiva, a mãe e as madrinhas juntas". Não existe foto
   * de grupo no acervo de banco que eu montei, e forçar uma outra imagem com
   * aquela legenda seria legendar o que a foto não mostra.
   *
   * Trocado pelo penteado SENDO feito — que diz outra coisa verdadeira e
   * igualmente útil: o trabalho acontece ali, com tempo. Quando vier a foto
   * real do grupo, a legenda antiga volta.
   */
  destaque: {
    imagem: 'noiva-fazendo',
    alt: 'Mãos de cabeleireira montando um penteado preso de noiva',
    legenda: 'O penteado é montado com calma, no horário da cerimônia',
  },

  galeria: [
    { imagem: 'noiva-espelho', alt: 'Noiva penteada ao lado do vestido pendurado, no quarto', legenda: 'Antes de vestir' },
    { imagem: 'noiva-penteado', alt: 'Penteado preso visto de trás, com aplicação brilhante', legenda: 'Preso, visto de trás' },
    { imagem: 'noiva-arranjo', alt: 'Coque de noiva com arranjo de flores brancas' },
  ],
} as const;

/** Opções do "monte seu dia da noiva". Nenhuma implica preço. */
export const montagemNoiva = {
  servicos: [
    'Cabelo da noiva',
    'Maquiagem da noiva',
    'Prova de penteado',
    'Prova de maquiagem',
  ],
  acompanhantes: [
    { id: 'madrinhas', rotulo: 'Madrinhas', max: 12 },
    { id: 'maes', rotulo: 'Mães e sogras', max: 4 },
    { id: 'convidadas', rotulo: 'Outras convidadas', max: 12 },
  ],
  meses: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ],
  anosAFrente: 2,
  /** Horário da cerimônia, em faixas — ninguém sabe o minuto exato meses antes. */
  horariosCerimonia: ['Manhã', 'Início da tarde', 'Fim da tarde', 'Noite'],
} as const;

/* ── PILAR 4 · PRODUÇÃO ──────────────────────────────────────────────── */

/**
 * "Produção" é destaque próprio no perfil. Fica FORA do menu (ver `nav`) e
 * entra logo depois de Noivas de propósito: é a mesma cliente, no mesmo
 * estado de espírito, só que sem casamento — formatura, aniversário, ensaio,
 * festa. Quem rolou o dia da noiva e não é noiva cai exatamente aqui.
 */
export const producao = {
  eyebrow: 'Pilar 4 · Produção',
  titulo: 'Para quando a foto vai ficar para sempre',
  texto:
    'Penteado e maquiagem para formatura, aniversário, ensaio e festa. Sem pacote de casamento e sem prova obrigatória — é o mesmo cuidado, no formato de quem vai sair à noite.',
  itens: [
    { nome: 'Formatura', texto: 'Penteado e maquiagem no horário da colação.' },
    { nome: 'Aniversário e festa', texto: 'Produção completa para a noite.' },
    { nome: 'Ensaio fotográfico', texto: 'Cabelo e make pensados para a câmera.' },
    { nome: 'Maquiagem avulsa', texto: 'Só a make, quando o cabelo já está resolvido.' },
  ],
  /* A primeira ocupa a linha inteira e por isso é a única horizontal —
     ver o comentário no Producao.astro. */
  galeria: [
    { imagem: 'producao-maquiagem', alt: 'Maquiadora aplicando maquiagem sob luz de estúdio', legenda: 'Maquiagem para a noite' },
    { imagem: 'producao-penteado', alt: 'Penteado semipreso trançado, visto de trás', legenda: 'Semipreso trançado' },
    { imagem: 'producao-make', alt: 'Aplicação de batom em close' },
  ],
  cta: 'Falar sobre produção',
} as const;

/* ── TODOS OS SERVIÇOS ───────────────────────────────────────────────── */

/**
 * ⚠️ CONFERIR A LISTA INTEIRA. O Priorize tinha um link-in-bio com as
 * categorias escritas por eles; o Stilo não tem. Os itens abaixo saem dos
 * QUATRO destaques do perfil (Noivas, Produção, Mechas, Mega Hair) mais o que
 * é padrão em salão. Pode faltar coisa que eles fazem e pode sobrar coisa que
 * eles não fazem — é a lista mais provável de conter erro no site todo.
 */
export const servicos = {
  eyebrow: 'Serviços',
  titulo: 'Tudo o que o salão faz',
  texto:
    'Se o que você procura não estiver aqui, pergunte no WhatsApp — a lista abaixo é o que aparece com mais frequência.',
  itens: [
    { nome: 'Mechas e coloração', texto: 'Balayage, morena iluminada, loiras e cobertura de brancos.', destaque: true },
    { nome: 'Mega hair', texto: 'Aplicação, manutenção e retirada.', destaque: true },
    { nome: 'Noivas', texto: 'Dia da noiva, prova de penteado e atendimento do grupo.', destaque: true },
    { nome: 'Produção e maquiagem', texto: 'Formatura, festa e ensaio.', destaque: false },
    { nome: 'Corte', texto: 'Corte, acabamento e finalização.', destaque: false },
    { nome: 'Tratamento e hidratação', texto: 'Reconstrução e nutrição, inclusive pós-química.', destaque: false },
    /* São 7 itens numa grade de 3 colunas: o último ocuparia uma linha
       sozinho, com dois vãos vazios ao lado. Ocupando a linha inteira ele
       vira o fecho da seção em vez de sobra. */
    { nome: 'Escova e penteado', texto: 'Do dia a dia ao evento.', destaque: false, larguraCheia: true },
  ],
  imagem: 'casa-fachada',
  alt: 'Vitrine de um salão de cabeleireiro vista da calçada',
} as const;

/* ── AGENDAMENTO ─────────────────────────────────────────────────────── */

export const agendar = {
  eyebrow: 'Vamos marcar',
  titulo: 'Agende do seu jeito',
  texto:
    'Escolha o serviço, o dia que costuma dar certo pra você e o período. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pelo WhatsApp',
  mensagem: 'Olá, Stilo Cabeleireiro! Vim pelo site e gostaria de agendar um horário.',
  imagem: 'casa-salao',
  alt: 'Bancada de salão com espelho de aro iluminado',
  dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  periodos: ['Manhã', 'Tarde'],
} as const;

/**
 * Seção reservada. 554 posts e 5.945 seguidores dizem que existe gente
 * satisfeita; nada disso é depoimento com nome e autorização. O espaço fica
 * explicitamente vazio até alguém trazer os reais.
 */
export const depoimentos = {
  eyebrow: 'Quem já sentou na cadeira',
  titulo: 'O que as clientes dizem',
  placeholder: 'Os depoimentos ficarão aqui.',
  placeholderNota:
    'Um salão que atravessou quase cinco décadas tem história de cliente de sobra — só que ela está espalhada em comentário de post e conversa de cadeira. Este espaço é para trazê-la para cá, com autorização, onde fica permanente em vez de sumir no feed.',
  ctaAvaliacoes: 'Ver o Stilo no Google',
} as const;

export const visite = {
  eyebrow: 'Visite',
  titulo: 'Estamos na Avenida São Paulo',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site vai
 * ser distribuído. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'hero-salao',
} as const;
