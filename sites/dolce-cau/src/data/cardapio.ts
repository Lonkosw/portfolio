/**
 * Cardápio real da DolceCau.
 *
 * Preços e descrições extraídos do menu oficial da doceria
 * (menudolcecau.my.canva.site/docesdolcecau) e conferidos página a página.
 * As fotos de cada sabor vêm do mesmo menu e vivem em `src/assets/doces/`,
 * com o nome do arquivo igual ao `slug`.
 */

export interface Doce {
  slug: string;
  nome: string;
  descricao: string;
  /** Preço do cento, em reais, sem o "R$". */
  cento: string;
  /** Preço unitário, em reais, sem o "R$". */
  unitario: string;
}

export const brigadeiros: Doce[] = [
  {
    slug: 'tradicional',
    nome: 'Brigadeiro Tradicional',
    descricao: 'Brigadeiro cremoso, feito com chocolate em pó 50%, coberto com granulado tradicional. O clássico mais pedido.',
    cento: '220,00',
    unitario: '2,40',
  },
  {
    slug: 'beijinho',
    nome: 'Beijinho',
    descricao: 'Beijinho delicioso, feito com coco ralado fino.',
    cento: '220,00',
    unitario: '2,40',
  },
  {
    slug: 'bicho-de-pe',
    nome: 'Brigadeiro Bicho de Pé',
    descricao: 'Feito com Nesquik de morango, coberto com açúcar refinado.',
    cento: '220,00',
    unitario: '2,40',
  },
  {
    slug: 'amendoim',
    nome: 'Brigadeiro de Amendoim',
    descricao: 'Amendoim triturado na massa e na cobertura.',
    cento: '220,00',
    unitario: '2,40',
  },
  {
    slug: 'cajuzinho',
    nome: 'Cajuzinho',
    descricao: 'Feito com amendoim triturado e chocolate em pó 50%, coberto com açúcar, decorado com meio amendoim.',
    cento: '220,00',
    unitario: '2,40',
  },
  {
    slug: 'leite-ninho',
    nome: 'Brigadeiro de Leite Ninho',
    descricao: 'Cremoso, suave e feito com Leite Ninho de verdade. Um clássico que conquista todos os paladares.',
    cento: '240,00',
    unitario: '2,60',
  },
  {
    slug: 'meio-amargo',
    nome: 'Brigadeiro Meio Amargo',
    descricao: 'Feito com chocolate em pó 50%, e finalizado com chocolate em pó 50%.',
    cento: '240,00',
    unitario: '2,60',
  },
  {
    slug: 'casadinho',
    nome: 'Brigadeiro Casadinho',
    descricao: 'Brigadeiro meio a meio: tradicional e branco, coberto com açúcar.',
    cento: '240,00',
    unitario: '2,60',
  },
  {
    slug: 'bicho-de-pe-personalizado',
    nome: 'Bicho de Pé Personalizado',
    descricao: 'Brigadeiro bicho de pé moldado em formato de flor, com a inicial do nome ou número (idade).',
    cento: '240,00',
    unitario: '2,60',
  },
  {
    slug: 'personalizado',
    nome: 'Brigadeiro Personalizado',
    descricao: 'Brigadeiro branco com corante alimentício azul ou verde, moldado em formato de flor, com a inicial do nome ou número (idade).',
    cento: '260,00',
    unitario: '2,80',
  },
  {
    slug: 'cha-de-bebe',
    nome: 'Brigadeiro Tema Chá de Bebê',
    descricao: 'Brigadeiro branco com corante azul ou verde, com carimbos temáticos de chá de bebê. Pode ser feito rosa com o bicho de pé.',
    cento: '260,00',
    unitario: '2,80',
  },
  {
    slug: 'flor-casadinho',
    nome: 'Flor Casadinho',
    descricao: 'Brigadeiro meio a meio: tradicional e branco, coberto com açúcar, em formato de flor.',
    cento: '260,00',
    unitario: '2,80',
  },
  {
    slug: 'leite-ninho-personalizado',
    nome: 'Leite Ninho Personalizado',
    descricao: 'Brigadeiro de leite ninho, moldado em formato de flor ou com a inicial do nome.',
    cento: '260,00',
    unitario: '2,80',
  },
  {
    slug: 'churros',
    nome: 'Brigadeiro de Churros',
    descricao: 'Brigadeiro branco coberto com açúcar e canela, recheado e finalizado com doce de leite.',
    cento: '260,00',
    unitario: '2,80',
  },
  {
    slug: 'coco-queimado',
    nome: 'Brigadeiro de Coco Queimado',
    descricao: 'Brigadeiro cremoso de coco queimado, com sabor intenso e toque artesanal.',
    cento: '280,00',
    unitario: '3,00',
  },
  {
    slug: 'pamonha-coco',
    nome: 'Brigadeiro de Pamonha com Coco',
    descricao: 'Feito com milho, coberto com coco ralado fino. Remete ao sabor de uma pamonha super cremosa.',
    cento: '280,00',
    unitario: '3,00',
  },
  {
    slug: 'cafe',
    nome: 'Brigadeiro de Café',
    descricao: 'Feito com chocolate em pó 50% e um toque de café, coberto com chocolate em pó 50%.',
    cento: '280,00',
    unitario: '3,00',
  },
  {
    slug: 'limao-siciliano',
    nome: 'Brigadeiro de Limão Siciliano',
    descricao: 'Feito com limão siciliano, coberto com açúcar.',
    cento: '280,00',
    unitario: '3,00',
  },
  {
    slug: 'romeu-julieta',
    nome: 'Brigadeiro Romeu e Julieta',
    descricao: 'Feito com queijo parmesão ralado, coberto com açúcar, decorado com goiabada em formato de coração.',
    cento: '300,00',
    unitario: '3,20',
  },
  {
    slug: 'olho-de-sogra',
    nome: 'Flor de Olho de Sogra',
    descricao: 'Ameixa recheada com beijinho, coberta com açúcar, moldada em formato de flor.',
    cento: '300,00',
    unitario: '3,20',
  },
  {
    slug: 'flor-limao-siciliano',
    nome: 'Flor de Limão Siciliano',
    descricao: 'Feito com limão siciliano, coberto com açúcar, moldado em formato de flor.',
    cento: '300,00',
    unitario: '3,20',
  },
  {
    slug: 'nozes',
    nome: 'Brigadeiro de Nozes',
    descricao: 'Brigadeiro de nozes chilenas, coberto com açúcar e decorado com pedaço de noz.',
    cento: '310,00',
    unitario: '3,30',
  },
  {
    slug: 'leite-ninho-nutella',
    nome: 'Leite Ninho com Nutella',
    descricao: 'Feito com Leite Ninho, recheado e decorado com Nutella Original.',
    cento: '310,00',
    unitario: '3,30',
  },
  {
    slug: 'ferrero',
    nome: 'Brigadeiro Ferrero',
    descricao: 'Feito com chocolate em pó 50% e amendoim, coberto com amendoim, recheado e decorado com Nutella Original.',
    cento: '310,00',
    unitario: '3,30',
  },
  {
    slug: 'surpresa-uva',
    nome: 'Surpresa de Uva',
    descricao: 'Brigadeiro de leite Ninho, recheado com uva inteira sem semente, coberto com açúcar.',
    cento: '310,00',
    unitario: '3,30',
  },
  {
    slug: 'surpresa-cereja',
    nome: 'Surpresa de Cereja',
    descricao: 'Brigadeiro bicho de pé, recheado com cereja inteira, coberto com leite ninho.',
    cento: '330,00',
    unitario: '3,50',
  },
  {
    slug: 'flor-pistache',
    nome: 'Flor de Pistache',
    descricao: 'Brigadeiro de pistache, moldado em formato de flor.',
    cento: '330,00',
    unitario: '3,50',
  },
  {
    slug: 'uva-sucrilhos',
    nome: 'Uva com Sucrilhos',
    descricao: 'Brigadeiro branco recheado com uva fresca sem semente, envolto em sucrilhos caramelizados. Irresistível!',
    cento: '330,00',
    unitario: '3,50',
  },
  {
    slug: 'belga',
    nome: 'Brigadeiro Belga',
    descricao: 'Brigadeiro de cacau em pó 100% belga, coberto com granulado de chocolate Belga Split Callebaut.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'floresta-negra',
    nome: 'Brigadeiro Floresta Negra',
    descricao: 'Brigadeiro de chocolate 50%, recheado com cereja com talo, coberto com granulado de chocolate Belga Split Callebaut.',
    cento: '430,00',
    unitario: '4,50',
  },
];

