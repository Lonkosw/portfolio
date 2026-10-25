import type { Clinica } from '../data/odonto-types';
import type { Tratamento } from '../data/odonto-types';

const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function schemaDentist(c: Clinica, url: string, image: string) {
  const esp = ['https://schema.org/Dentistry'];
  if (c.tratamentos.includes('implantes-dentarios')) esp.push('https://schema.org/Surgical');
  if (c.tratamentos.includes('odontopediatria')) esp.push('https://schema.org/Pediatric');
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: c.nomeCompleto,
    description: c.descricao,
    url,
    image,
    telephone: `+${c.whatsapp}`,
    email: c.email,
    medicalSpecialty: esp,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.endereco.logradouro,
      addressLocality: c.cidade,
      addressRegion: c.uf,
      postalCode: c.endereco.cep,
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng },
    openingHoursSpecification: c.horarios.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dow[h.dia],
      opens: h.abre,
      closes: h.fecha,
    })),
    sameAs: [`https://www.instagram.com/${c.instagram}`],
  };
}

export const schemaFaq = (faq: { p: string; r: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
});

export const schemaTratamento = (c: Clinica, t: Tratamento, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: `${t.nome} · ${c.nome}`,
  url,
  about: { '@type': 'MedicalProcedure', name: t.nome, description: t.resumo },
  publisher: { '@type': 'Dentist', name: c.nomeCompleto },
});

/** Serializa JSON-LD sem permitir fechar a tag <script>. */
export const jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');
