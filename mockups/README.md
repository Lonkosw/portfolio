# mockups/ — as peças de venda do contato frio

Aqui não moram sites de cliente. Moram os **modelos demonstrativos** que vão
no primeiro contato frio, e depois os mockups personalizados por lead
(`mockup-lead-1`, `mockup-lead-2`…) quando alguém demonstrar interesse.

## Nicho: salão de beleza — teste A/B de layout

| | Modelo A | Modelo B |
| :--- | :--- | :--- |
| No ar | https://modelo-a-salao.netlify.app | https://modelo-b-salao.netlify.app |
| Base | `sites/claus-salao` | `sites/concetto-di-bellezza` |
| Seções | 6 — curto e direto | 12 — longo e completo |
| Tem | antes/depois, 2 vídeos sob toque, galeria, serviços | + espaço, carrossel de tipos, diagnóstico capilar, produção, unhas, depoimentos |
| Peso 1ª visita (4G) | 562 KB | 276 KB |
| LCP (4G, CPU 4×) | ~1,1 s | ~1,7 s |

**Os dois usam exatamente as mesmas fotos.** Isso é de propósito: eles
existem para testar qual LAYOUT converte melhor, e se as imagens mudassem
junto não daria para saber se a diferença de resposta veio do layout ou das
fotos. A única variável é a estrutura da página.

### O acervo

Tudo é Pexels, gerado por `processar-midias.py` a partir de
`.fotos-banco/` (que não vai para o Git):

```bash
python mockups/processar-midias.py
```

O script grava nos dois modelos de uma vez, já com os nomes de pasta que
cada projeto espera (`src/assets/fotos` no A, `src/assets/images` no B).

### O antes/depois é real — e é um par só

Banco de imagem não tem par antes/depois. Foi verificado em três frentes
(Pexels `hair transformation`, `hair extensions before after`, Unsplash): o
que existe são fotos avulsas de pessoas diferentes. O Stilo Cabeleireiro
bateu nesse mesmo muro e teve de baixar a promessa para "cada lado é uma
pessoa diferente".

A saída foi **séries do mesmo ensaio**: no Pexels, fotos do mesmo upload
recebem ids vizinhos. Varrendo vizinhos e olhando a folha de contato,
apareceu uma série com a mesma modelo em dois estados —
`28994386` (cabelo sendo penteado) → `28994564` (finalizado).

Um segundo candidato (`7440131` → `7440128`) foi **reprovado**: em tamanho
real, o suposto "antes" já estava com o cabelo ondulado. Eram dois ângulos
do mesmo resultado. Um par verdadeiro vale mais que dois forçados.

⚠️ Par novo entra só se passar no mesmo teste: **mesma pessoa, mesma
sessão, estados visivelmente diferentes**. Ver a memória
`comparador-so-com-pares-de-verdade`.

### Por que o teto de largura é 1000px

Começou em 1400 e foi medido para baixo. Com 1400, o `larguras()` dos
componentes oferecia esse degrau no `srcset`, o navegador escolhia ele, e a
primeira visita do modelo A baixava **834 KB só de imagem**. Foto de banco é
rica em textura e comprime muito pior que print de Instagram. O mesmo teto
vale para todo modelo novo da pasta.

## Nicho: barbearia

| | Barbearia Ferro |
| :--- | :--- |
| No ar | https://modelo-barbearia-848.netlify.app |
| Base | esqueleto do Modelo A (6 seções) |
| Seções | 5 — sem "antes e depois" nesta versão |
| Tem | 2 vídeos sob toque (corte e barba), galeria de 12, 4 serviços, sobre |
| Peso 1ª visita (4G) | 287 KB |
| LCP (4G, CPU 4×) | ~0,4 s |

Herdou o esqueleto curto do salão (mesmo Astro, mesmo CSS, mesmas
ferramentas de QA), mas com acervo, paleta e tipografia próprios — ver
`modelo-barbearia/src/styles/global.css` para o raciocínio da paleta
carvão + vermelho-tijolo (lida do avental do barbeiro e da fachada vintage
do acervo, não escolhida a esmo).

**Sem "antes e depois" nesta versão.** Banco de imagem de barba/corte tem
fartura, mas nenhum par achado passou no critério de
`comparador-so-com-pares-de-verdade` (mesma pessoa, mesmo dia, estados
visivelmente diferentes) — o candidato mais próximo era o mesmo corte visto
de dois ângulos, não um antes/depois de verdade. Em vez de forçar, a seção
ficou de fora e o nav aponta só para o que existe: vídeos, trabalhos e
serviços.

**Os pôsteres dos vídeos não são frames reais.** Sem `ffmpeg` disponível no
ambiente em que foram montados, a saída foi usar uma foto do mesmo assunto
(corte/barba) como capa em vez do frame extraído do próprio arquivo — ver o
comentário em `modelo-barbearia/src/data/site.ts`. Se `ffmpeg` estiver
disponível depois, o correto é extrair o frame de verdade.

## O que NÃO pode mudar em nenhum modelo desta pasta

- **`demo: true` fica para sempre.** Modelo demonstrativo com foto de banco
  não pode entrar na busca nem perder a faixa de aviso — viraria um site que
  mente sobre ser o negócio de alguém. A faixa também é o que cumpre a
  licença do Pexels (proibido sugerir que a pessoa retratada endossa o
  negócio).
- **Sem JSON-LD.** Os sites de cliente publicam dados estruturados
  (`HairSalon`, `BarberShop`); aqui o negócio é fictício e o endereço é
  placeholder. Dado estruturado é o que máquina lê e acredita.
- **Sem depoimento real e sem nota do Google real.** O Concetto tem
  mensagens de clientes de verdade e nota 5,0 com 166 avaliações. Copiar
  aquilo para cá seria emprestar a reputação de um negócio real para vender
  aos concorrentes dele. Os balões aqui são exemplos e dizem isso.

## Pendências

- ⚠️ **O WhatsApp é placeholder** (`5544000000000`) em todos os modelos.
  Num modelo demonstrativo os botões devem cair na conversa com o Théo —
  quem clica em "agendar" está, na prática, pedindo orçamento de site.
  Trocar antes de disparar.
- A Netlify injeta um badge **"Powered by Netlify"** nos projetos criados
  agora (os antigos, como o do Claus, não têm). Não está no DOM acessível —
  é shadow DOM fechado. Remover seria mexer em atribuição do plano
  gratuito, então fica como decisão consciente.
