# Decisões e testes

## Respostas da entrevista
Nomes inventados; Curitiba/PR; WhatsApp "depois" (usei número genérico `5541900000000`, trocar por `?whats=` ou no arquivo
de dados); um foco por modelo (1 alto padrão/arquitetos, 2 residencial de família, 3 obras e construtoras).

## Decisões (o que e por quê)

- **Projeto em `sites/marmorarias/`**, projeto Astro próprio, como os demais sites desta pasta. O `/` do repositório continua sendo o portfólio.
- **`vite.tsconfig` fixo em `astro.config.mjs`**: o `tsconfig.json` da raiz do repositório estende `astro/tsconfigs/strict`, que não existe
  fora de uma instalação. Sem isso, o build do Astro 7 falhava ("Tsconfig not found"). Não alterei o arquivo da raiz.
- **Amostras de pedra = texturas SVG geradas** (`feTurbulence`, receitas por pedra). Foi decisão consciente: 13 pedras x 3 páginas
  exigiriam fotos de textura repetidas entre modelos (proibido) e o Unsplash tinha poucas texturas boas. As texturas servem ao catálogo, à
  calculadora (preenchimento do desenho) e ao comparador. Ficam em `public/tex/*.svg` (gerados no `prebuild`).
- **Fotos**: Unsplash (licença comercial). A busca do site bloqueia acesso direto; os IDs vieram de páginas de busca e foram conferidos
  visualmente um a um. Nenhuma foto se repete entre os modelos. Fotos de pedreira/obra/corte de pedra são escassas lá; o Modelo 3 usa
  também fotos de obra e de disco de corte. Pexels e Pixabay estavam atrás de verificação anti-bot e não foram necessários.
  Removi fotos em que aparecia marca de terceiros (caminhões).
- **Antes/depois**: o Modelo 1 usa a mesma foto com filtro (cinza, escuro e levemente desfocado) como "antes"; o Modelo 2 usa uma cozinha antiga real
  e uma renovada (ambientes diferentes); o Modelo 3 usa uma cozinha em obra e uma pronta. **Trocar pelos pares reais de cada cliente.**
- **Dados de prova (anos, peças, m², nota Google, avaliações) são valores plausíveis, não reais.** O JSON-LD não inclui `aggregateRating` de propósito, para não publicar avaliação inventada.
- **Preços** em `marmoraria-config.ts`: médias conservadoras do Brasil (out/2026). Faixa sempre mínimo–máximo: perda 10% (mínimo) e 15% (máximo),
  instalação R$ 110–190/m² com mínimo de visita R$ 280–450, bordas por metro linear, cooktop e cubas por peça.
- **Calculadora**: cada peça guarda seu próprio material; o rascunho em edição entra na soma até ser adicionado. Instalação é calculada no serviço
  inteiro (com valor mínimo), por isso o valor por peça na lista aparece "sem instalação". Escada: pisada 30 cm + espelho 17 cm (opcional). Frontão
  substitui a rodabanca quando os dois existem.
- **Personalização por URL** feita no cliente (`src/scripts/site.ts`): textos entram via `textContent` (sem HTML), parâmetros são limpos e limitados.
  Ao trocar a cidade, endereço, CEP e UF de referência são escondidos (não valem para outra cidade). A página estática continua completa para SEO sem JS.
- **Palavras proibidas**: troquei "Atendemos"/"Respondemos" (contêm "demo") por outros verbos. A única ocorrência restante de "modelo" é o caminho
  `/img/modelo-X/` (pasta pedida no prompt) e a rota `/modelo-X`; ambos só aparecem em URLs.
- **`/`** tem `noindex`. As rotas dos modelos não têm, conforme o pedido de SEO por página. Se forem publicadas, considere `noindex` até personalizar.
- **Animações de assinatura**: M1, veio de mármore se revelando com a rolagem (cobertura que desliza por `transform`); M2, cartas de pedra que viram em 3D
  (`transform`); M3, serra que corta uma linha atravessando a seção (`transform`) e faixa de letreiro. Tudo respeita `prefers-reduced-motion`.
- **Fontes**: apenas o subconjunto latino (cobre o português), via `@fontsource`, hospedadas no próprio site.

## Testes da calculadora (`npm run test:calc` e no navegador, nas 3 páginas)

| Cenário | Entradas | Área | Faixa total (com instalação) |
|---|---|---|---|
| (a) Bancada de banheiro | 80×50, Granito Cinza Andorinha, cuba de sobrepor | 0,40 m² | **R$ 510 a R$ 820** |
| (b) Cozinha em L | 300×60 + 180×60, Quartzo Branco Cristal, borda meia-esquadria, saia 4 cm, rodabanca, cooktop e cuba embutida na 1ª peça | 3,55 m² | **R$ 5.420 a R$ 9.240** |
| (c) Escada | 15 degraus × 100 cm, Mármore Carrara, borda boleada, com espelho | 7,05 m² | **R$ 8.430 a R$ 13.890** |

Conferência: (a) a instalação cai no mínimo de visita (R$ 280–450), valor realista para peça pequena; (b) ≈ R$ 1.500 a R$ 2.600 por m² instalado em quartzo
com recortes, dentro do praticado; (c) escada de 15 degraus em mármore ≈ R$ 1.200 a R$ 2.000/m². Os mesmos valores saíram no navegador (Playwright) nos modelos 1, 2 e 3.
A mensagem do WhatsApp sai com quebras de linha, lista de peças, medidas, material, acabamentos, área e faixa.

## Teste da personalização por URL
`?empresa=Marmoraria+Teste+Exemplo&cidade=Maringá` (e `&whats=44999887766`) nas 3 rotas: título, descrição, Open Graph, JSON-LD, textos visíveis,
`alt`/`aria-label`, links `wa.me` e telefone trocados; nome e cidade antigos não aparecem; sem rolagem horizontal em 375 px.
Injeção `?empresa=<img src=x onerror=...>` vira texto puro (nenhum elemento criado).

## Qualidade
- Sem rolagem horizontal em 375, 768 e 1440 px nas 3 páginas (script Playwright).
- Lighthouse mobile (servidor com gzip, como em hospedagem real): M1 98/100/100/100, M2 99/100/100/100, M3 93/100/100/100
  (Desempenho/Acessibilidade/Boas práticas/SEO). Sem compressão (servidor simples) o M3 cai para ~86.
- `npm run build` sem erros.
- Busca final por "demo, template, modelo, exemplo, lorem ipsum, placeholder, fictício, teste" no HTML gerado e nos fontes: sem ocorrências em texto,
  `alt`, `title` ou meta (restam apenas URLs `/modelo-X` e `/img/modelo-X/`, e a palavra `grid-template` em CSS).

## Pendências para usar com cliente real
1. WhatsApp, telefone, e-mail, Instagram, endereço e horário reais.
2. Tabela de preços real em `marmoraria-config.ts`.
3. Nota/avaliações do Google, números de prova e depoimentos reais.
4. Fotos reais de obras e pares de antes/depois do cliente; trocar `public/img/modelo-X/` e `scripts/images.json`.
5. Domínio, `site` no `astro.config.mjs` (para URLs absolutas no Open Graph) e `noindex` até a personalização.
