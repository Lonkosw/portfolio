// Fonte única de conteúdo do portfólio. Para criar um nicho novo, adicione um objeto em `niches`
// (e rode `npm run thumbs` para gerar as miniaturas). Nenhum outro arquivo precisa mudar.
export const profile = {
  name: 'Theo Lonkoski',
  role: 'Desenvolvedor web',
  tagline: 'Sites rápidos, bonitos e sob medida para negócios locais.',
  avatar: '/avatar.svg', // troque por /avatar.jpg (quadrado) quando tiver a foto
  whatsapp: '5544998338089',
};

export const niches = [
  {
    slug: 'odontologia',
    name: 'Odontologia',
    blurb: 'Clínicas e consultórios: confiança, agendamento e tratamentos claros.',
    accent: '#9a85d4',
    base: 'https://portfolio-odontologia.pages.dev',
    projects: [
      { id: 'modelo-2', title: 'Modelo 2', featured: true },
      { id: 'modelo-1', title: 'Modelo 1' },
      { id: 'modelo-3', title: 'Modelo 3' },
    ],
  },
  {
    slug: 'marmorarias',
    name: 'Marmorarias',
    blurb: 'Pedras, projetos e orçamento: o catálogo vira venda.',
    accent: '#9a85d4',
    base: 'https://portfolio-marmorarias.pages.dev',
    projects: [
      { id: 'modelo-3', title: 'Modelo 3', featured: true },
      { id: 'modelo-1', title: 'Modelo 1' },
      { id: 'modelo-2', title: 'Modelo 2' },
    ],
  },
  {
    slug: 'solar',
    name: 'Energia solar',
    blurb: 'Simulador de economia e prova social para fechar instalações.',
    accent: '#9a85d4',
    base: 'https://portfolio-solar.pages.dev',
    projects: [
      { id: 'modelo-1', title: 'Modelo 1', featured: true },
      { id: 'modelo-2', title: 'Modelo 2' },
      { id: 'modelo-3', title: 'Modelo 3' },
    ],
  },
];

export const requestUrl = (n, p) =>
  `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(`Olá, Theo! Vi o modelo "${n.name} · ${p.title}" no seu portfólio e quero um site assim.`)}`;
export const projectUrl = (n, p) => `${n.base}/${p.id}/`;
export const thumbFile = (n, p) => `${n.slug}-${p.id}`;
