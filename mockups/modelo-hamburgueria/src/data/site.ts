/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * ⚠️ MOCKUP GENÉRICO PARA DISPARO EM VOLUME, não case de uma hamburgueria
 * real (decisão do Théo, 15/09/2026 — nicho de teste do dia, junto com
 * piscina, estética automotiva e academia). Nome, endereço e depoimentos
 * são placeholder de propósito: este arquivo é o alvo do
 * `tools/gerar-site-lead.mjs`, que troca nome/telefone/endereço por lead
 * antes do disparo.
 *
 * As fotos são banco de imagem sem marca (Pexels) e o vídeo do hero é
 * cinematográfico genérico (giro macro num hambúrguer, sem letreiro nem
 * embalagem de nenhum estabelecimento) — ver README para a origem.
 *
 * NADA DE PREÇO: cardápio mostra nome e descrição, o valor sai no
 * WhatsApp — mesma regra dos outros mockups da pasta.
 */

export const site = {
  nome: 'Bendito Burger',
  tagline: 'Modelo de site para hamburgueria.',
  descricao:
    'Modelo demonstrativo de site para hamburgueria: cardápio em destaque, pedido pelo WhatsApp, avaliação do Google e localização — tudo em uma página só.',
  cidade: 'Sua cidade',
  estado: 'PR',

  /** ⚠️ PLACEHOLDER — trocar pelo WhatsApp do Théo antes de disparar. */
  whatsapp: '5544000000000',
  whatsappExibicao: '(00) 00000-0000',
  instagram: 'https://www.instagram.com/',
  instagramExibicao: '@suahamburgueria',

  endereco: 'Rua da sua hamburgueria, 000',
  bairro: 'Centro',
  cep: '00000-000',
  maps: 'https://www.google.com/maps',
  avaliacoesGoogle: 'https://www.google.com/maps',

  /** ⚠️ NÚMEROS DE EXEMPLO, redondos de propósito — ver nota no modelo-b
      sobre por que não emprestar a nota real de nenhum negócio existente. */
  google: {
    nota: '4,8',
    avaliacoes: 210,
    lido: 'exemplo',
  },

  horarios: [
    { dias: 'Terça a domingo', horas: '18h30 às 23h30' },
    { dias: 'Segunda', horas: 'Fechado' },
  ],

  /** Fica `true` para sempre neste arquivo. */
  demo: true,
} as const;

export const nav = [
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'O ambiente', href: '#ambiente' },
  { label: 'Avaliações', href: '#depoimentos' },
  { label: 'Pedir', href: '#pedir' },
] as const;

/* ── HERO ──────────────────────────────────────────────────────────────
 * Vídeo em loop de 8s como primeira coisa vista — pedido explícito do
 * Théo. Tela cheia, texto sobreposto, sem coluna de foto ao lado (esse é
 * o Hero do modelo-b; este é um componente novo, ver Hero.astro). */
export const heroVideo = {
  eyebrow: 'Hamburgueria artesanal · modelo demonstrativo',
  titulo: ['Pão selado.', 'Carne no ponto.'],
  texto:
    'Este é um modelo de site para hamburgueria. No seu, entram o seu nome, o seu cardápio e as suas fotos — com pedido direto pelo WhatsApp, sem taxa de aplicativo.',
  cta: 'Pedir pelo WhatsApp',
  ctaSecundario: 'Ver cardápio',
  /** Vídeo em `public/video/`, com poster de fallback (LCP + reduced-motion). */
  video: '/video/hero-hamburgueria.mp4',
  videoWebm: '/video/hero-hamburgueria.webm',
  poster: 'hero-poster',
  alt: 'Hambúrguer artesanal em giro macro, close no pão brioche com gergelim',
} as const;

export const marquee = [
  'Smash burger',
  'Cheddar duplo',
  'Bacon crocante',
  'Pão brioche',
  'Molho da casa',
  'Batata rústica',
  'Delivery e retirada',
  'Combo com bebida',
  'Blend artesanal',
  'Cebola caramelizada',
] as const;

/* ── CARDÁPIO EM DESTAQUE ──────────────────────────────────────────────
 * 3 itens de assinatura. Cada um abre o WhatsApp com o nome já escrito —
 * o preço sai de lá, nunca publicado (mesma regra do modelo-b). */
