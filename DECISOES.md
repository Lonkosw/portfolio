# Decisões, testes e conformidade (CFO)

> **Aviso importante:** todo o conteúdo clínico e de publicidade deste projeto é um ponto de partida. Antes de publicar para qualquer clínica real, o responsável técnico deve **validar textos, números, imagens e a forma de divulgação com o próprio CRO** (Código de Ética Odontológica e normas de publicidade do CFO/CRO local). O CFO atualiza essas regras; a postura adotada aqui é conservadora, mas não substitui a conferência do conselho.

## 1. Respostas da entrevista

| Tema | Escolha |
|---|---|
| Perfil | M1 alto padrão · M2 referência digital · M3 família |
| Especialidades | Implantes (com All-on-4), lentes/facetas/clareamento, ortodontia e alinhadores |
| Cidade | Curitiba/PR (os três modelos) |
| Nomes | Inventados: Clínica Lumière, Instituto Vértice, Clínica Ninho |
| Cores | M1 grafite + champanhe · M2 navy + ciano · M3 off-white + verde-sálvia |
| Fontes | Cormorant Garamond + Inter · Sora + IBM Plex Mono · Nunito + DM Sans |
| Fotos | Mix coerente por modelo (sorrisos/ambiente no 1, tecnologia no 2, famílias/equipe no 3) |
| Agenda | Calendário visual + confirmação no WhatsApp |
| Simuladores | Quiz, clareamento, comparador e linha do tempo (parcelamento implementado, desligado) |
| Implantes | All-on-4 / protocolo total (página dedicada e item na linha do tempo do M2) |
| Valores / convênios | Valores desligados; convênios visíveis e configuráveis |
| Contato | Dados plausíveis inventados (Curitiba) |

## 2. Decisões de arquitetura e produto

