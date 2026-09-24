/**
 * Conteúdo do site. Tudo que é texto/contato vive aqui — editar este arquivo
 * atualiza o site inteiro, sem tocar em componente.
 *
 * ══════════════════════════════════════════════════════════════════════
 * REGRA DESTE ARQUIVO
 * ══════════════════════════════════════════════════════════════════════
 * Só entra o que dá para conferir no canal público deles
 * (@claus.cabeleireiros). Nada de preço, prêmio, ano de fundação, número de
 * clientes ou depoimento inventado. Salão é o tipo de negócio em que a dona
 * sabe de cor tudo o que já aconteceu ali — qualquer número inventado é
 * desmentido na primeira leitura.
 *
 * ⚠️ SEM PREÇO, POR DECISÃO. Coloração é orçada no olho: depende do
 * comprimento, do histórico químico e de quantas sessões vão ser precisas.
 * Publicar "a partir de R$ X" num site de salão gera a conversa mais chata
 * que existe ("mas no site tava escrito..."). O site leva a conversa pronta
 * ao WhatsApp e o valor sai de lá.
 *
 * ⚠️ CONFERIR OS DOIS TELEFONES ANTES DE MANDAR O LINK. Ambos vieram do
 * perfil em 06/08/2026: o fixo está escrito na bio e o WhatsApp é o número
 * do link de agendamento que eles mesmos publicam. Número errado manda
 * cliente para estranho.
 */

export const site = {
  nome: 'Claus',
  nomeCompleto: 'Claus Cabeleireiros',
  tagline: 'Salão de beleza em Maringá — cabelo, penteado, maquiagem e unhas.',
  descricao:
    'Salão de beleza em Maringá — PR. Coloração e mechas, corte, penteado, maquiagem e unhas. Rua Paranaguá, 249 — Zona 7.',
  cidade: 'Maringá',
  estado: 'PR',

  /** ⚠️ Do link de agendamento da bio, lido em 06/08/2026. Conferir. */
  whatsapp: '5544999216309',
  whatsappExibicao: '(44) 99921-6309',
  /** ⚠️ Escrito na bio do perfil. É o fixo do salão, não o WhatsApp. */
  telefone: '554432254416',
  telefoneExibicao: '(44) 3225-4416',

  instagram: 'https://www.instagram.com/claus.cabeleireiros',
  instagramExibicao: '@claus.cabeleireiros',

  /** Está escrito na bio deles, palavra por palavra. */
  endereco: 'Rua Paranaguá, 249 — Zona 7',
  maps: 'https://www.google.com/maps/search/?api=1&query=Claus+Cabeleireiros+Rua+Paranagu%C3%A1+249+Maring%C3%A1+PR',

  /**
   * Protótipo de demonstração. Enquanto true: faixa no topo, nota no
   * rodapé, <meta name="robots" content="noindex, nofollow"> e aviso no
   * robots.txt. Virar false só se eles contratarem.
   */
  demo: true,
} as const;

export const nav = [
  { label: 'Antes e depois', href: '#antes-depois' },
  { label: 'Trabalhos', href: '#portfolio' },
  { label: 'Serviços', href: '#servicos' },
] as const;

export const hero = {
  eyebrow: 'Salão de beleza · Maringá — PR',
  /* Uma linha por <span>: é o que permite a entrada linha a linha sem
     plugin de split. Mexeu aqui? A animação acompanha sozinha. */
  titulo: ['O loiro', 'que você', 'quer'],
  texto:
    'Coloração, mechas, corte, penteado, maquiagem e unhas. Na Zona 7, com agenda pelo WhatsApp.',
  cta: 'Agendar no WhatsApp',
  ctaSecundario: 'Ver antes e depois',
  imagem: 'loiro-parede-grafite',
  alt: 'Cabelo loiro com mechas, ondulado, sobre a parede grafite do salão',
} as const;

/* ── ANTES E DEPOIS ──────────────────────────────────────────────────── */

/**
 * A seção que existe por causa do acervo, e a razão de este site não ser um
 * clone do da fotógrafa.
 *
 * ⚠️ O QUE TORNA ISTO HONESTO: os dois pares são a MESMA cliente, no MESMO
 * dia. Dá para conferir a olho — o suéter vermelho num par, a blusa branca
 * no outro, o mesmo enquadramento. O Stilo teve de afirmar apenas "processo
 * → resultado" porque as fotos dele eram de banco; aqui a afirmação forte
 * pode ser feita, e é ela que vende.
 *
 * Se entrar par novo, ele precisa vir COMPLETO (antes + depois da mesma
 * pessoa). Montar um par com fotos de clientes diferentes destruiria a
 * única coisa que esta seção tem de valioso.
 */
