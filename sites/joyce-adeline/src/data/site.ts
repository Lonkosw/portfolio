/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * ══════════════════════════════════════════════════════════════════════
 * REGRA DESTE ARQUIVO
 * ══════════════════════════════════════════════════════════════════════
 * Só entra o que dá para conferir no canal público dela
 * (@joyceadelinefotografia). Nada de preço, prêmio, tempo de casa,
 * quantidade de ensaios ou depoimento inventado.
 *
 * ⚠️ SEM PREÇO, POR DECISÃO. Ensaio fotográfico é orçado por sessão
 * (quantas pessoas, quanto tempo, quantas fotos tratadas, se sai álbum).
 * A própria Joyce não publica valor. O site leva a conversa pronta ao
 * WhatsApp — inventar uma tabela aqui seria o pior erro possível.
 *
 * ⚠️ CONFERIR O TELEFONE ANTES DE MANDAR O LINK. O número abaixo foi lido
 * do perfil dela em 07/08/2026. Número errado manda cliente para estranho:
 * é o único dado deste arquivo que precisa de conferência com o olho.
 */

export const site = {
  nome: 'Joyce Adeline',
  nomeCompleto: 'Joyce Adeline Fotografia',
  tagline: 'Fotografia de gestante, newborn e corporativo em Maringá.',
  descricao:
    'Fotógrafa em Maringá — PR, com estúdio próprio. Ensaios de gestante, newborn, família e retrato corporativo.',
  cidade: 'Maringá',
  estado: 'PR',

  /** ⚠️ Do perfil dela, lido em 07/08/2026. Conferir antes de divulgar. */
  whatsapp: '5544989222529',
  whatsappExibicao: '(44) 98922-2529',

  instagram: 'https://www.instagram.com/joyceadelinefotografia',
  instagramExibicao: '@joyceadelinefotografia',

  /**
   * ⚠️ O ENDEREÇO DO ESTÚDIO NÃO É PÚBLICO. A bio diz "estúdio próprio" e
   * nada mais. Ficar de fora é a escolha certa: endereço errado manda
   * gestante de sete meses para a rua errada. Quando ela informar, entra
   * aqui e o rodapé passa a mostrar sozinho.
   */
  endereco: '',

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no
   * rodapé, <meta name="robots" content="noindex, nofollow"> e aviso no
   * robots.txt. Virar false só se ela contratar.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Ensaios', href: '#planos' },
] as const;

export const hero = {
  eyebrow: 'Fotografia · Maringá — PR',
  /* Uma linha por <span>: é o que permite a entrada linha a linha sem
     plugin de split. Mexeu aqui? A animação acompanha sozinha. */
  titulo: ['O dia', 'que não', 'volta'],
  texto:
    'Gestante, newborn, família e corporativo. Estúdio próprio em Maringá, com a luz montada antes de você chegar.',
  cta: 'Falar no WhatsApp',
  ctaSecundario: 'Ver o portfólio',
  imagem: 'gestante-caramelo',
  alt: 'Gestante de vestido caramelo sentada, com a barriga aparente e a luz vindo de trás',
} as const;

/* ── PORTFÓLIO ───────────────────────────────────────────────────────── */

/**
 * A galeria, e o coração do site.
 *
 * ⚠️ SEM LEGENDA, DE PROPÓSITO — pedido do Théo, e é o certo aqui. Numa
 * galeria de fotógrafa, escrever "gestante" embaixo da foto de uma gestante
 * não acrescenta nada e ainda rouba o espaço da imagem. O `alt` continua
 * existindo (quem usa leitor de tela precisa dele); o que não existe é
 * texto visível por cima da foto.
 *
 * SÃO 12, e o número não é acaso: 12 fecha linha certa nas duas larguras
 * que importam — 6 fileiras de 2 no celular, 4 fileiras de 3 no desktop.
 * Com 11 ou 13 sobra um buraco no fim da grade.
 *
 * Ficaram DE FORA duas fotos do acervo (`familia-mae-crianca` e
 * `familia-tres-sentados`): são outros cliques da mesma sessão de fotos que
 * já está aqui. Três frames da mesma família em sequência não mostram
 * variedade — mostram que o acervo é pequeno.
 */
