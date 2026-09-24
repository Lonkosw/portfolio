import { brigadeiros, bombons } from './cardapio';

/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * é o suficiente para atualizar o site inteiro, sem mexer em componente.
 *
 * Contato, endereço, cardápio e regras de pedido foram retirados dos canais
 * oficiais da doceria (Instagram, Linktree e o menu no Canva).
 */

export const site = {
  nome: 'DolceCau',
  descricao:
    'Doceria gourmet em Maringá — brigadeiros, bombons e trufas artesanais para casamentos e eventos.',
  cidade: 'Maringá',
  estado: 'PR',

  whatsapp: '5544999765810',
  whatsappExibicao: '(44) 99976-5810',
  instagram: 'https://www.instagram.com/dolcecau',
  maps: 'https://www.google.com/maps/place/Dolcecau/@-23.396869,-51.9185282,15z',
  endereco: 'Av. Pedro Taques, 2884 — Jd. Alvorada',
  horario: 'Segunda a sexta, 9h às 18h',

  /**
   * Protótipo de demonstração. Enquanto true, a faixa de aviso aparece no topo.
   * Virar false só se a doceria contratar e o site passar a ser o oficial.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Mesas', href: '#criacoes' },
  { label: 'Como funciona', href: '#processo' },
  { label: 'Orçamento', href: '#orcamento' },
] as const;

export const hero = {
  eyebrow: 'Doceria gourmet · Maringá — PR',
  titulo: ['Doces finos', 'que viram', 'memória'],
  texto:
    'Dos grandes eventos aos pequenos encontros. Brigadeiros gourmet, bombons e trufas feitos à mão — e a mesa montada no seu casamento, aniversário ou evento corporativo.',
  cta: 'Solicitar orçamento',
  ctaSecundario: 'Ver cardápio',
} as const;

export const marquee = [
  'Casamentos',
  'Aniversários de 15 anos',
  'Eventos corporativos',
  'Chá de bebê',
  'Brigadeiros gourmet',
  'Bombons e trufas',
  'Mesas montadas',
] as const;

export const sobre = {
  eyebrow: 'O ateliê',
  titulo: 'Cada doce sai da nossa bancada, não de uma esteira',
  paragrafos: [
    'A DolceCau é uma doceria gourmet de Maringá especializada em doces finos para eventos. Trabalhamos com produção artesanal em lote pequeno, o que nos permite ajustar recheio, ponto e acabamento ao gosto de cada casal, cada família, cada evento.',
    'Chocolate nobre, frutas frescas e nada de pressa: cada bombom é banhado e cada brigadeiro é enrolado à mão. O resultado é aquele doce que o convidado comenta no dia seguinte.',
  ],
  /** Números calculados a partir do cardápio — não podem ficar desatualizados. */
  numeros: [
    { valor: brigadeiros.length, sufixo: '', label: 'brigadeiros gourmet' },
    { valor: bombons.length, sufixo: '', label: 'bombons e trufas' },
  ],
} as const;

export const especialidades = {
  eyebrow: 'Especialidades',
  titulo: 'Três formas de adoçar o seu dia',
  itens: [
    {
      nome: 'Brigadeiros gourmet',
      descricao:
        'De R$ 2,40 a R$ 4,50 a unidade. Do tradicional ao Floresta Negra com cereja e chocolate belga — 30 sabores, com mínimo de 25 por sabor no cento.',
      imagem: 'doces-dourados',
      alt: 'Bandejas douradas com brigadeiros variados',
    },
    {
      nome: 'Bombons, trufas e doces finos',
      descricao:
        'Banhados em chocolate nobre e montados um a um: bombom de morango, cálice de vinho, cestinha de uva, trufas de maracujá e chocolate.',
      imagem: 'detalhe-trufas',
      alt: 'Trufas dispostas em bandeja de cristal',
    },
    {
      nome: 'Mesas montadas no evento',
      descricao:
        'Levamos, montamos a mesa no local e cuidamos da composição e da reposição durante a festa. Taxa de entrega conforme o endereço.',
      imagem: 'mesa-cores',
      alt: 'Mesa de doces com bolo e flores coloridas',
    },
  ],
} as const;

