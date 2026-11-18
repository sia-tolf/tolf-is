#!/usr/bin/env python3
"""Generate the three public homepages from templates/home.html.

Run with python3 scripts/build-homepages.py after editing the shared template.
The root homepage is an English alias with /en/ as its canonical URL.
"""
import html
import json
import re
import runpy
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ("en", "ru", "lv")
VOID_ELEMENTS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
ROUTES = {
    "vpn": "https://vpn.tolf.is/",
    "configurator": "https://configurator.tolf.is/",
    "account-signin": "https://vpn.tolf.is/auth/?mode=signin&next=home",
    "account-create": "https://vpn.tolf.is/auth/?mode=signup&next=home",
    "privacy": "https://vpn.tolf.is/privacy.html",
    "terms": "https://vpn.tolf.is/terms.html",
    "contact": "https://vpn.tolf.is/contact.html",
}
LABELS = {
    "en": {"home": "TOLF home", "language": "Language", "systems": "Supported operating systems", "footer": "Footer", "overview": "About TOLF VPN", "locale": "en_GB"},
    "ru": {"home": "Главная TOLF", "language": "Язык", "systems": "Поддерживаемые операционные системы", "footer": "Ссылки", "overview": "О TOLF VPN", "locale": "ru_RU"},
    "lv": {"home": "TOLF sākumlapa", "language": "Valoda", "systems": "Atbalstītās operētājsistēmas", "footer": "Saites", "overview": "Par TOLF VPN", "locale": "lv_LV"},
}


def localized_url(url, language):
    parts = urlsplit(url)
    if parts.netloc == "vpn.tolf.is" and parts.path in ("/privacy.html", "/terms.html", "/contact.html"):
        return "https://vpn.tolf.is/" + language + parts.path
    query = dict(parse_qsl(parts.query))
    query["lang"] = language
    return urlunsplit(parts._replace(query=urlencode(query)))


class HomepageParser(HTMLParser):
    """Collect localized text ranges without reformatting the template markup."""

    def __init__(self, source, language):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.language = language
        self.offsets = [0]
        self.offsets.extend(match.end() for match in re.finditer("\n", source))
        self.stack = []
        self.edits = []

    def source_offset(self):
        line, column = self.getpos()
        return self.offsets[line - 1] + column

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        start = self.source_offset()
        opening = self.get_starttag_text()
        updated = opening
        route = attrs.get("data-route")
        if route in ROUTES:
            updated = re.sub(r'href="[^"]*"', 'href="' + html.escape(localized_url(ROUTES[route], self.language), quote=True) + '"', updated)
        if "data-vpn-overview" in attrs:
            updated = re.sub(r'href="[^"]*"', f'href="https://vpn.tolf.is/{self.language}/"', updated)
        if "data-sitemap-link" in attrs:
            updated = re.sub(r'href="[^"]*"', f'href="/{self.language}/sitemap.html"', updated)
        if attrs.get("class") == "brand":
            updated = updated.replace('href="/"', f'href="/{self.language}/"')
        if attrs.get("id") == f"lang-{self.language}":
            updated = updated[:-1] + ' class="active" aria-current="page">'
        for original, key in [("TOLF home", "home"), ("Language", "language"), ("Supported operating systems", "systems"), ("Footer", "footer")]:
            updated = updated.replace(f'aria-label="{original}"', f'aria-label="{LABELS[self.language][key]}"')
        if updated != opening:
            self.edits.append((start, start + len(opening), updated))
        if tag not in VOID_ELEMENTS:
            self.stack.append((tag, attrs, start + len(opening)))

    def handle_startendtag(self, tag, attributes):
        self.handle_starttag(tag, attributes)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1][0] != tag:
            raise ValueError(f"Unexpected closing tag {tag}")
        _, attrs, content_start = self.stack.pop()
        content_end = self.source_offset()
        translation = attrs.get("data-" + self.language)
        if "data-vpn-overview" in attrs:
            translation = LABELS[self.language]["overview"]
        if translation is not None:
            self.edits.append((content_start, content_end, translation))


def render(source, language, metadata):
    parser = HomepageParser(source, language)
    parser.feed(source)
    if parser.stack:
        raise ValueError("Unclosed template elements")
    result = source
    for start, end, replacement in sorted(parser.edits, reverse=True):
        result = result[:start] + replacement + result[end:]
    title, description = metadata[language]
    canonical = f"https://tolf.is/{language}/"
    result = result.replace('<html lang="en"', f'<html lang="{language}"', 1)
    result = re.sub(r"<title>.*?</title>", "<title>" + html.escape(title) + "</title>", result, count=1)
    for selector, value in [("name=\"description\"", description), ("property=\"og:title\"", title), ("property=\"og:description\"", description), ("property=\"og:url\"", canonical)]:
        result = re.sub(r'<meta ' + re.escape(selector) + r' content="[^"]*">', '<meta ' + selector + ' content="' + html.escape(value, quote=True) + '">', result, count=1)
    alternates = '\n'.join(f'<link rel="alternate" hreflang="{lang}" href="https://tolf.is/{lang}/">' for lang in LANGUAGES)
    result = result.replace('<link rel="canonical" href="https://tolf.is/">', f'<link rel="canonical" href="{canonical}">\n{alternates}\n<link rel="alternate" hreflang="x-default" href="https://tolf.is/en/">')
    structured = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        "url": canonical,
        "name": title,
        "description": description,
        "inLanguage": language,
        "isPartOf": {"@type": "WebSite", "@id": "https://tolf.is/#website", "url": "https://tolf.is/", "name": "TOLF Network Suite"},
    }
    result = result.replace('</head>', f'<meta property="og:locale" content="{LABELS[language]["locale"]}">\n<script type="application/ld+json">{json.dumps(structured, ensure_ascii=False)}</script>\n</head>', 1)
    return result


def main():
    source = (ROOT / "templates/home.html").read_text()
    metadata = json.loads(re.search(r'<script id="tolf-search-metadata" type="application/json">(.*?)</script>', source, re.S)[1])
    for language in LANGUAGES:
        target = ROOT / language / "index.html"
        target.parent.mkdir(exist_ok=True)
        target.write_text(render(source, language, metadata))
    (ROOT / "index.html").write_text(render(source, "en", metadata))
    alternates = ''.join(f'<xhtml:link rel="alternate" hreflang="{lang}" href="https://tolf.is/{lang}/"/>' for lang in LANGUAGES)
    alternates += '<xhtml:link rel="alternate" hreflang="x-default" href="https://tolf.is/en/"/>'
    entries = '\n'.join(f'  <url><loc>https://tolf.is/{lang}/</loc>{alternates}</url>' for lang in LANGUAGES)
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + entries + '\n</urlset>\n')
    runpy.run_path(str(ROOT / 'scripts/build-sitemap-pages.py'))


if __name__ == "__main__":
    main()