export const cardapio = {
  eyebrow: 'Cardápio',
  titulo: 'Os pedidos que mais saem',
  texto:
    'Três itens de exemplo — no seu site, entra o seu cardápio de verdade, com as suas fotos e os seus nomes. Ao tocar em um, o WhatsApp abre com o pedido já escrito.',
  itens: [
    {
      nome: 'Clássico da casa',
      texto: 'Pão brioche, blend 160g, queijo cheddar, picles e molho da casa.',
      imagem: 'burger-fundo-escuro',
      alt: 'Hambúrguer artesanal em fundo escuro, com cheddar derretido e cebola caramelizada',
    },
    {
      nome: 'Duplo bacon',
      texto: 'Dois blends de 120g, queijo, bacon crocante e maionese defumada.',
      imagem: 'burger-classico',
      alt: 'Hambúrguer artesanal com pão de gergelim, alface e tomate, servido em prato branco com batata frita',
    },
    {
      nome: 'Batata rústica',
      texto: 'Batata rústica com casca, temperada e servida na hora.',
      imagem: 'batata-frita',
      alt: 'Batata frita rústica temperada, servida em cesto',
    },
  ],
} as const;

/* ── O AMBIENTE ────────────────────────────────────────────────────────
 * Galeria do espaço físico — só entra se o negócio tiver salão para comer
 * no local (Théo confirmou que sim, além do delivery). */
export const ambiente = {
  eyebrow: 'O ambiente',
  titulo: 'Pra comer lá ou pedir pra casa',
  paragrafos: [
    'Este bloco existe para mostrar o espaço por dentro — é o que responde à pergunta que todo cliente novo faz antes de decidir: "dá pra comer lá, ou só delivery?".',
    'As fotos aqui são de banco, para o modelo não ficar vazio. No seu site, entram as do seu espaço de verdade.',
  ],
  valores: ['Ambiente descontraído', 'Delivery e retirada', 'Ingredientes frescos'],
  imagem: 'restaurante-interior',
  alt: 'Interior de restaurante com parede de tijolo aparente, mesas de madeira e luminárias industriais',
} as const;

/* ── DEPOIMENTOS ───────────────────────────────────────────────────────
 * Exemplos, não mensagens reais — mesma regra do modelo-b: emprestar a
 * prova social de um negócio real para vender aos concorrentes dele não
 * é aceitável. Aqui os balões demonstram o RECURSO. */
export const depoimentos = {
  eyebrow: 'Quem já pediu',
  titulo: 'O que chega no WhatsApp',
  texto:
    'As mensagens que os clientes mandam depois do pedido podem virar esta seção. Os balões abaixo são exemplos — no seu site, entram as conversas de verdade, com autorização de quem escreveu.',
  conversa: [
    {
      id: 'exemplo-sabor',
      mensagens: [
        'Cara, o duplo bacon é surreal. Melhor burger que comi na cidade.',
      ],
      contexto: 'exemplo · depois do delivery',
    },
    {
      id: 'exemplo-entrega',
      mensagens: [
        'Chegou quentinho e rápido, uns 25 minutos.',
        'Já virou pedido de sexta-feira aqui em casa 🍔',
      ],
      contexto: 'exemplo · segundo pedido',
    },
    {
      id: 'exemplo-ambiente',
      mensagens: [
        'Fomos comer lá no local, atendimento ótimo e o ambiente é bem gostoso.',
        'Voltamos com certeza.',
      ],
      contexto: 'exemplo · primeira visita',
    },
  ],
  fecho: 'No seu site, esta seção mostra as mensagens reais dos seus clientes — e o botão abaixo leva direto para a conversa.',
  fechoCta: 'Falar no WhatsApp',
  fechoMensagem: 'Olá! Vi o modelo de site e queria saber mais.',
  ctaAvaliacoes: 'Ver avaliações no Google',
} as const;

/* ── PEDIR ─────────────────────────────────────────────────────────────
 * CTA principal do site inteiro: delivery/retirada é o foco (confirmado
 * na entrevista), então aqui é pedido direto, sem formulário de agenda —
 * diferente do modelo-b, que agenda horário. */
export const pedir = {
  eyebrow: 'Vamos pedir',
  titulo: 'Peça do seu jeito',
  texto:
    'Escolha o item do cardápio e como prefere receber. A gente monta a mensagem pronta — você só toca em enviar.',
  cta: 'Enviar pedido pelo WhatsApp',
  mensagem: 'Olá! Vi o modelo de site e queria fazer um pedido.',
  imagem: 'burger-fundo-escuro',
  alt: 'Hambúrguer artesanal em fundo escuro',
  opcoes: ['Retirar no balcão', 'Entrega', 'Comer no local'],
} as const;

export const visite = {
  eyebrow: 'Visite',
  titulo: 'O endereço da sua hamburgueria entra aqui',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp.
 */
export const og = {
  imagem: 'burger-fundo-escuro',
} as const;
