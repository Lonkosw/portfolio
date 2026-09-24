/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * é o suficiente para atualizar o site inteiro, sem mexer em componente.
 *
 * REGRA DESTE ARQUIVO: só entra o que dá para conferir nos canais públicos
 * deles (Instagram @recantoparaisomaringa, ficha no casamentos.com.br,
 * endereço no Google Maps). Nada de preço, prêmio, depoimento ou número
 * inventado. Os campos de origem secundária estão marcados com CONFERIR.
 *
 * Ver a tabela "o que é real e o que não é" no README.md.
 */

export const site = {
  nome: 'Recanto Paraíso',
  descricao:
    'Espaço para casamentos, festas e eventos corporativos em Maringá — PR. Cerimônia ao ar livre no jardim e recepção em salão com lustres de cristal.',
  cidade: 'Maringá',
  estado: 'PR',

  whatsapp: '5544998144914',
  whatsappExibicao: '(44) 99814-4914',
  instagram: 'https://www.instagram.com/recantoparaisomaringa',
  instagramExibicao: '@recantoparaisomaringa',
  maps: 'https://www.google.com/maps/search/?api=1&query=Recanto+Para%C3%ADso+Av.+Morangueira+5705+Maring%C3%A1+PR',
  endereco: 'Av. Morangueira, 5705 — Jd. Novo Alvorada',
  /** Partes separadas porque os dados estruturados (JSON-LD) exigem assim. */
  logradouro: 'Av. Morangueira, 5705',
  bairro: 'Jd. Novo Alvorada',
  cep: '87035-060',
  atendimento: 'Visitas ao espaço com agendamento pelo WhatsApp',

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no rodapé,
   * <meta name="robots" content="noindex, nofollow"> e o aviso no robots.txt.
   * Virar false só se o Recanto contratar e o site passar a ser o oficial.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'O lugar', href: '#sobre' },
  { label: 'Estrutura', href: '#estrutura' },
  { label: 'O espaço', href: '#espaco' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Orçamento', href: '#orcamento' },
] as const;

export const hero = {
  eyebrow: 'Espaço para eventos · Maringá — PR',
  titulo: ['Sua festa', 'no meio', 'do verde'],
  texto:
    'Cerimônia ao ar livre no jardim e recepção no salão de cristal, no mesmo endereço. Casamentos, festas de 15 anos, eventos corporativos e ensaios fotográficos.',
  cta: 'Montar meu evento',
  ctaSecundario: 'Conhecer o espaço',
  /**
   * Foto de abertura. É a única do acervo que mostra o espaço INTEIRO de
   * fora — salão de vidro, piscina e mata em volta no mesmo quadro. Todas as
   * outras estão dentro de um evento e mostram um pedaço.
   */
  imagem: 'hero-salao-vidro',
  alt: 'Salão de vidro e madeira iluminado ao entardecer, com a piscina em primeiro plano',
} as const;

export const marquee = [
  'Casamentos',
  'Festas de 15 anos',
  'Aniversários',
  'Eventos corporativos',
  'Bodas',
  'Ensaios fotográficos',
  'Cerimônia ao ar livre',
] as const;

export const sobre = {
  eyebrow: 'O lugar',
  titulo: 'Um jardim inteiro, e o salão logo ali',
  paragrafos: [
    'O Recanto Paraíso é um espaço de eventos na Av. Morangueira, em Maringá. O jardim, com árvores altas e lago, recebe a cerimônia ao ar livre; a poucos passos, o salão de madeira e vidro, com lustres de cristal, recebe a recepção. Ninguém precisa pegar o carro entre uma coisa e outra.',
    'A estrutura é preparada para receber o buffet e a decoração da sua preferência: cozinha completa, cozinha de frios climatizada e sala de apoio. Você monta o evento do seu jeito, no espaço já pronto.',
  ],
  destaque: 'Cerimônia e recepção no mesmo endereço',
  /** CONFERIR: capacidade de fonte secundária (ficha no casamentos.com.br). */
  numeros: [{ valor: 160, sufixo: '', label: 'convidados no salão' }],
  /**
   * A foto que mais literalmente ilustra o título: o jardim escuro na frente
   * e o salão aceso logo atrás, no mesmo quadro. É a única do acervo que
   * mostra os dois ambientes juntos.
   */
  imagem: 'noiva-jardim-noite',
  alt: 'Noiva com o buquê no jardim à noite, com o salão iluminado ao fundo',
} as const;

/**
 * Só entram itens observáveis nas fotos públicas ou descritos na ficha oficial.
 * Estacionamento, gerador, camarim e playground FICARAM DE FORA de propósito:
 * não foram confirmados. Se a Rosane confirmar, é só acrescentar aqui.
 */
