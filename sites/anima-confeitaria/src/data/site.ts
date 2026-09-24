/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * ══════════════════════════════════════════════════════════════════════
 * REGRA DESTE ARQUIVO
 * ══════════════════════════════════════════════════════════════════════
 * Só entra o que dá para conferir nos canais públicos deles (Instagram
 * @animaconfeitaria e o perfil no Google Maps). Nada de preço, prêmio,
 * tempo de casa ou depoimento inventado.
 *
 * ⚠️ ELES NÃO PUBLICAM PREÇO. Isso não é esquecimento — é o modelo de
 * negócio: docinho de festa e bolo de casamento são orçados por evento
 * (quantidade, data, sabor, montagem). Por isso o site NÃO tem cardápio
 * com valores, e sim um montador de pedido que leva a conversa pronta ao
 * WhatsApp. Inventar preço aqui seria o pior erro possível.
 */

export const site = {
  nome: 'Ânima Confeitaria',
  nomeCompleto: 'Ânima Confeitaria Artesanal',
  tagline: 'Doce feito à mão, do jeito que a sua festa pede.',
  descricao:
    'Confeitaria artesanal em Maringá — PR. Bolos de casamento e aniversário, docinhos de festa, mesas montadas e lembrancinhas, tudo feito à mão sob encomenda.',
  cidade: 'Maringá',
  estado: 'PR',

  /** Está na legenda dos posts: "orçamento conosco pelo whatsapp 44 999510811". */
  whatsapp: '5544999510811',
  whatsappExibicao: '(44) 99951-0811',

  instagram: 'https://www.instagram.com/animaconfeitaria',
  instagramExibicao: '@animaconfeitaria',

  endereco: 'Av. Lucílio de Held, 485',
  bairro: 'Jardim Alvorada',
  cep: '87033-230',
  maps: 'https://www.google.com/maps/search/?api=1&query=%C3%82nima+Confeitaria+Artesanal+Av.+Lucilio+de+Held+485+Jardim+Alvorada+Maring%C3%A1+PR',

  /**
   * ⚠️ CONFERIR — horário de funcionamento NÃO confirmado. Deixado fora do
   * site de propósito: é melhor não dizer do que dizer errado e a cliente
   * chegar na porta fechada. Quando souber, acrescente aqui e a seção
   * "Onde ficamos" passa a mostrar.
   */
  horarios: [] as { dias: string; horas: string }[],

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no
   * rodapé, <meta name="robots" content="noindex, nofollow"> e aviso no
   * robots.txt. Virar false só se a confeitaria contratar.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'A confeitaria', href: '#sobre' },
  { label: 'O que fazemos', href: '#fazemos' },
  { label: 'Trabalhos', href: '#trabalhos' },
  { label: 'Como encomendar', href: '#como' },
  { label: 'Orçamento', href: '#orcamento' },
] as const;

export const hero = {
  eyebrow: 'Confeitaria artesanal · Maringá — PR',
  /* Uma linha por <span>: é o que permite a entrada linha a linha sem
     plugin de split. Mexeu aqui? A animação acompanha sozinha. */
  titulo: ['Cada doce', 'sai da mão', 'de alguém'],
  texto:
    'Bolos de casamento, docinhos de festa e lembrancinhas feitos por encomenda, um a um. Sem forma industrial, sem congelado — o que sai daqui foi montado para a sua data.',
  cta: 'Pedir um orçamento',
  ctaSecundario: 'Ver os trabalhos',
  imagem: 'destaque-bolo-casamento',
  alt: 'Bolo de casamento branco de cinco andares com flores brancas, diante de uma janela com vista para a mata',
} as const;

/** Faixa rolante. Só o que aparece no Instagram deles. */
export const marquee = [
  'Bolos de casamento',
  'Docinhos de festa',
  'Mesas montadas',
  'Bolos de aniversário',
  'Pão de mel',
  'Palha italiana',
  'Cupcakes',
  'Lembrancinhas',
  'Bombons recheados',
] as const;

/* ── A CONFEITARIA ───────────────────────────────────────────────────── */

