/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * REGRA DESTE ARQUIVO: só entra o que dá para conferir nos canais públicos
 * deles (Instagram @studiopriorize_cabelos, o link-in-bio atual, a placa da
 * fachada e o perfil no Google). Nada de preço, prêmio, depoimento, tempo de
 * casa ou número de clientes inventado.
 *
 * Ver a tabela "o que é real e o que não é" no README.md.
 */

export const site = {
  nome: 'Studio Priorize',
  /** Está escrito na placa da fachada e no banner da vitrine. */
  tagline: 'Seja a sua prioridade.',
  descricao:
    'Salão de beleza e estética em Campo Mourão — PR. Cabelo, coloração, dia da noiva, estética facial e corporal, unhas.',
  cidade: 'Campo Mourão',
  estado: 'PR',

  whatsapp: '5544991756021',
  whatsappExibicao: '(44) 99175-6021',
  /** Segundo número, também na placa da fachada. */
  telefoneSecundario: '(44) 99906-6288',
  instagram: 'https://www.instagram.com/studiopriorize_cabelos',
  instagramExibicao: '@studiopriorize_cabelos',
  avaliacoesGoogle: 'https://g.page/r/Cf26lyT0JNFlEBM/review',
  maps: 'https://www.google.com/maps/search/?api=1&query=Studio+Priorize+Av.+Comendador+Norberto+Marcondes+767+Campo+Mour%C3%A3o+PR',

  endereco: 'Av. Comendador Norberto Marcondes, 767',
  bairro: 'Centro',
  cep: '87300-000',
  horarios: [
    { dias: 'Segunda a sexta', horas: '8h30 às 18h' },
    { dias: 'Sábado', horas: '8h30 às 18h' },
  ],

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no rodapé,
   * <meta name="robots" content="noindex, nofollow"> e aviso no robots.txt.
   * Virar false só se o Studio contratar e este virar o site oficial.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'O studio', href: '#studio' },
  { label: 'Cabelo', href: '#cabelo' },
  { label: 'Antes e depois', href: '#antes-depois' },
  /* "Tipos" fica fora do menu de propósito: cinco itens já é o teto para a
     barra caber sem quebrar no notebook, e a seção está logo abaixo de
     Cabelo — quem chega por lá passa por ela de qualquer jeito. */
  { label: 'Noivas', href: '#noivas' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Agendar', href: '#agendar' },
] as const;

export const hero = {
  eyebrow: 'Salão de beleza e estética · Campo Mourão — PR',
  titulo: ['Seja a sua', 'prioridade.'],
  texto:
    'Cabelo, coloração e dia da noiva no centro de Campo Mourão. Um studio inteiro pensado para você sair daqui parecendo você — só que no seu melhor dia.',
  cta: 'Agendar meu horário',
  ctaSecundario: 'Ver transformações',
  imagem: 'hero-fachada',
  alt: 'Fachada de esquina do Studio Priorize, dois andares com vitrine de vidro',
} as const;

export const marquee = [
  'Coloração',
  'Mechas e loiras',
  'Morena iluminada',
  'Corte',
  'Dia da noiva',
  'Penteado',
  'Maquiagem',
  'Estética facial',
  'Unhas',
] as const;

