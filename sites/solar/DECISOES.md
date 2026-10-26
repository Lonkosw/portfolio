# Decisões tomadas durante a construção

Respostas da entrevista inicial: nomes sóbrios, uma cidade por modelo, um foco de público por modelo, WhatsApp provisório (11) 99999-0000. Sem referência visual indicada, usei só as 3 direções do briefing. Tudo o que não foi perguntado foi decidido abaixo.

## Projeto e estrutura

- O repositório já tinha um site-base para clientes (Astro + Tailwind). Mantive o projeto e **movi a antiga `/` para `/estudio`** (`src/pages/estudio.astro`), porque o briefing pede um índice neutro em `/`. Os componentes e dados do site antigo continuam intactos. Esse site antigo traz uma faixa de protótipo própria, então **não deve ser publicado junto** com as landings.
- O `README.md` anterior (do site-base) foi substituído por um que descreve as 3 landings.
- Cada empresa tem seu arquivo de dados em `src/data/empresa-N.ts`, incluindo as cores e as fontes. O layout (`src/layouts/Landing.astro`) aplica a paleta por variáveis CSS, e `src/styles/solar.css` as converte em classes do Tailwind (`bg-destaque`, `text-suave` etc.). Trocar de cliente é trocar o arquivo de dados.
- O simulador é um único componente (`Simulador.astro`) com 3 variantes de apresentação: `painel`, `etapas` e `ficha`. A lógica está em `src/lib/simulador.ts`, sem dependência do DOM.
- JS sem framework: um `base.ts` (revelação ao rolar, contadores, odômetro, parallax, menu, filtros) e o `simulador-client.ts`. O gráfico é SVG próprio, sem biblioteca.

## Empresas, cidades e textos

| Rota | Empresa | Cidade | Foco |
|---|---|---|---|
| `/modelo-1` | Aurora Engenharia Solar | São Paulo/SP | residencial e comercial |
| `/modelo-2` | Lume Energia Solar | Belo Horizonte/MG | residencial |
| `/modelo-3` | Vale Verde Solar | Goiânia/GO | comercial e rural |

- Endereços, telefones fixos, e-mails e perfis do Instagram são inventados e plausíveis. O WhatsApp é o mesmo (11) 99999-0000 nas três e deve ser trocado em `empresa-N.ts` (campo `whatsapp`).
- Números de prova (anos, sistemas, kWp, nota) são verossímeis e coerentes entre si (ex.: 3.200 sistemas, 18.400 kWp, média de ~5,7 kWp por sistema).
- Os depoimentos têm notas 4 e 5 e um ou outro comentário com ressalva (ex.: economia um pouco abaixo da estimativa no inverno, homologação mais longa), para soar natural.
- Palavras proibidas: busquei em todo o HTML gerado (texto, `alt`, `title`, meta, atributos). Substituí o que apareceu (ex.: "exemplo", "demorou", atributo `placeholder`). Sobraram apenas os caminhos `/modelo-N`, previstos como exceção.

## Simulador: desvios do enunciado e porquês

1. **Dimensionamento desconta o custo de disponibilidade.** A potência é calculada sobre `consumo − disponibilidade` (50 kWh residencial, 100 kWh comercial e rural), porque essa parcela é cobrada de qualquer jeito. Sem isso o sistema ficaria sempre superdimensionado.
2. **Economia = `min(conta × teto, conta − disponibilidade em R$)`.** O teto é 85% (residencial e rural) ou 88% (comercial), dentro da faixa de 80–90% pedida. Para contas baixas, o limite da taxa mínima é que manda (R$ 150 → ~69%), o que é realista.
3. **Reajuste tarifário de 5% ao ano** (o enunciado sugeria 6%). Escolhi 5% por prudência. Degradação de 0,5% ao ano, como pedido.
4. **Troca do inversor no ano 12** custando 8% do investimento, descontada da economia líquida e do gráfico. Não estava no enunciado, mas evita prometer mais do que a realidade.
5. **Payback por faixa:** o card mostra o payback no investimento médio e a faixa entre o custo mínimo e o máximo por kWp. O gráfico usa o investimento médio.
6. **Faixa de custo por tipo:** residencial R$ 3.800–5.000/kWp, comercial R$ 3.300–4.400, rural R$ 3.400–4.500 (sistemas maiores têm custo unitário menor).
7. **CO₂:** fator do SIN de 0,0385 kg/kWh (média recente, baixa porque a matriz é majoritariamente hídrica) e 22 kg de CO₂ por árvore por ano.
8. **Tarifa rural com fator 0,85** sobre a tarifa residencial da UF. Se o cliente informar a tarifa exata no campo avançado, esse valor prevalece.
9. **Slider logarítmico** de R$ 100 a R$ 20 mil com o campo numérico livre até R$ 100 mil, para que o mesmo controle sirva para casa e para fazenda.
10. **Aviso extra** sob o botão: "Valores nominais, sem descontar a inflação", porque a economia em 25 anos é uma soma de valores futuros.
11. Na mensagem de WhatsApp, a cidade da empresa só aparece quando a UF escolhida é a mesma da empresa; caso contrário, vai o nome do estado. (Bug encontrado nos testes e corrigido.)