export const sobre = {
  eyebrow: 'A confeitaria',
  titulo: 'Artesanal não é palavra de enfeite',
  paragrafos: [
    'A Ânima é uma confeitaria artesanal do Jardim Alvorada, em Maringá. Cada bolo é montado inteiro na casa e cada docinho é enrolado à mão — não há linha de produção nem massa pronta.',
    'É por isso que tudo aqui é por encomenda: a quantidade, o sabor e a decoração são combinados antes, para a data que você marcou.',
  ],
  /**
   * Três números que dizem "artesanal" sem inventar estatística. Nenhum é
   * quantidade de clientes, ano de fundação ou nota de avaliação — nada
   * disso foi confirmado.
   */
  destaques: [
    { rotulo: 'Feito', texto: 'Um a um, à mão' },
    { rotulo: 'Quando', texto: 'Sob encomenda, para a sua data' },
    { rotulo: 'Onde', texto: 'Jardim Alvorada, Maringá' },
  ],
  imagem: 'destaque-mesa-flores',
  alt: 'Mesa de doces com arranjos de flores brancas e roxas em primeiro plano',
} as const;

/* ── O QUE FAZEMOS ───────────────────────────────────────────────────── */

/**
 * ⚠️ SEM PREÇO, DE PROPÓSITO. Ver a nota no topo do arquivo.
 *
 * Cada categoria puxa uma foto e abre o WhatsApp com o assunto já escrito.
 * É o que substitui o cardápio: em vez de um valor que não existe, a
 * pessoa manda a pergunta certa.
 */
export const fazemos = {
  eyebrow: 'O que fazemos',
  titulo: 'Da festa de dez pessoas ao casamento',
  texto:
    'Toque em qualquer um para já abrir a conversa com o assunto escrito — você só completa a data e a quantidade.',
  itens: [
    {
      id: 'casamento',
      nome: 'Bolos de casamento',
      texto: 'Vários andares, decoração combinada com o arranjo e a cor da festa.',
      imagem: 'bolo-casamento-alto',
      alt: 'Bolo de casamento branco de cinco andares com flores brancas',
    },
    {
      id: 'aniversario',
      nome: 'Bolos de aniversário',
      texto: 'Tema livre, do infantil ao adulto — inclusive os personalizados.',
      imagem: 'bolo-tematico',
      alt: 'Bolo decorado em formato de barril de madeira, com topo personalizado',
    },
    {
      id: 'docinhos',
      nome: 'Docinhos de festa',
      texto: 'Brigadeiro, beijinho, bombom recheado e as variações da casa.',
      imagem: 'docinhos-sortidos',
      alt: 'Bandeja redonda de beijinhos de coco ao lado de docinhos em forminhas roxas',
    },
    {
      id: 'mesa',
      nome: 'Mesas montadas',
      texto: 'A mesa inteira pensada junto: bolo, doces, bandejas e arranjo.',
      imagem: 'mesa-montada',
      alt: 'Mesa de doces rústica com brigadeiros e bandejas sobre madeira',
    },
    {
      id: 'lembrancinhas',
      nome: 'Lembrancinhas',
      texto: 'Pão de mel, pirulito de chocolate, palha italiana e caixinhas.',
      imagem: 'lembrancinhas',
      /* A foto disponível é de Natal — Papai Noel e boneco de neve em pão
         de mel. Serve para mostrar o acabamento, mas é sazonal: se o site
         for ao ar fora de dezembro, vale pedir uma foto de lembrancinha de
         casamento ou aniversário para substituir. */
      alt: 'Pães de mel decorados com Papai Noel e boneco de neve, embalados com fita',
    },
    {
      id: 'bombons',
      nome: 'Bombons recheados',
      texto: 'Casquinha de chocolate com recheio cremoso, feitos um a um.',
      imagem: 'bombons',
      alt: 'Bombom de chocolate partido ao meio, mostrando o recheio cremoso',
    },
  ],
} as const;

/* ── TRABALHOS ───────────────────────────────────────────────────────── */

/**
 * Galeria.
 *
 * ⚠️ A CONTA DAS COLUNAS IMPORTA: numa grade de 3, tile normal ocupa 1 e
 * largo ocupa 2. O total precisa ser múltiplo de 3 ou sobra vão.
 * Hoje: 3 normais = 3 = uma linha cheia.
 *
 * `formato: 'largo'` ocupa duas colunas e usa 16/10 — só para fotos
 * NATIVAMENTE horizontais. Não há nenhuma aqui de propósito: as três
 * escolhidas são de bolo e mesa, e esticá-las num bloco largo cortaria o
 * topo do bolo, que é justamente onde está o trabalho.
 */