export const studio = {
  eyebrow: 'O studio',
  titulo: 'Dois andares no centro, e uma parede que diz a que viemos',
  paragrafos: [
    'O Studio Priorize fica na esquina da Av. Comendador Norberto Marcondes, em Campo Mourão. São dois andares de vitrine de vidro: cabelo, estética facial e corporal, unhas e uma sala reservada para noivas, tudo no mesmo endereço.',
    'As seis palavras que a equipe escolheu para trabalhar estão escritas em dois lugares: coladas na vitrine, para quem passa na calçada, e na parede da recepção, acima da prateleira de produtos. Não são decoração — são o combinado da casa.',
  ],
  /**
   * Legíveis em duas fotos independentes: as plaquinhas da vitrine
   * (`fachada-placa`) e os quadros acima da prateleira (`noiva-corpo-inteiro`,
   * onde dá para ler "Coragem" e "Sabedoria"). Ainda assim, CONFERIR a ordem
   * e se não falta nenhuma.
   */
  valores: ['Saúde', 'Coragem', 'Sabedoria', 'Respeito', 'Honra', 'Amor'],
  /* FOTO REAL — o salão de cima: fileira de cadeiras, espelhos de moldura
     trabalhada e a parede de vidro que dá para a rua. */
  imagem: 'studio-salao',
  alt: 'Salão do Studio Priorize com fileira de cadeiras, espelhos e parede de vidro',
  /** Duas fotos de apoio da fachada — é o que prova "esquina, dois andares". */
  galeria: [
    { imagem: 'fachada-esquina', alt: 'Fachada de esquina do Studio Priorize vista da calçada oposta', legenda: 'Na esquina da Comendador' },
    /* Sem legenda: a própria placa já diz o nome. Escrever "placa da fachada"
       embaixo de uma foto da placa é legendar o óbvio. */
    { imagem: 'fachada-placa', alt: 'Placa da fachada: Studio Priorize, Salão de Beleza e Estética' },
  ],
} as const;

/* ── PILAR 1 ─────────────────────────────────────────────────────────── */

export const cabelo = {
  eyebrow: 'Pilar 1 · Cabelo',
  titulo: 'Loira, morena iluminada, ruivo, cacho — sem chutar o resultado',
  texto:
    'Coloração, mechas, corte, hidratação e alisamento. Antes de qualquer química a gente olha o histórico do seu cabelo: o mesmo tom não se faz do mesmo jeito em quem já descoloriu e em quem nunca pintou.',
  itens: [
    { nome: 'Coloração e retoque de raiz', texto: 'Cobertura de brancos, mudança de tom e manutenção.' },
    { nome: 'Mechas, loiras e morena iluminada', texto: 'Balayage, luzes e reflexos com leitura do histórico do fio.' },
    { nome: 'Corte', texto: 'Corte feminino e masculino, com acabamento e finalização.' },
    { nome: 'Tratamento e hidratação', texto: 'Reconstrução e nutrição, inclusive pós-química.' },
    { nome: 'Alisamento e definição de cachos', texto: 'Do liso ao cacho definido, conforme o que o seu fio aguenta.' },
  ],
  /* FOTO REAL — ruivo acobreado em corte butterfly, visto de costas, com a
     cabeleireira erguendo o comprimento. */
  imagem: 'cabelo-butterfly',
  alt: 'Cabelo ruivo acobreado com camadas e pontas onduladas, visto de costas',
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
 * platinado destrói a confiança na hora — e quem está escolhendo cabelo repara
 * na cor antes de ler qualquer coisa. Cada linha abaixo foi conferida olhando
 * a imagem.
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
    { imagem: 'cabelo-loiro-platinado', nome: 'Loiro platinado', texto: 'Corte reto na altura do ombro', alt: 'Cabelo loiro platinado liso, corte reto na altura do ombro' },
    { imagem: 'cabelo-ruivo', nome: 'Ruivo acobreado', texto: 'Vermelho quente, comprimento liso', alt: 'Cabelo ruivo acobreado longo e liso, visto de costas' },
    { imagem: 'cabelo-vinho', nome: 'Vinho com camadas', texto: 'Borgonha com reflexos avermelhados', alt: 'Cabelo cor de vinho com camadas e reflexos avermelhados' },
    { imagem: 'cabelo-vermelho', nome: 'Vermelho vibrante', texto: 'Raiz escura e comprimento intenso', alt: 'Cabelo vermelho vibrante e liso com raiz escura' },
    { imagem: 'cabelo-cachos-grisalhos', nome: 'Cachos definidos', texto: 'Definição em cabelo grisalho', alt: 'Cachos bem definidos em cabelo grisalho' },
    { imagem: 'cabelo-corte-camadas', nome: 'Corte em camadas', texto: 'Castanho caramelo com movimento', alt: 'Corte em camadas em cabelo castanho caramelo' },
    { imagem: 'cabelo-butterfly-frente', nome: 'Corte butterfly', texto: 'Camadas curtas emoldurando o rosto', alt: 'Corte butterfly em cabelo ruivo, camadas emoldurando o rosto' },
    { imagem: 'depois-liso', nome: 'Liso e brilho', texto: 'Do frizz ao fio alinhado', alt: 'Cabelo loiro-mel longo, liso e brilhante' },
    { imagem: 'cabelo-ondas-camadas', nome: 'Ondas longas', texto: 'Escova modelada em cabelo preto', alt: 'Cabelo preto longo com ondas modeladas e camadas' },
    { imagem: 'cabelo-ondas-escuras', nome: 'Ondas definidas', texto: 'Textura natural marcada', alt: 'Cabelo escuro longo com ondas definidas' },
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
        'Cortar e repaginar',
        'Alisar ou definir o cacho',
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
    'Cortar e repaginar': {
      titulo: 'Corte com consultoria',
      texto:
        'Corte pensado junto com você, considerando rotina de finalização e o tempo que você tem de manhã.',
    },
    'Alisar ou definir o cacho': {
      titulo: 'Alisamento ou definição de cachos',
      texto:
        'Os dois caminhos exigem saber o que já foi feito no cabelo. Com o histórico em mãos a gente indica o procedimento adequado.',
    },
  },
} as const;