export const estrutura = {
  eyebrow: 'Estrutura',
  titulo: 'O que já está de pé quando você chega',
  texto:
    'Tudo o que o espaço oferece, sem letra miúda. O que não estiver nesta lista, é só perguntar pelo WhatsApp.',
  itens: [
    {
      nome: 'Salão para 160 convidados',
      texto: 'Pé-direito alto em madeira, fechamento de vidro e lustres de cristal.',
    },
    {
      nome: 'Jardim para cerimônia ao ar livre',
      texto: 'Gramado, árvores altas e lago — preparado para receber a decoração dos noivos.',
    },
    {
      nome: 'Cozinha completa',
      texto: 'Pronta para receber o buffet da sua preferência, sem exclusividade.',
    },
    {
      nome: 'Cozinha de frios climatizada',
      texto: 'Ambiente separado e refrigerado para a montagem das mesas frias.',
    },
    {
      nome: 'Sala de apoio climatizada',
      texto: 'Espaço reservado para a equipe, os fornecedores e os preparativos.',
    },
    {
      nome: 'Área de piscina',
      texto: 'Deck e piscina integrados ao salão de vidro — cenário das fotos ao entardecer.',
    },
  ],
} as const;

export const galeria = {
  eyebrow: 'O espaço',
  titulo: 'De dia, de noite, montado do seu jeito',
  texto:
    'O mesmo lugar muda completamente conforme a decoração e o horário. Estes são eventos reais que já aconteceram aqui.',
  /**
   * SEM LEGENDA. Uma galeria de espaço de eventos não precisa explicar o que
   * a foto mostra — quem olha está avaliando se o lugar é bonito, não lendo
   * um catálogo. A legenda também obrigava a escrever nove frases sobre
   * fotos que já dizem tudo, e cada frase dessas é uma chance de descrever
   * errado uma foto que não é minha. O `alt` continua, para leitor de tela.
   *
   * `formato: 'largo'` ocupa duas colunas e usa proporção 16/10 — só para
   * fotos NATIVAMENTE horizontais. Foto de Instagram vem em 1:1 ou 4:5;
   * esticar uma vertical num bloco largo corta cabeça e destrói o
   * enquadramento original.
   *
   * ⚠️ A CONTA DE TILES É FRÁGIL: 4 largos (2 células cada) + 4 normais = 12
   * células, que fecha exato em 3 colunas (4 linhas) E em 2 colunas (6
   * linhas). Acrescentar uma foto solta abre buraco numa das duas larguras.
   * Se entrar foto nova, entra em par — ou a conta tem de ser refeita.
   */
  itens: [
    { imagem: 'jardim-poente', alt: 'Casal no gramado ao pôr do sol, com o lago ao fundo', formato: 'largo' },
    { imagem: 'arco-casal-noite', alt: 'Casal sob o arco de flores iluminado à noite', formato: 'normal' },
    { imagem: 'salao-mesas-verde', alt: 'Salão montado com mesas redondas, cadeiras de madeira e louça verde', formato: 'largo' },
    { imagem: 'ponte-lago', alt: 'Casal na ponte de madeira sobre o lago do jardim', formato: 'normal' },
    { imagem: 'mesa-do-bolo', alt: 'Mesa do bolo com arranjos de flores e cortina de luzes ao fundo', formato: 'largo' },
    { imagem: 'arco-noiva-noite', alt: 'Noiva sob o arco iluminado no jardim, à noite', formato: 'normal' },
    { imagem: 'salao-festa-noite', alt: 'Salão durante a festa à noite, sob os lustres de cristal', formato: 'largo' },
    { imagem: 'making-of-jardim', alt: 'Preparativos da noiva no jardim, sob o arco', formato: 'normal' },
  ],
} as const;

/**
 * O vídeo do salão montado — 8 segundos, sem som, girando por cima da mesa
 * imperial. É o único material em movimento do acervo, e é ele que mostra o
 * tamanho do salão: foto parada de mesa comprida sempre parece menor.
 *
 * `arquivo` mora em `public/video/` (e NÃO em `src/assets/`): o Astro não
 * otimiza vídeo, então passar pelo pipeline de assets só renomearia o
 * arquivo. As medidas são as do arquivo depois do corte do adesivo de
 * story — estão aqui para o CSS reservar a caixa e não haver salto.
 */
export const video = {
  eyebrow: 'Em movimento',
  titulo: 'O salão montado, por dentro',
  /**
   * ⚠️ NÃO escrever "é a mesma mesa das fotos": o vídeo é de OUTRO evento —
   * mesa imperial comprida, cadeiras de fibra, arranjos brancos e verdes —
   * e as fotos do salão são de mesas redondas. Quem recebe a proposta é a
   * dona do espaço: ela reconhece cada festa e cada mentirinha.
   */
  texto:
    'Oito segundos, sem som, no dia de um casamento. Foto parada de mesa comprida sempre parece menor do que é.',
  arquivo: '/video/salao-montado.mp4',
  poster: 'salao-montado-poster',
  largura: 720,
  altura: 1164,
  alt: 'Vídeo percorrendo a mesa imperial montada no salão, sob os lustres de cristal',
} as const;

