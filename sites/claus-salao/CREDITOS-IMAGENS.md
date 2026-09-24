# Créditos e uso das mídias

## Origem

Todas as fotos em `src/assets/fotos/` e os dois vídeos em `public/video/`
vieram do **Instagram público do Claus Cabeleireiros**
([@claus.cabeleireiros](https://www.instagram.com/claus.cabeleireiros)).

Nenhuma é minha. Nenhuma é de banco de imagens. Nenhuma foi gerada por IA.

O bruto está em `imagens-claus/` e o tratamento em
`scripts/processar-midias.py` — recorte de bordas, proporção e compressão de
vídeo. Nenhum filtro, nenhuma cor mexida: é um salão, a foto é o trabalho
deles, e mexer em saturação falsificaria o resultado que a cliente vai
cobrar na cadeira.

## O que é especial neste acervo

Os dois pares do comparador antes/depois (`antes-loiro`/`depois-loiro` e
`antes-ruivo`/`depois-ruivo`) são a **mesma cliente, no mesmo dia** — dá para
conferir pela roupa e pelo enquadramento. É o único acervo da pasta em que
essa afirmação pode ser feita sem mentir.

## O que é aceitável

**Aceitável:** montar este protótipo e apresentá-lo **ao próprio salão**,
como proposta comercial.

**Não aceitável:**
- Deixar o demo indexável — por isso `site.demo === true` liga o `noindex`.
- Usar estas fotos em portfólio pessoal ou vitrine pública sem autorização.
- Reaproveitar qualquer uma em protótipo de **outro** cliente.
- Enviar estas imagens a serviços de terceiros — geradores de imagem/vídeo,
  upscalers, bancos de treino.
- Misturar as fotos dos pares do comparador com fotos de clientes diferentes.

## Ao fechar o contrato

Se o Claus Cabeleireiros contratar, peça:
1. Os **originais em alta** (o que está aqui foi recortado de print de
   Instagram, de 572 a 1355px de largura).
2. Autorização de uso das fotos e vídeos no site.
3. Confirmação dos dois telefones (fixo e WhatsApp) e do endereço.

Só depois disso vale virar `demo: false`.