export const bombons: Doce[] = [
  {
    slug: 'macico-amendoim',
    nome: 'Bombom Maciço com Amendoim',
    descricao: 'Chocolate Nobre blend (ao leite + meio amargo) maciço com amendoim.',
    cento: '360,00',
    unitario: '3,80',
  },
  {
    slug: 'bombom-brigadeiro',
    nome: 'Bombom de Brigadeiro',
    descricao: 'Brigadeiro 50%, banhado no chocolate Nobre blend.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'bombom-coco',
    nome: 'Bombom de Coco',
    descricao: 'Brigadeiro de coco, banhado no chocolate Nobre blend.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'bombom-amendoim',
    nome: 'Bombom de Amendoim',
    descricao: 'Brigadeiro de amendoim, banhado no chocolate Nobre blend.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'bombom-cafe',
    nome: 'Bombom de Café',
    descricao: 'Brigadeiro de café, banhado no chocolate Nobre blend.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'abacaxi-coco',
    nome: 'Abacaxi com Coco',
    descricao: 'Chocolate branco Nobre em formato de rosas, recheado com brigadeiro cremoso de abacaxi com coco.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'suculenta-morango',
    nome: 'Suculenta de Morango',
    descricao: 'Cestinha de chocolate Nobre blend, recheada com geleia de morango artesanal, decorada com brigadeiro em formato de suculenta.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'copinho-maracuja',
    nome: 'Copinho de Maracujá',
    descricao: 'Copinho de chocolate Nobre blend, recheado com brigadeiro cremoso de maracujá, decorado com folha de chocolate.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'bombom-amarula',
    nome: 'Bombom de Amarula',
    descricao: 'Chocolate branco Nobre, recheado com brigadeiro cremoso de amarula.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'crocante-caramelo',
    nome: 'Crocante de Caramelo',
    descricao: 'Brigadeiro de caramelo salgado, coberto com amendoim triturado, banhado no chocolate nobre blend.',
    cento: '380,00',
    unitario: '4,00',
  },
  {
    slug: 'bombom-nutella',
    nome: 'Bombom de Nutella (Original)',
    descricao: 'Chocolate Nobre blend, recheado com Nutella Original.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'cookies-nutella',
    nome: 'Cookies & Nutella (Original)',
    descricao: 'Chocolate Nobre branco, recheado com Nutella Original.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'cestinha-uva',
    nome: 'Cestinha de Uva',
    descricao: 'Cestinha de chocolate Nobre blend, recheada com brigadeiro branco cremoso, decorada com uva inteira sem semente.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'bombom-uva',
    nome: 'Bombom de Uva',
    descricao: 'Uva inteira sem semente, envolta com brigadeiro branco, banhada no chocolate nobre blend.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'trufa-chocolate',
    nome: 'Trufa de Chocolate',
    descricao: 'Trufa especial com chocolate nobre e licor de cacau, banhada no chocolate nobre blend.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'trufa-maracuja',
    nome: 'Trufa de Maracujá',
    descricao: 'Trufa especial de maracujá, banhada no chocolate nobre blend.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'bombom-cereja',
    nome: 'Bombom de Cereja',
    descricao: 'Cereja envolta com brigadeiro de chocolate 50%, banhada no chocolate nobre blend.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'bombom-nozes',
    nome: 'Bombom de Nozes',
    descricao: 'Brigadeiro de nozes chilena, banhado no chocolate nobre branco, decorado com meia noz dourada.',
    cento: '400,00',
    unitario: '4,20',
  },
  {
    slug: 'copinho-cereja',
    nome: 'Copinho com Cereja',
    descricao: 'Copinho de chocolate Nobre blend, recheado com brigadeiro branco cremoso, decorado com cereja com talo.',
    cento: '430,00',
    unitario: '4,50',
  },
  {
    slug: 'cestinha-morango',
    nome: 'Cestinha de Morango',
    descricao: 'Cestinha de chocolate Nobre blend, recheada com brigadeiro branco cremoso, decorada com morango fresco.',
    cento: '430,00',
    unitario: '4,50',
  },
  {
    slug: 'calice-vinho',
    nome: 'Cálice de Vinho',
    descricao: 'Copinho de chocolate Nobre blend em formato de cálice, recheado com brigadeiro de vinho tinto cremoso.',
    cento: '430,00',
    unitario: '4,50',
  },
  {
    slug: 'bombom-morango',
    nome: 'Bombom de Morango',
    descricao: 'Morango fresco, envolto com brigadeiro branco, banhado no chocolate Nobre blend. O tamanho pode variar conforme o morango.',
    cento: '750,00',
    unitario: '7,50',
  },
];

/** Regras de venda, também retiradas do menu oficial. */
export const regras = {
  pesoMedio: '17 g por unidade (brigadeiros)',
  minimoCento: 'Mínimo de 25 por sabor',
  minimoUnitario: 'Mínimo de 10 por sabor',
  observacao:
    'O Bombom de Morango tem preço sujeito a alteração, pois o tamanho varia conforme o morango.',

  /**
   * As mesmas regras acima em número, para o simulador de orçamento poder
   * calcular. A leitura é: os sabores se misturam para fechar o cento, desde
   * que cada sabor entre com pelo menos 25 unidades.
   */
  unidadesPorCento: 100,
  minimoPorSaborCento: 25,
  minimoPorSaborUnitario: 10,
};

/** Sabores com preço variável — o simulador avisa quando entram na conta. */
export const precoVariavel = ['bombom-morango'];
