"""Build crawlable visitor sitemaps in English, Russian and Latvian."""
from pathlib import Path
from html import escape
import re
from public_page_shell import document
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
LANGS = ('en', 'ru', 'lv')
COPY = {
    'en': ('Sitemap', 'All main TOLF Network Suite sections: VPN, Smart DNS, configuration tools and support.', 'Home', 'Services', 'Help and company', 'TOLF Network Suite', 'TOLF VPN — pay per gigabyte', 'TOLF Configurator — VPN and DNS profiles', 'TOLF Smart DNS', 'VPN setup and help', 'Company and contacts', 'Terms of service', 'Privacy', 'XML sitemap for search engines'),
    'ru': ('Карта сайта', 'Все основные разделы TOLF Network Suite: VPN, Smart DNS, конфигуратор и поддержка.', 'Главная', 'Сервисы', 'Помощь и компания', 'TOLF Network Suite', 'TOLF VPN — оплата за гигабайты', 'TOLF Configurator — профили VPN и DNS', 'TOLF Smart DNS', 'Настройка VPN и помощь', 'Компания и контакты', 'Условия сервиса', 'Конфиденциальность', 'XML-карта для поисковых систем'),
    'lv': ('Vietnes karte', 'TOLF Network Suite galvenās sadaļas: VPN, Smart DNS, konfigurators un atbalsts.', 'Sākumlapa', 'Pakalpojumi', 'Palīdzība un uzņēmums', 'TOLF Network Suite', 'TOLF VPN — maksa par gigabaitiem', 'TOLF Configurator — VPN un DNS profili', 'TOLF Smart DNS', 'VPN iestatīšana un palīdzība', 'Uzņēmums un kontakti', 'Pakalpojuma noteikumi', 'Privātums', 'XML vietnes karte meklētājprogrammām'),
}

def render(lang):
    c = COPY[lang]
    canonical = f'https://tolf.is/{lang}/sitemap.html'
    alternates = ''.join(f'<link rel="alternate" hreflang="{l}" href="https://tolf.is/{l}/sitemap.html">' for l in LANGS)
    switches = ''.join(f'<a href="/{l}/sitemap.html" lang="{l}" hreflang="{l}"' + (' aria-current="page" class="active"' if l == lang else '') + f'>{l.upper()}</a>' for l in LANGS)
    def link(url, label):
        return f'<li><a href="{escape(url, quote=True)}">{escape(label)}</a></li>'
    services = link(f'https://vpn.tolf.is/{lang}/', c[6]) + link(f'https://configurator.tolf.is/?lang={lang}', c[7]) + link(f'https://smartdns.tolf.is/?lang={lang}', c[8])
    support = link(f'https://tolf.is/{lang}/why-tolf.html', {'en':'Why TOLF?', 'ru':'Почему TOLF?', 'lv':'Kāpēc TOLF?'}[lang]) + link(f'https://vpn.tolf.is/help.html?lang={lang}', c[9]) + link(f'https://vpn.tolf.is/{lang}/contact.html', c[10]) + link(f'https://vpn.tolf.is/{lang}/terms.html', c[11]) + link(f'https://vpn.tolf.is/privacy.html?lang={lang}', c[12])
    page = f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{c[0]} — TOLF Network Suite</title><meta name="description" content="{c[1]}"><meta name="robots" content="index,follow">
<link rel="canonical" href="{canonical}">{alternates}<link rel="alternate" hreflang="x-default" href="https://tolf.is/en/sitemap.html">
<link rel="stylesheet" href="/styles.css?v=language-links-20261118"><link rel="stylesheet" href="/tolf-header.20260919-1.css?v=language-links-20261118">
<style>.map-header{{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-block:24px}}.map-header .brand{{display:inline-flex;align-items:center;gap:12px;font-size:26px;font-weight:700;line-height:1.2;letter-spacing:.10em;white-space:nowrap}}.map-header .brand-mark{{display:block;width:30px;height:30px;min-width:30px;flex:0 0 30px;object-fit:contain}}.map-main{{max-width:980px;padding-block:30px 60px}}.map-main h1{{font-size:clamp(30px,5vw,44px);margin:0 0 16px}}.map-intro{{color:var(--muted,#6e6e73);line-height:1.6}}.map-grid{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:28px 0}}.map-card{{border:1px solid var(--border,#d2d2d7);border-radius:18px;background:var(--card,#fff);padding:24px}}.map-card h2{{font-size:22px;margin:0 0 18px}}.map-card ul{{padding-left:22px;margin:0}}.map-card li{{padding:9px 0;line-height:1.5}}.map-main a{{color:var(--accent,#214680);text-underline-offset:3px}}.map-main a:focus-visible{{outline:2px solid currentColor;outline-offset:4px}}.map-footer{{border-top:1px solid var(--border,#d2d2d7);padding-top:20px}}@media(max-width:640px){{.map-grid{{grid-template-columns:1fr}}.map-card{{padding:20px}}}}</style></head>
<body><header class="shell map-header"><a class="brand" href="/{lang}/"><img class="brand-mark" src="/tolf-logo-star.svg" alt="" aria-hidden="true">TOLF</a><nav class="tolf-language" aria-label="EN / RU / LV">{switches}</nav></header>
<main class="shell map-main"><h1>{c[0]}</h1><p class="map-intro">{c[1]}</p><p><a href="/{lang}/">{c[2]} — {c[5]}</a></p>
<div class="map-grid"><section class="map-card"><h2>{c[3]}</h2><ul>{services}</ul></section><section class="map-card"><h2>{c[4]}</h2><ul>{support}</ul></section></div>
<footer class="map-footer"><a href="/sitemap.xml">{c[13]}</a></footer></main></body></html>
'''
    head = re.search(r'<head>(.*?)</head>', page, re.S)[1]
    head = re.sub(r'<style>.*?</style>', '', head, flags=re.S)
    head = re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', '', head)
    head = re.sub(r'<meta[^>]*(?:charset=|name="viewport")[^>]*>', '', head)
    content = re.search(r'<main[^>]*>(.*?)</main>', page, re.S)[1]
    content = content.replace(f'https://vpn.tolf.is/privacy.html?lang={lang}',f'https://vpn.tolf.is/{lang}/privacy.html')
    return document(lang, head, content, {l:f'https://tolf.is/{l}/sitemap.html' for l in LANGS})

for lang in LANGS:
    (ROOT / lang / 'sitemap.html').write_text(render(lang))

ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
xhtml = 'http://www.w3.org/1999/xhtml'
ET.register_namespace('', ns)
ET.register_namespace('xhtml', xhtml)
tree = ET.parse(ROOT / 'sitemap.xml')
root = tree.getroot()
for node in list(root):
    if node.find(f'{{{ns}}}loc').text.endswith('/sitemap.html'):
        root.remove(node)
for lang in LANGS:
    node = ET.SubElement(root, f'{{{ns}}}url')
    ET.SubElement(node, f'{{{ns}}}loc').text = f'https://tolf.is/{lang}/sitemap.html'
    for alt in (*LANGS, 'x-default'):
        ET.SubElement(node, f'{{{xhtml}}}link', rel='alternate', hreflang=alt, href=f'https://tolf.is/{"en" if alt == "x-default" else alt}/sitemap.html')
ET.indent(tree, space='  ')
tree.write(ROOT / 'sitemap.xml', encoding='UTF-8', xml_declaration=True)
