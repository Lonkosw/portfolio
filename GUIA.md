# Guia: criar o site de uma barbearia do zero

Tempo típico: 20 a 40 minutos com o material em mãos. Tudo é um arquivo JSON mais uma pasta de fotos; o esqueleto não precisa ser editado.

## 1. Junte o material (antes de começar)

| Dado | De onde vem | Obrigatório |
|---|---|---|
| Nome, cidade, Instagram | perfil da barbearia | sim |
| Logo | foto de perfil ou arte do Instagram (recortar) | sim |
| Fotos de cortes (8 a 14) e do espaço (1 a 3) | grade do Instagram | recomendado |
| WhatsApp | bio do Instagram ou o dono | para o agendamento enviar |
| Endereço | Google Maps, ou a bio | recomendado |
| Horário de funcionamento | Google Maps, artes do Instagram | recomendado |
| Tabela de preços | artes do Instagram, o dono | recomendado |
| Equipe (nome, foto, especialidade) | posts de apresentação | opcional |
| Vídeo do espaço | o dono ou o Instagram | opcional (hero) |

**Se um dado não existe, não o invente.** Deixe o campo de fora e liste a seção em `emBreve` (ver passo 5). Avaliações do Google entram sem o nome do cliente. Não copie arte de terceiros nem fotos de clientes de frente, principalmente crianças.

## 2. Escolha o exemplo mais parecido

| Se a barbearia... | Copie |
|---|---|
| tem tabela de preços e combos mensais | `palhares.json` |
| tem equipe com fotos e identidade clássica | `mustache.json` |
| é moderna, clara, sem equipe cadastrada | `paparazzi.json` |
| tem várias unidades, planos de assinatura, vídeo | `saintpatricks.json` |

```bash
cp src/data/palhares.json src/data/minha-barbearia.json
mkdir -p public/img/minha-barbearia
```

O nome do arquivo e o campo `slug` do JSON precisam ser iguais; viram a URL `/minha-barbearia/`.

## 3. Preencha o JSON

### Campos básicos (todo site)

```json
{
  "slug": "minha-barbearia",
  "tema": "vintage",
  "nome": "Barbearia Exemplo",
  "nomeCurto": "Exemplo",
  "tagline": "Frase curta da marca.",
  "subtagline": "Segunda linha opcional.",
  "cidade": "Maringá",
  "uf": "PR",
  "instagram": "usuario_sem_arroba",
  "logo": "/img/minha-barbearia/logo.webp",
  "logoClaro": "/img/minha-barbearia/logo-claro.webp",
  "logoW": 30,
  "logoH": 44,
  "servicos": [ { "grupo": "Cortes", "itens": [ { "id": "degrade", "nome": "Corte degradê", "preco": 40, "principal": true } ] } ],
  "preview": { "autor": "Seu nome", "whatsapp": "5544999999999" }
}
```

- **`tema`**: `vintage`, `moderno` ou `verde`. Sem o campo, usa o `ouro` (preto e dourado).
- **`logo` e `logoClaro`**: versão escura (para fundo claro) e clara (para fundo escuro), WebP com transparência. `logoW` e `logoH` em pixels evitam o layout pular.
- **`servicos`**: grupos de itens. `id` único, `preco` número (ou `null` se não confirmado, aparece "a definir"). `principal: true` marca os 6 que aparecem direto; o resto fica em "ver tabela completa". Se nenhum for principal, usa os 6 primeiros.
- **`preview`**: quem criou a prévia. Aparece na faixa do topo ("Falar com o ..."), com o seu WhatsApp. Troque pelo seu.

### Contato e local (opcionais, aparecem só se existirem)

```json
"whatsapp": "5544999999999",
"telefone": "(44) 3333-0000",
"endereco": "Av. Exemplo, 123",
"complemento": "Centro",
"mapsBusca": "Barbearia Exemplo Av. Exemplo 123 Maringá PR",
"horarios": [
  { "dias": "Segunda a sexta", "weekdays": [1,2,3,4,5], "abre": "09:00", "fecha": "20:00" },
  { "dias": "Sábado", "weekdays": [6], "abre": "08:00", "fecha": "19:00" }
]
```

- **`whatsapp`**: só dígitos, com 55 e DDD. Sem ele o botão final fica "WhatsApp em breve". Atenção a números de diretório: confirme antes de publicar.
- **`horarios`**: `weekdays` 0 = domingo a 6 = sábado. O agendamento gera os horários de 30 em 30 minutos a partir deles. Sem `horarios`, a mensagem diz "a combinar pelo WhatsApp".
- **Várias unidades**: use `"unidades": [ { "nome": "...", "endereco": "...", "mapsBusca": "..." } ]`. "Onde estamos" lista todas e o agendamento pergunta a unidade (ver `saintpatricks.json`).

### Seções opcionais

| Campo | Seção | Exemplo |
|---|---|---|
| `combos` + `regrasCombos` | pacotes mensais | `palhares.json` |
| `planos` + `planosSub` + `beneficiosPlanos` | assinaturas ("Corte infinito") | `saintpatricks.json` |
| `equipe` (`nome`, `papel`, `foto`, `bio`, `especialidades`) + `equipeSub` | cartões do time, com "Agendar com ele" | `mustache.json` |
| `barbeiros` (só nomes) | escolha de barbeiro no agendamento, sem seção | `palhares.json` |
| `galeria` (nomes de arquivo sem extensão) | grade de cortes | todos |
| `ambiente` + `ambienteTexto` | fotos do espaço | `palhares.json` |
| `avaliacoes` (`texto`, `quando`) | frases do Google, sem nome | `palhares.json` |
| `desde` | "desde 20XX" no topo | `palhares.json` |

