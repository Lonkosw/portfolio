# Template de site para clientes (Astro + Tailwind)

Template reutilizável para gerar protótipos de site para pequenos negócios locais.
Cada cliente vive em um único arquivo de dados — trocar o cliente ativo é trocar uma
variável de ambiente e rebuildar, sem editar HTML/CSS espalhado pelo projeto.

## Como funciona

- `src/data/types.ts` — formato (`ClientData`) que todo cliente precisa seguir.
- `src/data/clients/*.ts` — um arquivo por cliente (nome, telefone, whatsapp, cores, textos, fotos).
- `src/data/clients/index.ts` — carrega todos os clientes e seleciona o ativo via `CLIENT_ID`.
- `src/data/studio.ts` — seus próprios dados (nome/whatsapp), usados na faixa de "protótipo de demonstração".
- `src/components/` — Hero, Sobre, Serviços, Galeria, Contato — todos lidos a partir do cliente ativo.
- `src/layouts/Layout.astro` — aplica a paleta de cores do cliente via CSS variables.

## Adicionar um novo cliente

1. Copie `src/data/clients/exemplo.ts` para `src/data/clients/nome-do-cliente.ts`.
2. Preencha nome, telefone, whatsapp, cores (inspiradas no Instagram do negócio), textos e fotos
   (banco de imagens genérico, ex: `https://picsum.photos/seed/<algo>/1600/900`).
3. No `.env`, defina:
   ```
   CLIENT_ID=nome-do-cliente
   ```
4. Rode `npm run dev` para conferir, depois `npm run build` para gerar o site estático em `./dist`.

## Comandos

| Comando           | Ação                                          |
| :----------------- | :--------------------------------------------- |
| `npm install`       | Instala as dependências                        |
| `npm run dev`       | Sobe o servidor local em `localhost:4321`      |
| `npm run build`     | Gera o site estático de produção em `./dist/`  |
| `npm run preview`   | Pré-visualiza o build de produção localmente   |

## Deploy por cliente (Vercel/Netlify)

Cada protótipo pode virar um projeto separado apontando para este mesmo repositório,
com a variável de ambiente `CLIENT_ID` configurada por projeto (ex: `demo-empresa.vercel.app`).