export const antesDepois = {
  eyebrow: 'Antes e depois',
  titulo: 'A mesma cliente, no mesmo dia',
  texto:
    'Arraste a linha para ver a transformação inteira. São fotos do salão, sem retoque de cor — o que está no depois é o que saiu da cadeira.',
  dica: 'Arraste a alça — ou use as setas do teclado.',
  pares: [
    {
      antes: 'antes-loiro',
      depois: 'depois-loiro',
      titulo: 'Mechas e matização',
      texto:
        'De castanho com pontas desbotadas para loiro iluminado da raiz ao comprimento, com o fio alinhado.',
      antesAlt: 'Cabelo castanho longo, ondulado e ressecado nas pontas, antes do processo',
      depoisAlt: 'O mesmo cabelo depois: loiro iluminado, ondas definidas e brilho',
    },
    {
      antes: 'antes-ruivo',
      depois: 'depois-ruivo',
      titulo: 'Coloração acobreada',
      texto:
        'De acobreado desbotado e com frizz para um ruivo uniforme, liso e com brilho de espelho.',
      antesAlt: 'Cabelo acobreado longo, com frizz e cor desigual, antes do processo',
      depoisAlt: 'O mesmo cabelo depois: ruivo uniforme, liso e brilhante',
    },
  ],
} as const;

/* ── VÍDEOS ──────────────────────────────────────────────────────────── */

/**
 * Duas transformações em vídeo — clientes diferentes das do comparador, e
 * por isso somam em vez de repetir.
 *
 * ⚠️ NÃO TOCAM SOZINHOS, e isso é decisão de dados, não de estilo. Juntos
 * pesam 3,4 MB — dez vezes a página inteira. Num site de salão aberto no
 * 4G, baixar isso sem pedir é gastar o pacote da pessoa. Cada bloco abre no
 * pôster, que já mostra o "antes", e o arquivo só desce quando ela toca.
 *
 * `arquivo` mora em `public/video/`: o Astro não otimiza vídeo, então passar
 * pelo pipeline de assets só renomearia. As medidas ficam aqui para o CSS
 * reservar a caixa e não haver salto quando o vídeo entra.
 */
export const videos = {
  eyebrow: 'Em movimento',
  titulo: 'A transformação inteira, em vídeo',
  texto:
    'Duas clientes, do começo ao fim. Sem som — toque para assistir.',
  largura: 720,
  altura: 1280,
  itens: [
    {
      id: 'loiro',
      arquivo: '/video/video-loiro.mp4',
      poster: 'video-loiro-poster',
      titulo: 'Castanho para loiro',
      texto: 'Mechas, matização e corte, em 12 segundos.',
      alt: 'Vídeo mostrando a transformação de cabelo castanho para loiro iluminado',
    },
    {
      id: 'ruivo',
      arquivo: '/video/video-ruivo.mp4',
      poster: 'video-ruivo-poster',
      titulo: 'Acobreado com brilho',
      texto: 'De cacho ressecado a fio alinhado e uniforme.',
      alt: 'Vídeo mostrando a transformação de cabelo acobreado ressecado para ruivo alinhado',
    },
  ],
} as const;

/* ── PORTFÓLIO ───────────────────────────────────────────────────────── */

/**
 * ⚠️ SEM LEGENDA, DE PROPÓSITO. Escrever "loiro" embaixo da foto de um loiro
 * não informa nada e ainda rouba espaço da imagem. O `alt` continua
 * existindo para leitor de tela; o que não existe é texto visível.
 *
 * SÃO 12, e o número não é acaso: fecha linha certa nas duas larguras que
 * importam — 6 fileiras de 2 no celular, 4 fileiras de 3 no desktop. Com 11
 * ou 13 sobra buraco no fim da grade.
 *
 * A ORDEM ALTERNA os quatro serviços em vez de agrupar por tipo. Quatro
 * fotos de loiro em sequência leem como "só sabem fazer loiro"; alternadas,
 * a mesma grade diz que o salão faz cabelo, penteado, maquiagem e unha.
 */
export const portfolio = {
  eyebrow: 'Trabalhos',
  titulo: 'Feitos aqui dentro',
  texto: 'Cabelo, penteado, maquiagem e unhas — trabalhos reais de clientes do salão.',
  fotos: [
    { imagem: 'loiro-platinado-ondas', alt: 'Cabelo loiro platinado com ondas soltas, visto de costas' },
    { imagem: 'penteado-coque-lateral', alt: 'Penteado preso em coque lateral trançado' },
    { imagem: 'maquiagem-batom-vermelho', alt: 'Maquiagem com esfumado marrom e batom vermelho' },
    { imagem: 'unhas-vermelhas', alt: 'Unhas quadradas esmaltadas em vermelho brilhante' },
    { imagem: 'loiro-ondas-longas', alt: 'Cabelo loiro com mechas e ondas longas, visto de costas' },
    { imagem: 'coque-brinco-azul', alt: 'Coque baixo com trança lateral em cabelo loiro' },
    { imagem: 'maquiagem-dourada', alt: 'Maquiagem com esfumado dourado e delineado preto' },
    { imagem: 'unhas-azul-claro', alt: 'Unhas esmaltadas em azul acinzentado claro' },
    { imagem: 'bob-curto-iluminado', alt: 'Corte bob curto com iluminado nas pontas' },
    { imagem: 'ondas-castanhas', alt: 'Cabelo castanho com ondas soltas, cliente sorrindo no salão' },
    { imagem: 'maquiagem-perolas', alt: 'Maquiagem em tons neutros, com presilha de pérolas no cabelo' },
    { imagem: 'loiro-parede-grafite', alt: 'Cabelo loiro com mechas, ondulado, sobre a parede grafite do salão' },
  ],
} as const;

