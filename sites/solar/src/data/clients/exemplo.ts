import type { ClientData } from '../types';

const client: ClientData = {
  id: 'exemplo',
  businessName: 'Sorriso Maringá Odontologia',
  niche: 'Dentista',
  tagline: 'Cuidado odontológico de qualidade, perto de você',
  about:
    'Atendimento humanizado em Maringá, com foco em prevenção e tratamentos modernos para toda a família.',
  phone: '(44) 99999-9999',
  whatsapp: '5544999999999',
  instagram: 'https://instagram.com/exemplo',
  address: 'Av. Exemplo, 1000 - Zona 7, Maringá - PR',
  hours: 'Seg a Sex, 8h às 18h',
  colors: {
    primary: '#1d4ed8',
    secondary: '#0f172a',
    accent: '#38bdf8',
    background: '#f8fafc',
    text: '#0f172a',
  },
  heroImage: 'https://picsum.photos/seed/exemplo-hero/1600/900',
  services: [
    {
      title: 'Limpeza e Prevenção',
      description: 'Consultas de rotina para manter sua saúde bucal em dia.',
    },
    {
      title: 'Clareamento Dental',
      description: 'Tratamentos estéticos para um sorriso mais confiante.',
    },
    {
      title: 'Ortodontia',
      description: 'Aparelhos e acompanhamento para alinhar seu sorriso.',
    },
  ],
  gallery: [
    'https://picsum.photos/seed/exemplo-1/600/400',
    'https://picsum.photos/seed/exemplo-2/600/400',
    'https://picsum.photos/seed/exemplo-3/600/400',
  ],
};

export default client;