export const criacoes = {
  eyebrow: 'Mesas que já montamos',
  titulo: 'Para você imaginar a sua',
  texto:
    'Cada evento pede uma composição diferente. Estas são mesas reais que a DolceCau já montou.',
  itens: [
    { imagem: 'mesa-rosas-brancas', alt: 'Mesa de doces com arranjos de rosas brancas', legenda: 'Casamento · rosas brancas', formato: 'largo' },
    { imagem: 'mesa-luzes', alt: 'Mesa de doces com painel de luzes e orquídeas', legenda: 'Painel de luzes e orquídeas', formato: 'normal' },
    { imagem: 'bolo-flores-brancas', alt: 'Bolo de casamento sob cascata de flores brancas', legenda: 'Cascata de flores brancas', formato: 'normal' },
    { imagem: 'mesa-tropical', alt: 'Mesa de doces com flores tropicais em mesa de madeira', legenda: 'Flores tropicais', formato: 'largo' },
    { imagem: 'mesa-ar-livre', alt: 'Mesa de doces em casamento ao ar livre', legenda: 'Cerimônia ao ar livre', formato: 'normal' },
    { imagem: 'salao-lustres', alt: 'Salão decorado com lustres e arranjos florais', legenda: 'Salão com lustres', formato: 'normal' },
    { imagem: 'mesa-rosas-detalhe', alt: 'Detalhe da mesa com rosas brancas e morangos', legenda: 'Detalhe · morangos e rosas', formato: 'normal' },
    { imagem: 'bandejas-brigadeiros', alt: 'Bandejas de cristal com brigadeiros variados', legenda: 'Bandejas de cristal', formato: 'largo' },
    { imagem: 'mesa-redonda', alt: 'Mesa redonda de doces com arranjo de rosas', legenda: 'Mesa redonda', formato: 'normal' },
  ],
} as const;

/** Regras reais de encomenda, retiradas do menu oficial da doceria. */
export const processo = {
  eyebrow: 'Como funciona',
  titulo: 'Do primeiro oi ao último doce da mesa',
  etapas: [
    {
      numero: '01',
      titulo: 'Faça o pedido com antecedência',
      texto:
        'Mínimo de 7 dias. Para casamentos e festas de 15 anos, reserve a data com 3 a 6 meses — a produção é artesanal e tem limite.',
    },
    {
      numero: '02',
      titulo: 'Calcule a quantidade',
      texto:
        'A média recomendada é de 6 a 8 doces por convidado, considerando o perfil dos convidados, a duração do evento e se haverá bolo ou sobremesa.',
    },
    {
      numero: '03',
      titulo: 'Confirme com o sinal',
      texto:
        'Até 500 doces: 50% na confirmação e o restante na entrega. Eventos maiores: 30% de sinal e quitação até 7 dias antes. Dinheiro, Pix, crédito e débito.',
    },
    {
      numero: '04',
      titulo: 'Entrega e montagem',
      texto:
        'Levamos os doces e montamos a mesa no local do evento. Envie o endereço completo para calcularmos a taxa de entrega.',
    },
  ],
} as const;

/**
 * Seção reservada. Nada de depoimento inventado: enquanto não houver
 * avaliação real da doceria, o espaço fica explicitamente vazio.
 */
export const depoimentos = {
  placeholder: 'Os depoimentos ficarão aqui.',
  placeholderNota:
    'Espaço reservado para as avaliações reais dos clientes da DolceCau — as mesmas que já chegam no WhatsApp e nos comentários do Instagram.',
} as const;

export const orcamento = {
  eyebrow: 'Vamos conversar',
  titulo: 'Conte sobre o seu evento',
  texto:
    'Envie a data, o número de convidados e os sabores que gostou. Respondemos com uma proposta personalizada.',
  cta: 'Chamar no WhatsApp',
  mensagem:
    'Olá, DolceCau! Vim pelo site e gostaria de um orçamento de doces para o meu evento.',
} as const;