/*
 * A seção "Galeria de transformações" foi REMOVIDA.
 *
 * Ela existia quando o site não tinha nem o carrossel de tipos nem o
 * antes/depois. Com os dois no ar, virava a terceira seção seguida de fotos de
 * cabelo em grade — e a mais fraca das três, porque só olhava, não fazia nada.
 * O carrossel já é o portfólio (e cada foto abre o WhatsApp); o antes/depois já
 * é a prova.
 *
 * As fotos que estavam aqui não se perderam: foram redistribuídas para o
 * carrossel (`tiposCabelo`) e para os pares de `antesDepois`.
 */

/**
 * Antes e depois com divisor arrastável.
 *
 * REGRA: as duas fotos de um par têm de ser da MESMA cliente e do MESMO
 * trabalho. Um "antes" de uma pessoa com o "depois" de outra não é
 * comparação, é propaganda enganosa — e destrói a credibilidade da seção
 * inteira no primeiro comentário de quem reconhecer a cliente.
 *
 * As duas fotos precisam ter o MESMO recorte (4:5, 1080x1350). Formatos
 * diferentes fazem o rosto pular quando o divisor passa por cima.
 */
export const antesDepois = {
  eyebrow: 'Antes e depois',
  titulo: 'Arraste e veja a diferença',
  texto:
    'Duas fotos da mesma cliente, no mesmo dia: antes de sentar na cadeira e depois de terminar. Arraste a linha para atravessar de um lado ao outro.',
  /** Instrução do controle. Vale para mouse, toque e teclado. */
  dica: 'Arraste a linha · ou use as setas do teclado',
  pares: [
    {
      id: 'morena',
      antes: 'antes-morena',
      antesAlt: 'Cabelo castanho escuro muito ressecado e armado, sem forma',
      depois: 'depois-morena',
      depoisAlt: 'O mesmo cabelo com mechas caramelo e ondas definidas',
      titulo: 'Morena iluminada',
      texto: 'Mechas caramelo sem sair do castanho, com o fio recuperado.',
    },
    {
      id: 'loiro',
      antes: 'antes-loiro',
      antesAlt: 'Cabelo com raiz escura crescida e comprimento alaranjado desbotado',
      depois: 'depois-loiro',
      depoisAlt: 'O mesmo cabelo loiro claro por inteiro, com ondas',
      titulo: 'Loiro por inteiro',
      texto: 'Raiz crescida e comprimento desbotado igualados num tom só.',
    },
    {
      id: 'cachos',
      antes: 'antes-cachos',
      antesAlt: 'Cabelo cacheado escuro sem iluminação',
      depois: 'depois-cachos',
      depoisAlt: 'Os mesmos cachos com mechas caramelo distribuídas',
      titulo: 'Luzes no cacheado',
      texto: 'Iluminação respeitando o cacho — nada de alisar para clarear.',
    },
    {
      id: 'acobreado',
      antes: 'antes-acobreado',
      antesAlt: 'Cabelo castanho escuro opaco, sem brilho',
      depois: 'depois-acobreado',
      depoisAlt: 'O mesmo cabelo em castanho acobreado, liso e brilhante',
      titulo: 'Castanho acobreado',
      texto: 'Mudança de tom com brilho, sem clarear o fio inteiro.',
    },
    {
      id: 'liso',
      antes: 'antes-liso',
      antesAlt: 'Cabelo loiro-mel ondulado e com frizz',
      depois: 'depois-liso',
      depoisAlt: 'O mesmo cabelo completamente liso e alinhado',
      titulo: 'Do frizz ao liso',
      texto: 'Alisamento com o comprimento e a cor preservados.',
    },
  ],
} as const;