- **Estático, sem back-end.** Astro + Tailwind v4. Interatividade em TypeScript puro (sem framework): agendamento, quiz, clareamento, abas, mapa. Cada script é carregado só onde existe o componente; o Leaflet é importado sob demanda (IntersectionObserver) e seu CSS entra por `?url`.
- **Dados fora dos componentes.** Clínicas em `src/data/clinics/`, tratamentos em `src/data/tratamentos.ts` (biblioteca compartilhada; cada clínica escolhe quais oferece e a ordem), configuração clínica e dos simuladores em `src/data/odonto-config.ts` (comentado e marcado para revisão do dentista).
- **Componentes compartilhados com visual por tokens.** Agendamento, quiz, simuladores, FAQ, mapa e rodapé usam variáveis CSS (`--accent`, `--r-card`, fontes…) definidas em `m1.css`, `m2.css` e `m3.css`. Hero, navegação, seções, ordem, layout dos tratamentos e animação de assinatura são **próprios de cada modelo** (não é a mesma estrutura recolorida).
- **Animações de assinatura:** M1 varredura de luz sobre o hero + linha dourada + cursor discreto (só desktop com ponteiro fino); M2 linha de varredura sobre a imagem e dente em malha (wireframe) com malha animada; M3 formas orgânicas que "respiram" e mascote que se monta (peças entram com transform + opacity). Só `transform`/`opacity` nas animações contínuas; o desenho inicial do traço do dente do M2 usa `stroke-dashoffset` uma única vez. `prefers-reduced-motion` desliga tudo e deixa o conteúdo visível; sem JavaScript o conteúdo também aparece (o reveal só esconde com a classe `js`).
- **Entrada do hero só em CSS** (`data-hero`), para não atrasar o LCP esperando JavaScript.
- **Personalização por URL no cliente** (`src/lib/personalizar.ts`): o HTML é estático, então um script substitui os textos padrão (nome, cidade, WhatsApp, dentista principal) por valores sanitizados em texto, atributos (`alt`, `title`, `aria-label`, `content`, `href` do WhatsApp), `<title>`, meta e JSON-LD. Os links internos mantêm a query string. O WhatsApp só é aceito com 10–13 dígitos (prefixo 55 é incluído automaticamente).
- **`getDisponibilidade()` isolada** (`src/lib/disponibilidade.ts`) com instruções de onde integrar uma agenda real. A versão atual usa horários de funcionamento, feriados nacionais (fixos + móveis calculados pela Páscoa: carnaval, sexta-feira santa, Corpus Christi), feriado municipal configurável e **marca alguns horários como ocupados de forma determinística**, só para simular uma agenda em uso. Troque antes de publicar.
- **Urgência:** o motivo "Dor ou urgência" pula o calendário e mostra WhatsApp, ligação e orientação para pronto-atendimento em casos graves.
- **`.ics` gerado no cliente** com horário convertido para UTC (America/Sao_Paulo = UTC−3; o Brasil não tem horário de verão desde 2019) e alarme de 24h.
- **Quiz:** 7 perguntas, pontuação em `odonto-config.ts`; só sugere tratamentos que a clínica oferece; mostra 1–3 resultados (descarta os muito abaixo do primeiro); se a resposta for forte para algo que a clínica não oferece (ex.: odontopediatria nas Clínicas 1 e 2), mostra um aviso em vez de sugerir em silêncio; "dor recente" ativa o aviso de urgência e o CTA de agendamento já com o motivo.
- **Antes/depois ilustrativo:** em vez de fotos de pacientes, um desenho vetorial genérico (dentes alinhados/claros x levemente desalinhados) com legenda "Imagem ilustrativa. Resultados variam de acordo com cada caso." Flag `mostrarAntesDepois`.
- **Mapa:** Leaflet com tiles do OpenStreetMap (invertidos por CSS nos modelos escuros). Os tiles do CARTO passaram a exigir chave de API, então foram descartados; em produção use `PUBLIC_MAP_TILES` com um provedor próprio (a política do OSM é de uso leve). Sem tiles, o mapa mostra um cartão com o endereço e link para o Google Maps.
- **`noindex` opcional** (`PUBLIC_NOINDEX=true`). Por padrão as páginas são indexáveis para o SEO ser mensurável (Lighthouse SEO 100); ligue o noindex se for mostrar as vitrines apenas por link.
- **Template antigo preservado:** `src/pages/index.astro` virou a navegação neutra; o original foi movido para `src/pages/_template-original.astro` (ignorado pelo roteador) e o README antigo para `README-template-clientes.md`.
- **Palavras proibidas:** o escopo da regra é texto visível, `alt`, `title` e meta. A busca (`tools/odonto-palavras.py`) ignora URLs/rotas `/modelo-X`, que são a exceção prevista, e o template legado que não faz parte das três clínicas.

## 3. Conformidade com o CFO (para validar com o CRO)

Implementado:

- [x] **Todas as páginas** (landing e tratamentos) exibem no rodapé: nome da clínica, **responsável técnico com nº de CRO** e **inscrição da clínica no CRO**. Cada dentista exibido (equipe e agendamento) mostra o próprio CRO.
- [x] **Sem promessa de resultado:** linguagem de possibilidade ("pode", "em muitos casos", "avaliação individual"); nada de "garantido", "sem dor", "resultado em 1 dia". Textos de risco/sensibilidade nos tratamentos relevantes.
- [x] **Sem preço, desconto, promoção, "preço baixo" ou sorteio.** `flags.mostrarValores = false` (padrão); o simulador de parcelamento só existe no HTML com a flag ligada. Verificado: nenhum "R$" no texto visível das páginas geradas.
- [x] **Depoimentos** só falam de atendimento, acolhimento, pontualidade e explicações, sem resultado clínico, com nome + inicial do sobrenome.
- [x] **Antes/depois** só ilustrativo, com a legenda obrigatória, configurável.
- [x] **Simuladores** (quiz, clareamento, comparador, linha do tempo) sempre com aviso de que são orientações gerais e que a indicação depende de avaliação clínica.
- [x] **Harmonização orofacial** descrita como procedimento realizado por cirurgiões-dentistas habilitados, após avaliação.
- [x] **Imagens genéricas de banco**, sem pacientes reais.

Pontos que o cliente deve conferir com o CRO antes de publicar:

1. **Números de prova social** (anos de clínica, pacientes atendidos, nota e nº de avaliações do Google, nº de especialistas) são fictícios. Só publique números verdadeiros e comprováveis.
2. **Depoimentos** são fictícios. Para uso real, é preciso autorização por escrito e conferência quanto às normas de publicidade.
3. **Citação de operadoras de convênio** (Odontoprev, Bradesco, SulAmérica etc.) precisa refletir credenciamentos reais.
4. **Menção a "sedação consciente", "tomografia", "cirurgia guiada", "escâner intraoral", "carga imediata", "All-on-4"**: só mantenha o que a clínica de fato oferece e tem profissional habilitado para executar.
5. **Título/especialidade** de cada dentista (ex.: "Implantodontia", "Harmonização orofacial") precisa corresponder ao registro de especialista no CRO.
6. **Tempos médios, nº de sessões e escala de clareamento** em `odonto-config.ts` e `tratamentos.ts` são médias gerais; revise.
7. **Foto de equipe** são modelos de banco; troque por fotos reais da equipe.
8. **Dados fictícios a substituir:** CRO e inscrição da clínica, endereços, telefones/WhatsApp (`5541999990101/0202/0303`), e-mails, redes sociais e CEPs.
9. Rodapé e avisos devem seguir o padrão exigido pelo CRO da região (identificação do profissional responsável e do registro).

## 4. Imagens

- **Fonte:** Unsplash (licença comercial, sem atribuição obrigatória; creditado em `public/img/CREDITOS.md`). 63 imagens, nenhuma repetida entre os três modelos (verificado por script).
- **Curadoria:** conferência visual em contact sheets; critérios do briefing (≥2000 px de lado maior, iluminação profissional, dentes naturais, ambientes limpos, diversidade, coerência de luz por modelo). Alguns filtros por CSS (dessaturação, brilho) ajudam a manter a temperatura de cor de cada modelo.
- **Pipeline:** `tools/odonto-imagens.mjs` gera AVIF e WebP em 640/960/1280/1920(/2560) respeitando o tamanho nativo, mais um JPG de fallback; `<picture>` com `srcset`, `sizes`, `width`/`height` sempre, `loading="lazy"` exceto no hero (que também recebe `preload` do AVIF com `fetchpriority="high"`). Nada de hotlink.
- **Vídeo de hero: não incluído.** Os domínios do Pexels (páginas e vídeos) não ficaram acessíveis no ambiente de construção (403), então não foi possível curar um vídeo de qualidade. O script de hero já ignora `<video data-hero-video>` em `prefers-reduced-motion` e `saveData`, caso se queira adicionar um depois.
- **Observação sobre pessoas nas fotos:** são fotos de banco de pessoas reais, usadas de forma ilustrativa. Evite apresentá-las como equipe/pacientes de uma clínica real.
- Uma foto do banco mostra, discretamente, uma marca no uniforme (modelo 2, planejamento digital); o recorte do bloco evita a área.

## 5. Testes realizados

Ambiente: build de produção (`npm run build`) servido por `astro preview`; Chromium via Playwright; Lighthouse 12 (mobile, throttling simulado padrão).

**Funcional — `node tools/odonto-qa.mjs` → 93 verificações, todas passam.** (Nas verificações abaixo, o item "×3" vale para os três modelos.)

- Agendamento completo ×3: motivo → profissional (filtrado por motivo) → calendário (dias passados, fora do expediente e feriados desabilitados) → horário → validação de campos vazios → máscara de telefone → resumo → `wa.me` com mensagem formatada (motivo, profissional, data, horário, nome, primeira consulta, convênio, observação) → download do `.ics` com `BEGIN:VCALENDAR`, `DTSTART` e `END:VEVENT` → reinício.
- Calendário por teclado ×3: setas movem o foco entre os dias, Enter seleciona.
- Fluxo de urgência ×3: pula o calendário e abre o painel com WhatsApp/ligação; sem erros de JavaScript.
- Quiz com 3 perfis ×3 modelos:
  - *Estética* (cor e formato, sem pressa, quer discrição) → 1º **Clareamento dental** nos 3.
  - *Dentes ausentes* (prótese parcial, sem pressa) → 1º **Implantes dentários** nos 3.
  - *Check-up para criança* → M3: **Odontopediatria** (sem aviso); M1 e M2 (não oferecem): aviso "atende adolescentes e adultos" + sugestões coerentes para adultos (Limpeza e prevenção no M1; Planejamento digital do sorriso no M2).