export const portfolio = {
  eyebrow: 'Portfólio',
  titulo: 'Alguns dos ensaios',
  texto: 'Gestante, newborn, família e corporativo — todos feitos no estúdio.',
  fotos: [
    { imagem: 'gestante-contraluz', alt: 'Gestante de branco em contraluz, diante de uma cortina clara' },
    { imagem: 'newborn-recem-nascido', alt: 'Recém-nascido deitado, de olhos abertos, em manta clara' },
    { imagem: 'gestante-casal-chao', alt: 'Casal sentado no chão do estúdio, ele com as mãos sobre a barriga dela' },
    { imagem: 'familia-pb', alt: 'Retrato em preto e branco de mãe, pai e criança deitados juntos' },
    { imagem: 'familia-pai-ombros', alt: 'Criança sentada nos ombros do pai, ao lado da mãe gestante' },
    { imagem: 'familia-casal-crianca', alt: 'Casal em pé com uma criança pequena no colo, em fundo claro' },
    { imagem: 'retrato-casal-branco', alt: 'Casal de camisa branca abraçado, em fundo claro de estúdio' },
    { imagem: 'corporativo-blazer-branco', alt: 'Retrato corporativo de mulher de blazer branco encostada na parede' },
    { imagem: 'corporativo-camisa-azul', alt: 'Retrato corporativo de mulher de camisa azul em ambiente de trabalho' },
    { imagem: 'corporativo-retrato-escuro', alt: 'Retrato corporativo de mulher de camisa escura e boina, em luz baixa' },
    { imagem: 'corporativo-luz-quente', alt: 'Retrato corporativo de mulher sob luz quente, de perfil' },
    { imagem: 'corporativo-notebook', alt: 'Retrato corporativo de mulher sentada com um notebook, em luz baixa' },
  ],
} as const;

/* ── SOBRE ───────────────────────────────────────────────────────────── */

export const sobre = {
  eyebrow: 'Sobre',
  titulo: 'Quem está atrás da câmera',
  paragrafos: [
    'Sou a Joyce. Fotografo gestante, newborn, família e retrato corporativo em Maringá, no meu próprio estúdio.',
    'Ensaio com criança pequena e com recém-nascido não segue roteiro: a luz já está montada quando você chega, e o resto é esperar a hora certa acontecer.',
  ],
  /**
   * Três informações que dizem o que ela faz sem inventar estatística.
   * Nenhuma é quantidade de ensaios, ano de início ou nota de avaliação —
   * nada disso foi confirmado.
   */
  destaques: [
    { rotulo: 'Onde', texto: 'Estúdio próprio, em Maringá' },
    { rotulo: 'Quem', texto: 'Gestante, newborn, família e corporativo' },
    { rotulo: 'Como', texto: 'Data e valor combinados por WhatsApp' },
  ],
  imagem: 'joyce-fotografando',
  alt: 'Joyce em pé, fotografando com uma câmera profissional junto ao rosto',
} as const;

/* ── ENSAIOS ─────────────────────────────────────────────────────────── */

/**
 * O que num site de serviço seria "planos".
 *
 * ⚠️ SEM PREÇO E SEM "O QUE ESTÁ INCLUSO". Estes três cartões dizem o que
 * cada ensaio É, não o que ele custa nem quantas fotos entrega — nada disso
 * foi confirmado com a Joyce. Quando o Théo trouxer a pesquisa dele, o
 * lugar de escrever é o campo `inclui` abaixo, que hoje está vazio e por
 * isso não renderiza.
 *
 * As três linhas são as que ela mesma anuncia na bio: "Gestantes | Newborn
 * | Corporativos". Família entra junto do newborn porque é o que as fotos
 * do acervo mostram — quase toda sessão de gestante dela tem o casal e os
 * filhos mais velhos na mesma leva.
 */
export const planos = {
  eyebrow: 'Ensaios',
  titulo: 'Três tipos de ensaio',
  texto:
    'Toque em um deles para já abrir a conversa com o assunto escrito — o valor e a data são combinados no WhatsApp.',
  itens: [
    {
      id: 'gestante',
      nome: 'Gestante',
      texto:
        'O ensaio da barriga, sozinha ou com o casal e os filhos mais velhos. Feito no estúdio, com a luz montada.',
      inclui: [] as string[],
      imagem: 'gestante-contraluz',
      alt: 'Gestante de branco em contraluz',
    },
    {
      id: 'newborn',
      nome: 'Newborn e família',
      texto:
        'O recém-nascido nos primeiros dias, e o retrato da família junto — no ritmo do bebê, sem hora marcada para acabar.',
      inclui: [] as string[],
      imagem: 'newborn-recem-nascido',
      alt: 'Recém-nascido deitado em manta clara',
    },
    {
      id: 'corporativo',
      nome: 'Corporativo',
      texto:
        'Retrato profissional para perfil, site e material da empresa. No estúdio ou no seu ambiente de trabalho.',
      inclui: [] as string[],
      imagem: 'corporativo-blazer-branco',
      alt: 'Retrato corporativo de mulher de blazer branco',
    },
  ],
  /** Mensagem do botão geral, quando a pessoa não escolheu um dos três. */
  mensagem: 'Olá, Joyce! Vim pelo site e gostaria de saber sobre um ensaio.',
  cta: 'Chamar no WhatsApp',
} as const;

export const contato = {
  eyebrow: 'Contato',
  titulo: 'Vamos marcar a sua data',
  texto:
    'A agenda de gestante costuma fechar com semanas de antecedência — chame no WhatsApp e a gente combina.',
  mensagem: 'Olá, Joyce! Vim pelo site e gostaria de marcar um ensaio.',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site vai
 * ser distribuído. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'gestante-caramelo',
} as const;