- **`fluxo`: `"barbeiro-primeiro"`** coloca a escolha do barbeiro como primeiro passo do agendamento (usa as fotos de `equipe`).

### Hero (topo)

- **Sem vídeo, tema ouro**: `"hero": ["/img/x/hero-1.webp", "/img/x/hero-2.webp", "/img/x/hero-3.webp"]` (3 faixas de fotos).
- **Tema vintage ou moderno**: usa os 3 primeiros retratos (`hero` ou as fotos da `equipe`).
- **Com vídeo**: `"heroVideo": { "poster": "...", "posterSm": "...", "mp4": "/video/x.mp4", "webm": "/video/x.webm", "logo": "..." }`. Veja o passo 6.

## 4. Fotos

Coloque em `public/img/<slug>/`. WebP, qualidade ~70, cerca de 360x470 para cortes.

- Recorte as fotos dos prints sem o ícone de vídeo/pin do canto superior direito (corte o topo ou cubra o fundo).
- Prefira cortes de lado, nuca e 3/4. Evite artes com texto, pôsteres e rostos de crianças de frente.
- Nome dos arquivos da galeria: `corte-01.webp`, `corte-02.webp`... e liste `"galeria": ["corte-01", "corte-02"]`.
- Logo com transparência: extraia de um frame limpo ou da arte; confira nos dois fundos.

Python com Pillow resolve o recorte e a conversão (ver exemplos de uso no histórico do projeto); `sharp` (Node) também serve.

## 5. O que ainda não se sabe: "Em breve"

Liste o que falta, e a seção aparece com selo em vez de dado falso:

```json
"emBreve": ["servicos", "horarios", "endereco", "whatsapp", "galeria", "planos"],
"provisorio": true
```

`provisorio: true` ajusta o rodapé ("alguns dados ainda serão definidos"). Quando o dono mandar os dados, preencha o JSON, tire os itens de `emBreve` e o `provisorio`, e publique de novo.

## 6. Vídeo no hero (opcional)

Use ffmpeg, **sempre sem áudio**, vertical 720p, H.264 High nível 4.2 a 60 fps, faststart, com `-vf` para acelerar (`setpts=PTS/2` dá um timelapse 2x suave). Evite 3x ou mais: pular muitos quadros parece travado. Deixe o loop sem emenda (crossfade de 0,5 s). Alvo de 3 a 5 MB por formato, mp4 e webm (VP9). Gere um poster WebP de um bom quadro.

O site carrega o vídeo só depois da página, nunca com economia de dados, conexão lenta ou movimento reduzido, tenta de novo no primeiro toque se o celular bloquear o autoplay, e cai no webm se o mp4 falhar. Dê um nome novo ao arquivo quando trocar o vídeo, para o cache não servir o antigo.

## 7. Testar

```bash
npm run build
npm run preview        # abre http://localhost:4321/minha-barbearia/
```

Confira no navegador em 1366 e em 390 de largura: sem erro no console, sem rolagem lateral, a mensagem do WhatsApp sai certa (clique em "Enviar" e veja o texto no link), "Em breve" onde faltar. Desempenho: Lighthouse no celular deve ficar em 95 ou mais (vídeo pode custar alguns pontos).

## 8. Publicar (Cloudflare Pages)

Todas as páginas saem com `X-Robots-Tag: noindex` (arquivo `public/_headers`) e uma página 404 de verdade (`public/404.html`).

```bash
export CLOUDFLARE_API_TOKEN=...      # permissão Pages:Edit
export CLOUDFLARE_ACCOUNT_ID=...
npm run build
npx wrangler pages project create SEU-PROJETO --production-branch main --force   # só na primeira vez
npx wrangler pages deploy dist --project-name SEU-PROJETO --branch main
```

Confira que `https://SEU-PROJETO.pages.dev/<slug>/` responde 200, que o `noindex` está nos cabeçalhos e que os arquivos de vídeo respondem com `content-type: video/...`. Os nomes de projeto do Pages são únicos no mundo todo: se `portfolio-barbearia` estiver ocupado, o endereço ganha um sufixo.

## 9. Criar um tema novo (só se a marca pedir)

1. Crie `src/styles/<tema>.css` seguindo `vintage.css` ou `verde.css`: redefina as variáveis (`--bg`, `--fg`, `--ouro`, `--display`...) dentro de `[data-tema='<tema>']` e ajuste as seções.
2. Importe o CSS e as fontes em `src/pages/[slug].astro` (as fontes vêm de `@fontsource/...`; instale com `npm i @fontsource/nome-da-fonte`) e use `"tema": "<tema>"` no JSON.
3. Confira que os outros temas seguem iguais (cores e fontes) antes de seguir.

## 10. Checklist antes de mandar o link

- [ ] Nenhum dado inventado (preço, horário, WhatsApp, equipe, nota, anos).
- [ ] WhatsApp testado (principalmente se veio de diretório ou tem 8 dígitos).
- [ ] Fotos sem pôster, sem ícone de vídeo e sem criança de frente.
- [ ] `noindex` e 404 funcionando; link com a barra no final.
- [ ] Faixa do topo com o seu nome e WhatsApp.
- [ ] Mensagem curta ao dono: o que é, que é uma prévia, e o que falta ele mandar.

## Problemas comuns

- **A página não aparece**: o `slug` do JSON difere do nome do arquivo, ou o JSON está com vírgula sobrando (`npm run build` mostra o erro).
- **Vídeo não toca no celular**: refaça em H.264 nível 4.2 (não 3.1) e confira `playsinline` e `muted` (já no esqueleto).
- **Layout pula**: informe `logoW` e `logoH`, e mantenha `width` e `height` nas imagens novas.
- **Preço "a definir" aparecendo**: o item tem `"preco": null`; preencha com o valor.