/**
 * ⚠️ O ACERVO É 100% CASAMENTO. Todas as fotos públicas deles são de casório,
 * e esta seção fala de quatro tipos de evento. Por isso os três cartões que
 * NÃO são casamento usam as duas únicas fotos sem noiva à vista — o salão
 * montado e vazio, e o espaço visto de fora. Pôr uma noiva no cartão de
 * "15 anos" seria a primeira coisa que a Rosane notaria.
 *
 * Assim que ela mandar foto de 15 anos, de confraternização ou de ensaio, é
 * trocar o nome aqui. O resto do cartão não muda.
 */
export const eventos = {
  eyebrow: 'Eventos',
  titulo: 'Cabe muito mais que casamento',
  itens: [
    {
      nome: 'Casamento',
      texto: 'Cerimônia no jardim e recepção no salão, sem deslocar ninguém.',
      imagem: 'jardim-poente',
      alt: 'Casal no gramado ao pôr do sol',
    },
    {
      nome: '15 anos e aniversários',
      texto: 'Salão fechado e climatizado, com pista, ou o jardim iluminado do lado de fora.',
      imagem: 'salao-mesas-verde',
      alt: 'Salão montado com mesas redondas e cadeiras de madeira',
    },
    {
      nome: 'Corporativo',
      texto: 'Confraternizações, jantares e encontros de empresa com estrutura de apoio.',
      imagem: 'hero-salao-vidro',
      alt: 'Salão de vidro visto de fora ao entardecer, com a piscina',
    },
    {
      nome: 'Ensaio fotográfico',
      texto: 'O espaço também é alugado só para ensaios: pré-wedding, gestante, família e catálogo.',
      imagem: 'making-of-jardim',
      alt: 'Ensaio no jardim, sob o arco',
    },
  ],
} as const;

export const processo = {
  eyebrow: 'Como funciona',
  titulo: 'Do primeiro oi à última música',
  etapas: [
    {
      numero: '01',
      titulo: 'Chame no WhatsApp',
      texto:
        'Conte o tipo de evento, a data que você tem em mente e quantos convidados espera. Se preferir, monte tudo aqui no site e envie de uma vez.',
    },
    {
      numero: '02',
      titulo: 'Venha conhecer',
      texto:
        'A visita é agendada e vale a pena: foto nenhuma dá conta do tamanho do jardim. Dá para ver o salão montado quando há evento próximo.',
    },
    {
      numero: '03',
      titulo: 'Reserve a data',
      texto:
        'Confirmada a reserva, a data é sua. A partir daí você organiza buffet, decoração e fornecedores com quem preferir — o espaço não exige exclusividade.',
    },
    {
      numero: '04',
      titulo: 'O dia do evento',
      texto:
        'A estrutura já está de pé: cozinha, sala de apoio e ambientes prontos para receber a sua equipe de fornecedores.',
    },
  ],
} as const;

/**
 * Seção reservada. Nada de depoimento inventado: enquanto o Recanto não
 * mandar as avaliações reais, o espaço fica explicitamente vazio.
 */
export const depoimentos = {
  eyebrow: 'Quem casou aqui',
  titulo: 'O que os noivos dizem',
  placeholder: 'Os depoimentos ficarão aqui.',
  placeholderNota:
    'Espaço reservado para as avaliações reais dos clientes do Recanto Paraíso — as mesmas que já são publicadas no Instagram como "Feedback" e somem do feed em poucos dias. Aqui elas ficam.',
} as const;

export const orcamento = {
  eyebrow: 'Vamos conversar',
  titulo: 'Monte seu evento',
  texto:
    'Escolha o tipo de evento, o tamanho e quando você quer. A gente monta a mensagem pronta e você envia pelo WhatsApp — sem formulário, sem cadastro, sem esperar e-mail.',
  cta: 'Enviar pelo WhatsApp',
  /** Mensagem usada quando o visitante não montou nada no simulador. */
  mensagem:
    'Olá, Recanto Paraíso! Vim pelo site e gostaria de saber sobre disponibilidade de data e valores.',
  /** Foto própria: usar a mesma do hero ou do "O lugar" deixaria a página repetitiva. */
  imagem: 'salao-festa-noite',
  alt: 'Salão iluminado por dentro durante uma festa à noite',
} as const;

/** Opções do simulador. Nenhuma delas implica preço — só monta o pedido. */
export const simulador = {
  tipos: [
    'Casamento',
    'Festa de 15 anos',
    'Aniversário',
    'Evento corporativo',
    'Bodas',
    'Ensaio fotográfico',
  ],
  meses: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ],
  /** Quantos anos à frente o seletor oferece, a partir do ano do build. */
  anosAFrente: 2,
  periodos: ['Diurno', 'Noturno'],
  jaTenho: ['Buffet', 'Decoração', 'DJ / som', 'Fotografia', 'Cerimonialista'],
  convidadosPadrao: 120,
  convidadosMin: 20,
  convidadosMax: 160,
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é exatamente como este
 * site vai ser distribuído. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'hero-salao-vidro',
} as const;