- Personalização `?empresa=Clinica+Sorriso+Teste&dr=Ana+Souza&cidade=Maringá&whats=5544988887777` nas 3 rotas **e** numa página de tratamento de cada modelo: título, nome, cidade (0 sobras de "Curitiba" no texto), dentista, links do WhatsApp, JSON-LD e persistência dos parâmetros nos links internos.
- Sem preço com `mostrarValores: false` (nenhum "R$" visível nas páginas). Com `PUBLIC_MOSTRAR_VALORES=true`: a seção de parcelamento aparece e calcula (R$ 12.000 em 10x → "10x de R$ 1.200,00 sem juros").

**Layout e acessibilidade — `node tools/odonto-audit.mjs` → sem observações** em 6 páginas × 375/768/1440 px: sem scroll horizontal, nenhum alvo de toque < 44 px (links em linha de texto excluídos), nenhum texto < 12 px, todas as imagens com `width`/`height`/`alt`, sem erros de console; com **JS desligado** e com **movimento reduzido** nenhum elemento fica preso em `opacity: 0`.

**Contraste (tokens):** texto principal e secundário ≥ 5,4:1 nos três modelos (M1 ≥ 8,1:1, M2 ≥ 7,7:1, M3 ≥ 5,4:1); botões ≥ 6,1:1; acento sobre fundo ≥ 5,4:1. Textos sobre foto têm degradê escuro ou plaquinha de fundo.

**Lighthouse mobile (local, throttling simulado):**

| Página | Perf | A11y | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/modelo-1/` | 96 | 100 | 100 | 100 | 2,5 s | 0 | 60 ms |
| `/modelo-2/` | 98 | 100 | 100 | 100 | 2,3 s | 0 | 40 ms |
| `/modelo-3/` | 96 | 100 | 100 | 100 | 2,7 s | 0 | 20 ms |
| tratamento M1 / M2 / M3 | 99 / 99 / 98 | 100 | 100 | 100 | 1,8 / 1,8 / 2,0 s | ≤0,001 | ≤110 ms |

Ajustes que levaram a esses números: CSS inline (`inlineStylesheets: 'always'`), `preload` do AVIF do hero e das fontes principais, entrada do hero só em CSS, degraus de 960 px no `srcset` (a landing da Clínica 3 caiu para 89 antes disso por servir imagens maiores que o necessário no celular) e Leaflet fora do caminho crítico. O Lighthouse usa throttling simulado e as notas variam alguns pontos entre execuções.

**Revisão de texto contra regras do CFO e palavras proibidas:** `python3 tools/odonto-palavras.py` → 0 ocorrências de demo/template/modelo/exemplo/lorem ipsum/placeholder/fictício/teste em texto visível, `alt`, `title` e meta (rotas `/modelo-X` e URLs excluídas). Busca adicional por R$, desconto, promoção, grátis, barato, sorteio, garantia, "sem dor", "100%" etc. nas páginas geradas: só ocorrências legítimas ("prótese definitiva", "não é uma garantia de resultado", "uso único").

## 6. Limitações conhecidas e pendências

- Tiles do mapa não puderam ser verificados visualmente no ambiente de construção (rede restrita aos tiles); o fallback com endereço e link foi verificado. Defina `PUBLIC_MAP_TILES` se for usar um provedor pago.
- A agenda é simulada (ver `getDisponibilidade()`); não há persistência de pedidos: a confirmação é feita no WhatsApp do próprio visitante.
- `SITE_URL` não está definido: canonical, `og:url` e `og:image` saem com o host do build. Defina antes de publicar.
- Sem vídeo de hero (ver seção 4).
- Páginas de tratamento têm o mesmo miolo de conteúdo entre modelos (a biblioteca é compartilhada); o hero, a navegação e o visual são próprios. Para diferenciar o texto por clínica, edite `chamadas` em cada `modelo-N.ts` ou crie variações em `tratamentos.ts`.
- Os ícones são um conjunto próprio simples (`src/lib/icons.ts`).
