#!/usr/bin/env python3
"""Busca final por palavras proibidas em texto visível, alt, title, meta e aria-label (dist/ e src/)."""
import re, sys, pathlib
from html.parser import HTMLParser
PROIB = re.compile(r"\b(demo|demonstra[cç][aã]o|template|modelos?|exemplos?|lorem|ipsum|placeholder|fict[ií]ci[oa]s?|testes?)\b", re.I)
ATTRS = {"alt", "title", "aria-label", "content", "placeholder", "aria-labelledby"}
URL = re.compile(r"https?://\S+|/modelo-[123]/?\S*|\\u002F|/img/modelo-[123]/\S+")
def busca(t): return PROIB.search(URL.sub("", t))
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.skip = 0; s.achados = []; s.ld = False
    def handle_starttag(s, tag, attrs):
        if tag in ("style",) or (tag == "script"):
            d = dict(attrs); s.ld = d.get("type") == "application/ld+json"; s.skip += 0 if s.ld else 1
        for k, v in attrs:
            if k in ATTRS and v and busca(v): s.achados.append((f"@{k}", v))
    def handle_endtag(s, tag):
        if tag in ("style", "script"):
            if not s.ld and s.skip: s.skip -= 1
            s.ld = False
    def handle_data(s, d):
        if s.skip: return
        if busca(d): s.achados.append(("texto", d.strip()[:120]))
total = 0
for f in sorted(pathlib.Path("dist").rglob("*.html")):
    p = P(); p.feed(f.read_text(encoding="utf-8"))
    for k, v in p.achados:
        total += 1; print(f"[dist] {f}: {k}: {v}")
# Dados e scripts (textos que entram no site via JS/JSON)
for f in list(pathlib.Path("src/data").rglob("*.ts")) + list(pathlib.Path("src/scripts").rglob("*.ts")) + list(pathlib.Path("src/components").rglob("*.astro")) + list(pathlib.Path("src/pages").rglob("*.astro")) + list(pathlib.Path("src/lib").rglob("*.ts")):
    if "_template-original" in str(f) or "/clients/" in str(f) or f.name == "DemoBanner.astro" or f.name in ("About.astro","Contact.astro","Gallery.astro","Hero.astro","Services.astro") : continue   # template legado do portfólio, fora das 3 clínicas
    for i, l in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        l2 = re.sub(r"modelo-[123]", "", l)           # rotas /modelo-X são exceção
        l2 = re.sub(r"//.*$", "", l2)                    # comentários
        l2 = re.sub(r"grid-template[\w-]*|placeholder=|\bplaceholder\b(?=\s*[:=])|a\[href\^=\"/modelo-\"\]", "", l2)  # propriedades CSS/atributos, não texto
        l2 = re.sub(r"\b(Modelo|modelo)\b(?=[A-Za-z]*\s*[:=,)])", "", l2) if False else l2
        if busca(l2) and not re.search(r"^\s*(\*|/\*|//)", l):
            total += 1; print(f"[src] {f}:{i}: {l.strip()[:140]}")
print(f"\n{total} ocorrência(s)")
sys.exit(1 if total else 0)