/* ── SERVIÇOS ────────────────────────────────────────────────────────── */

/**
 * O que num site de serviço seria "planos".
 *
 * ⚠️ SEM PREÇO E SEM LISTA DE PROCEDIMENTOS. Estes quatro cartões dizem o
 * que o salão FAZ, não o que cobra nem quantas sessões leva — nada disso foi
 * confirmado com eles. Cada um abre o WhatsApp com o assunto já escrito.
 *
 * ⚠️ CONFERIR A LISTA COM O SALÃO. Os quatro serviços foram deduzidos das
 * fotos do perfil (tem cabelo, penteado, maquiagem e unha) e da categoria
 * "Salão de beleza". Não há uma lista de serviços publicada por eles. Se
 * fizerem sobrancelha, depilação ou estética, está faltando; se não fizerem
 * algum destes, está sobrando.
 */
export const servicos = {
  eyebrow: 'Serviços',
  titulo: 'O que a gente faz',
  texto:
    'Toque no serviço para já abrir a conversa com o assunto escrito. Valor e horário são combinados no WhatsApp.',
  itens: [
    {
      id: 'cor',
      nome: 'Cor e mechas',
      texto:
        'Loiro, acobreado, morena iluminada, retoque de raiz e matização. O orçamento sai depois de olhar o histórico do seu cabelo.',
      imagem: 'loiro-platinado-ondas',
      alt: 'Cabelo loiro platinado com ondas',
    },
    {
      id: 'penteado',
      nome: 'Corte e penteado',
      texto:
        'Corte, escova e penteado preso para festa, formatura e casamento.',
      imagem: 'coque-brinco-azul',
      alt: 'Coque baixo com trança lateral',
    },
    {
      id: 'maquiagem',
      nome: 'Maquiagem',
      texto:
        'Maquiagem social para o dia ou para a noite, feita no salão antes do evento.',
      imagem: 'maquiagem-perolas',
      alt: 'Maquiagem em tons neutros com presilha de pérolas',
    },
    {
      id: 'unhas',
      nome: 'Unhas',
      texto:
        'Manicure e esmaltação, do nude discreto ao vermelho de festa.',
      imagem: 'unhas-vermelhas',
      alt: 'Unhas quadradas esmaltadas em vermelho',
    },
  ],
  mensagem: 'Olá! Vim pelo site e gostaria de agendar um horário.',
  cta: 'Chamar no WhatsApp',
} as const;

/* ── SOBRE ───────────────────────────────────────────────────────────── */

/**
 * ⚠️ CURTO DE PROPÓSITO. Não sei há quanto tempo o salão existe, quem é a
 * equipe nem quantos profissionais atendem — nada disso está publicado.
 * Cada linha aqui é verificável: o endereço está na bio, os serviços estão
 * nas fotos, e o agendamento é o link que eles mesmos publicam.
 *
 * Quando eles contarem a história (quem fundou, desde quando, quantas
 * cadeiras), é aqui que ela entra — e aí esta seção cresce.
 */
export const sobre = {
  eyebrow: 'O salão',
  titulo: 'Na Zona 7, em Maringá',
  paragrafos: [
    'O Claus Cabeleireiros fica na Rua Paranaguá, 249, na Zona 7. O salão atende cabelo, penteado, maquiagem e unhas no mesmo lugar — dá para sair pronta para o evento sem trocar de endereço.',
    'O agendamento é pelo WhatsApp, e é assim que o valor de coloração é passado: depois de saber o comprimento e o que já foi feito no seu cabelo.',
  ],
  destaques: [
    { rotulo: 'Onde', texto: 'Rua Paranaguá, 249 — Zona 7' },
    { rotulo: 'O que', texto: 'Cabelo, penteado, maquiagem e unhas' },
    { rotulo: 'Como', texto: 'Horário e valor pelo WhatsApp' },
  ],
  imagem: 'ondas-castanhas',
  alt: 'Cliente sorrindo no salão, com o cabelo castanho ondulado pronto',
} as const;

export const contato = {
  eyebrow: 'Contato',
  titulo: 'Vamos marcar o seu horário',
  texto:
    'Mande uma foto do seu cabelo hoje e diga aonde quer chegar — dá para responder valor e tempo de sessão já na conversa.',
  mensagem: 'Olá! Vim pelo site e gostaria de agendar um horário.',
} as const;

/**
 * Prévia para quando o link é colado no WhatsApp — que é como este site vai
 * ser distribuído. Sem isto, a mensagem vira um link pelado.
 */
export const og = {
  imagem: 'loiro-parede-grafite',
} as const;
