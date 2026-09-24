import type { APIRoute } from 'astro';
import { site } from '../data/site';

/**
 * O `Allow: /` vale MESMO em modo protótipo, e isso é deliberado.
 *
 * Bloquear a varredura aqui não tira a página da busca: se o robô não
 * entra, ele nunca lê o `<meta name="robots" content="noindex">`, e a URL
 * ainda pode aparecer como link pelado nos resultados. Quem faz o trabalho
 * de manter o demo fora do Google é a meta tag — este arquivo só precisa
 * deixar o robô entrar para lê-la.
 */
export const GET: APIRoute = ({ site: base }) => {
  const sitemap = base ? `\nSitemap: ${new URL('sitemap-index.xml', base).href}\n` : '\n';

  const aviso = site.demo
    ? `# Protótipo de demonstração — não é o site oficial do ${site.nomeCompleto}.\n` +
      '# A exclusão da busca é feita pela meta tag robots (noindex), no HTML.\n'
    : '';

  return new Response(`${aviso}User-agent: *\nAllow: /\n${sitemap}`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
