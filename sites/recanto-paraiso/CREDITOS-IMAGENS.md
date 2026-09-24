# Créditos e uso das imagens

## Origem

Todas as fotos em `src/assets/images/` **e o vídeo em `public/video/`** vieram do
**Instagram público do Recanto Paraíso**
([@recantoparaisomaringa](https://www.instagram.com/recantoparaisomaringa)).

Nenhuma foto é minha. Nenhuma é de banco de imagens. Nenhuma foi gerada por IA.

O bruto está em `imagens/` e o tratamento em `scripts/processar-midias.py` —
recorte de bordas, proporção e nada mais. Nenhum filtro, nenhuma cor mexida.

**Três arquivos traziam marca d'água de fotógrafo** (`paulo silva` no 07,
`@paulosilva_fotografias` no 04, uma assinatura no 09). Elas saíram no corte de
enquadramento — e isso **não é permissão**. As fotos continuam sendo dos
fotógrafos contratados pelos casais. Se o site for para o ar de verdade, ou o
crédito volta, ou a foto é trocada por uma que a Rosane tenha direito de usar.

## De quem elas são

Do Recanto Paraíso — e, em boa parte, dos **fotógrafos de casamento contratados
pelos casais** que se casaram lá. Uma foto de casamento costuma ter dois donos de
interesse: o espaço, que a publica como material de divulgação, e o fotógrafo, que
detém o direito autoral da imagem.

Antes de publicar em domínio próprio, vale conferir se alguma foto traz marca
d'água de fotógrafo. Se trouxer, ou se troca, ou se mantém o crédito visível.

## O que é aceitável

**Aceitável:** montar este protótipo e apresentá-lo **à própria Rosane**, como
proposta comercial. O material é dela, o site é sobre o negócio dela, e o objetivo
é mostrar o que ela teria.

**Não aceitável:**

- Deixar o demo indexável, competindo no Google com o Instagram dela pelo nome do
  próprio espaço — é atrapalhar o negócio da pessoa antes da primeira conversa.
  Por isso `site.demo === true` liga o `noindex`.
- Usar as fotos em portfólio pessoal, anúncio ou vitrine pública sem autorização
  por escrito dela.
- Reaproveitar qualquer uma destas fotos em protótipo de **outro** cliente.
- Enviar estas imagens a serviços de terceiros — geradores de imagem/vídeo,
  upscalers, bancos de treino.
- Reproduzir o logo ou a marca gráfica deles. O site usa só o nome em tipografia.

## Ao fechar o contrato

Se o Recanto contratar, peça:

1. Os **originais em alta** (o que está aqui foi recortado de print de Instagram:
   de 458 a 1080px de largura, e é esse teto que impede as fotos de sangrarem a
   tela inteira no site).
2. Autorização de uso das fotos no site.
3. O nome dos fotógrafos que ela quiser creditar.

Só depois disso vale virar `demo: false` e deixar o site ser indexado.
