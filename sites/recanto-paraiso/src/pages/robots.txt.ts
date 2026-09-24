import type { APIRoute } from 'astro';
import { site } from '../data/site';

/**
 * robots.txt gerado a partir do mesmo `site.demo` que controla a faixa de
 * protótipo — um interruptor só para os dois.
 *
 * Detalhe que engana muita gente: bloquear a varredura NÃO tira a página da
 * busca. Se o robô não pode entrar, ele não lê o `noindex` do <head>, e a URL
 * ainda pode aparecer nos resultados como um link pelado. Por isso, mesmo em
 * modo protótipo, a varredura fica liberada — é o `noindex` que faz o trabalho.
 */
export const GET: APIRoute = () => {
  const corpo = site.demo
    ? `# Protótipo de demonstração — não é o site oficial do ${site.nome}.
# As páginas trazem <meta name="robots" content="noindex, nofollow">.
# A varredura fica liberada de propósito: sem entrar na página, o robô não
# leria o noindex e a URL poderia aparecer na busca assim mesmo.
User-agent: *
Allow: /
`
    : `User-agent: *
Allow: /
`;

  return new Response(corpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