export const trabalhos = {
  eyebrow: 'Trabalhos',
  titulo: 'O que já saiu daqui',
  texto:
    'Festas e casamentos reais, feitos para clientes de Maringá e região.',
  itens: [
    { imagem: 'trabalho-bolo-rosas', alt: 'Bolo semi-naked decorado com rosas vermelhas e flores brancas', legenda: 'Bolo com rosas naturais', formato: 'normal' },
    { imagem: 'trabalho-festa-infantil', alt: 'Mesa de festa infantil com bolo temático de estrelas e docinhos', legenda: 'Festa infantil', formato: 'normal' },
    /* Sem legenda: a foto mostra docinhos finos em forminha, e escrever
       "docinhos" embaixo de uma foto de docinhos não acrescenta nada. */
    { imagem: 'trabalho-docinhos-finos', alt: 'Bandeja de docinhos finos com cobertura, em forminhas rendadas', legenda: '', formato: 'normal' },
  ],
} as const;

/* ── COMO ENCOMENDAR ─────────────────────────────────────────────────── */

/**
 * Esta seção existe por causa da ausência de preço.
 *
 * Quando não há tabela, a dúvida da cliente deixa de ser "quanto custa" e
 * passa a ser "como é que funciona, e será que ainda dá tempo". Explicar o
 * caminho tira o atrito melhor do que qualquer número tiraria.
 *
 * ⚠️ O PRAZO É O ÚNICO DADO SENSÍVEL AQUI e NÃO foi confirmado com eles.
 * Está escrito de forma deliberadamente vaga ("com antecedência") em vez
 * de "15 dias" — prometer prazo que não é o deles é o tipo de erro que
 * queima a confiança logo na primeira encomenda.
 */
export const como = {
  eyebrow: 'Como encomendar',
  titulo: 'Três passos, e nenhum formulário longo',
  passos: [
    {
      numero: '01',
      nome: 'Conte o que é',
      texto: 'A data, mais ou menos quantas pessoas e o tipo de festa. Se já tiver uma referência, melhor ainda.',
    },
    {
      numero: '02',
      nome: 'A gente combina',
      texto: 'Sabor, decoração e quantidade, com o orçamento fechado antes de qualquer coisa começar.',
    },
    {
      numero: '03',
      nome: 'Fica pronto no dia',
      texto: 'Você retira ou a gente combina a entrega e a montagem da mesa.',
    },
  ],
  nota: 'Encomendas com antecedência — datas de fim de semana e época de formatura costumam fechar primeiro.',
} as const;

/* ── ORÇAMENTO ───────────────────────────────────────────────────────── */

export const orcamento = {
  eyebrow: 'Orçamento',
  titulo: 'Monte o seu pedido',
  texto:
    'Marque o que você precisa e diga a data. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pelo WhatsApp',
  mensagem: 'Olá, Ânima! Vim pelo site e gostaria de fazer um orçamento.',
  imagem: 'destaque-mesa-flores',
  alt: 'Mesa de doces com arranjos de flores',

  ocasioes: ['Casamento', 'Aniversário', 'Formatura', 'Chá de bebê', 'Festa de empresa', 'Outra ocasião'],
  /** Os mesmos itens de `fazemos`, para a pessoa marcar mais de um. */
  itens: [
    'Bolo',
    'Docinhos',
    'Mesa montada',
    'Lembrancinhas',
    'Bombons recheados',
    'Ainda não sei',
  ],
  /** Faixas em vez de número exato: quase ninguém sabe o total no primeiro contato. */
  convidados: ['Até 30', '30 a 60', '60 a 100', '100 a 200', 'Mais de 200'],
  anosAFrente: 2,
  meses: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ],
} as const;

export const visite = {
  eyebrow: 'Onde ficamos',
  titulo: 'No Jardim Alvorada',
  texto: 'Encomendas por WhatsApp. Combine a retirada ou a entrega junto do pedido.',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site vai
 * ser distribuído. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'destaque-bolo-casamento',
} as const;