/* ── PILAR 2 ─────────────────────────────────────────────────────────── */

export const noivas = {
  eyebrow: 'Pilar 2 · Noivas',
  titulo: 'O dia da noiva sem relógio nas costas',
  texto:
    'Cabelo, maquiagem, unhas e prova de penteado para a noiva, as madrinhas e as mães. Monte abaixo quantas pessoas vão e a que horas é a cerimônia — a gente devolve o pedido pronto no WhatsApp.',
  itens: [
    { nome: 'Prova de penteado e maquiagem', texto: 'Antes do dia, para chegar sem surpresa.' },
    { nome: 'Dia da noiva', texto: 'Cabelo, maquiagem e unhas em sequência, no horário da cerimônia.' },
    { nome: 'Madrinhas, mães e convidadas', texto: 'Atendimento do grupo no mesmo horário.' },
    { nome: 'Pré-wedding e ensaio', texto: 'Cabelo e make para as fotos antes do casamento.' },
  ],
  /* FOTO REAL — noiva pronta de corpo inteiro na recepção do studio, com o
     véu longo estendido no chão. Ao fundo dá para ler duas das seis palavras
     da parede. É a foto que mais mostra o espaço E o trabalho ao mesmo tempo. */
  imagem: 'noiva-corpo-inteiro',
  alt: 'Noiva de vestido longo e véu estendido, pronta na recepção do studio',

  /**
   * A foto do grupo é a ÚNICA nativamente horizontal do acervo — por isso ela,
   * e só ela, ocupa o bloco largo. Também é a que melhor conta o que a seção
   * promete: o dia da noiva não é só a noiva.
   */
  destaque: {
    imagem: 'noiva-grupo',
    alt: 'Noiva, mãe e madrinhas de robe do studio brindando juntas, rindo',
    legenda: 'A noiva, a mãe e as madrinhas — todas prontas no mesmo horário',
  },

  galeria: [
    /* FOTO REAL — noiva diante do espelho, coque com arranjo e véu. */
    { imagem: 'noiva-espelho', alt: 'Noiva de vestido rendado diante do espelho, com coque e véu', legenda: 'Prova diante do espelho' },
    /* FOTO REAL — semipreso trançado com ondas, na recepção do studio. */
    { imagem: 'noiva-penteado', alt: 'Penteado semipreso trançado com ondas longas', legenda: 'Semipreso com ondas' },
    /* Sem legenda: é um retrato. "Noiva sorrindo" embaixo da foto de uma noiva
       sorrindo não acrescenta nada — a foto já disse. */
    { imagem: 'noiva-retrato', alt: 'Noiva com tiara e véu, sorrindo, segurando o buquê' },
    { imagem: 'maquiagem-dourada', alt: 'Maquiagem com esfumado dourado e brilho nos olhos', legenda: 'Maquiagem esfumada' },
    { imagem: 'maquiagem-rosa', alt: 'Maquiagem em tons de rosa com delineado marcado', legenda: 'Maquiagem em tons de rosa' },
  ],
} as const;

