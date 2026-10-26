export interface ClientColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ClientService {
  title: string;
  description: string;
}

export interface ClientData {
  id: string;
  businessName: string;
  niche: string;
  tagline: string;
  about: string;
  /** Formato de exibição, ex: "(44) 99999-9999" */
  phone: string;
  /** Somente dígitos com código do país, ex: "5544999999999" */
  whatsapp: string;
  instagram?: string;
  address?: string;
  hours?: string;
  colors: ClientColors;
  heroImage: string;
  services: ClientService[];
  gallery?: string[];
}