Todos os valores das constantes são **médias aproximadas** e estão comentados em `src/data/solar-config.ts` com o aviso de revisão.

## Testes do simulador

Executados no navegador (Playwright), com o simulador do Modelo 1 e conferidos contra `src/lib/simulador.ts`:

| Cenário | Painéis | kWp | Economia/mês | Investimento (faixa) | Payback (médio e faixa) | Economia líquida 25 anos |
|---|---|---|---|---|---|---|
| R$ 150, SP, residencial | 2 | 1,10 | R$ 103 | R$ 4.180 a R$ 5.500 | 3,7 anos (3,2 a 4,2) | R$ 49,4 mil |
| R$ 600, SP, residencial | 9 | 4,95 | R$ 510 | R$ 18.810 a R$ 24.750 | 3,4 anos (2,9 a 3,8) | R$ 248,3 mil |
| R$ 3.000, SP, comercial | 47 | 25,85 | R$ 2.640 | R$ 85.305 a R$ 113.740 | 3,0 anos (2,6 a 3,4) | R$ 1,30 mi |
| R$ 3.000, GO, residencial | 44 | 24,20 | R$ 2.550 | R$ 91.960 a R$ 121.000 | 3,3 anos (2,9 a 3,7) | R$ 1,24 mi |
| R$ 600, RS, rural | 11 | 6,05 | R$ 510 | R$ 20.570 a R$ 27.225 | 3,7 anos (3,2 a 4,1) | R$ 246,0 mil |

Leitura: a conta de R$ 600 resulta em 9 painéis (não 40), e a de R$ 3.000 em um sistema de ~26 kWp, que cabe em ~120 m². A relação entre conta, painéis e área é coerente nos cinco casos. Também testei o slider (vai de R$ 100 a R$ 20.000), o fluxo em 3 etapas do Modelo 2 e o link do WhatsApp, cuja mensagem chega preenchida com conta, local, kWp, painéis e economia.

## Imagens

- Todas as fotos são do Unsplash, baixadas para `public/img/modelo-N/` em WebP (640, 1280 e 1920 px), sem repetir foto entre os modelos. O Pexels e a busca do Unsplash exigem autenticação neste ambiente, então selecionei fotos por ID conhecido e conferi cada uma visualmente.
- **Pendência:** o nome do fotógrafo de cada foto não pôde ser obtido (a página e a API do Unsplash bloqueiam acesso anônimo). `public/img/CREDITOS.md` lista arquivo, origem e licença, com o campo de autor marcado para completar. A licença do Unsplash não exige atribuição.
- Algumas fotos não mostram painéis (casas, lojas, lavouras). Os `alt` descrevem o que está na imagem, sem afirmar o que não aparece.
- As imagens de compartilhamento (`public/og/*.jpg`) ficaram fora de `/img/modelo-N` para não colocar "modelo" nas meta tags.

## SEO, acessibilidade e desempenho

- Cada página tem `title`, `description`, Open Graph, favicon (SVG embutido na cor da empresa) e JSON-LD `LocalBusiness`. As URLs de `og:image` são relativas, porque o domínio final não é conhecido (configure `site` no `astro.config.mjs` ao publicar).
- Contraste: o laranja do Modelo 3 só aparece como texto sobre fundo preto; sobre o concreto claro usei preto. Nos outros modelos, textos conferidos contra AA.
- Alvos de toque de 44 px ou mais, `label` em todos os campos, foco visível, `prefers-reduced-motion` respeitado (animações CSS e JS), animações só com `transform` e `opacity`.
- Largura testada em 375, 768 e 1440 px, sem rolagem horizontal.
- **Lighthouse não foi executado** (a ferramenta não está disponível neste ambiente). O que foi feito para sustentar a meta: imagens WebP com `srcset`, `lazy` fora do hero, hero com `fetchpriority=high`, JS pequeno e sem framework. Rodar o Lighthouse mobile antes de publicar é a pendência principal.