/** Opções do "monte seu dia da noiva". Nenhuma implica preço. */
export const montagemNoiva = {
  servicos: [
    'Cabelo da noiva',
    'Maquiagem da noiva',
    'Unhas da noiva',
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

/* ── TODOS OS SERVIÇOS ───────────────────────────────────────────────── */

/** As sete categorias são as que eles mesmos listam no link-in-bio atual. */
export const servicos = {
  eyebrow: 'Serviços',
  titulo: 'Tudo o que o studio faz',
  texto:
    'Os dois andares atendem bem mais do que cabelo e noivas. Se o que você procura não estiver aqui, pergunte no WhatsApp.',
  itens: [
    { nome: 'Cabelo', texto: 'Corte, coloração, mechas, hidratação e alisamento.', destaque: true },
    { nome: 'Noivas e madrinhas', texto: 'Dia da noiva, prova de penteado e horário reservado.', destaque: true },
    { nome: 'Estética facial', texto: 'Limpeza de pele, hidratação facial e revitalização.', destaque: false },
    { nome: 'Estética corporal e massagem', texto: 'Massagem relaxante, drenagem e cuidado de corpo.', destaque: false },
    { nome: 'Unhas · mãos e pés', texto: 'Manicure, pedicure e esmaltação em gel.', destaque: false },
    { nome: 'Skin care e loja', texto: 'Produtos profissionais indicados para a sua pele.', destaque: false },
    /* São 7 itens numa grade de 3 colunas: o último ocuparia uma linha
       sozinho, com dois vãos vazios ao lado. Ocupando a linha inteira ele
       vira o fecho da seção em vez de sobra. */
    { nome: 'Promoções do mês', texto: 'Condições especiais e combos combinados na hora.', destaque: false, larguraCheia: true },
  ],
  /* FOTO REAL — a esquina vista da calçada oposta, com os dois andares. */
  imagem: 'fachada-esquina',
  alt: 'Fachada de esquina do Studio Priorize, dois andares com vitrine de vidro',
} as const;

/* ── AGENDAMENTO ─────────────────────────────────────────────────────── */

export const agendar = {
  eyebrow: 'Vamos marcar',
  titulo: 'Agende do seu jeito',
  texto:
    'Escolha o serviço, o dia que costuma dar certo pra você e o período. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pelo WhatsApp',
  mensagem: 'Olá, Studio Priorize! Vim pelo site e gostaria de agendar um horário.',
  /* Fica atrás de um véu a 92%: é textura de fundo, não assunto. Por isso
     uma foto ampla do interior serve melhor que um detalhe. */
  imagem: 'studio-salao',
  alt: 'Salão do Studio Priorize com fileira de cadeiras e espelhos',
  dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  periodos: ['Manhã', 'Tarde'],
} as const;

/**
 * Seção reservada. Diferente dos outros protótipos, aqui existe fonte real:
 * eles têm perfil no Google com avaliações. Enquanto elas não forem
 * transcritas com autorização, o espaço fica explicitamente vazio.
 */
export const depoimentos = {
  eyebrow: 'Quem já sentou na cadeira',
  titulo: 'O que as clientes dizem',
  placeholder: 'Os depoimentos ficarão aqui.',
  placeholderNota:
    'O Studio Priorize já tem avaliações reais no perfil do Google. Este espaço é para elas — trazidas para cá com autorização, onde ficam permanentes, em vez de sumirem no feed.',
  ctaAvaliacoes: 'Ver as avaliações no Google',
} as const;

export const visite = {
  eyebrow: 'Visite',
  titulo: 'Estamos na esquina da Comendador',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site vai
 * ser distribuído. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'hero-fachada',
} as const;
