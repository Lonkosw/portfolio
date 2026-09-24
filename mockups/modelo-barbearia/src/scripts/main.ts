/**
 * Ponto de entrada.
 *
 * Tudo aqui é leve e sem dependência: o site inteiro roda com poucos KB de
 * JavaScript. Não há GSAP, ScrollTrigger nem Lenis — a coreografia vive no
 * CSS, que a executa no compositor sem baixar nada.
 *
 * Este site não tem montador nem formulário: todo caminho para a conversa é
 * um <a href="https://wa.me/..."> escrito no build. O script cuida só do
 * cabeçalho, do menu e das entradas — sem comparador antes/depois nesta
 * versão (ver o comentário em `data/site.ts`), então nem o script existe.
 */
import { setupBase } from './base';

setupBase();
