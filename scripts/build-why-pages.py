#!/usr/bin/env python3
"""Build static, independently indexable Why TOLF pages in all three languages."""
from pathlib import Path
from html import escape
import json
import xml.etree.ElementTree as ET
from public_page_shell import document

ROOT = Path(__file__).resolve().parents[1]
LANGS = ('en', 'ru', 'lv')
COPY = {
'ru': {
 'title': 'Почему TOLF?',
 'description': 'VPN с оплатой за гигабайты без подписки: несгораемый трафик, пробный пакет, выбор подключения, Smart DNS и конфигуратор.',
 'lead': 'TOLF Network Suite объединяет VPN, Smart DNS и инструменты настройки. Вы выбираете нужный инструмент, а в VPN платите за объём трафика — без ежемесячной подписки.',
 'sections': [
 ('Платите за гигабайты, а не за календарь', 'Вместо месяца доступа вы покупаете объём трафика. Это удобно, если VPN нужен в поездках, время от времени или только для отдельных задач. Скачивание и отправка данных учитываются вместе; 1 ГБ — это 1 миллиард байт.'),
 ('Остаток не сгорает', 'У оплаченного трафика нет срока действия. Неиспользованные гигабайты остаются на балансе, а новое пополнение прибавляется к остатку. Не нужно расходовать пакет до конца месяца.'),
 ('Без подписки и автоматических списаний', 'Вы сами решаете, когда и насколько пополнить баланс. Стоимость и доступные способы оплаты показываются перед покупкой. Покупка трафика не создаёт ежемесячную подписку.'),
 ('Сначала проверьте на своей сети', 'Пробный пакет 1 ГБ доступен один раз на зарегистрированный аккаунт, без банковской карты и ограничения по времени. Он позволяет проверить подключение на своём устройстве и у своего оператора. Пробный и оплаченный остатки отображаются отдельно; возможность активации видна в личном кабинете.'),
 ('Выбирайте способ подключения', 'TOLF поддерживает iPhone, iPad, Android и Windows. Для VPN доступны IKEv2 и AnyConnect; на iOS можно также использовать Shadowrocket. Доступные способы зависят от устройства. Shadowrocket приобретается отдельно. Быстрая настройка помогает начать, а ручная — выбрать параметры.'),
 ('Местные сайты можно открывать напрямую', 'В конфигурации Shadowrocket можно выбрать прямой доступ для российских доменов .ru, .su, .рф и латвийских .lv. Такие обращения идут через обычное подключение, с вашим обычным IP, и не расходуют VPN-трафик TOLF. Правила относятся к этому способу подключения; это не автоматическая функция всех клиентов.'),
 ('Три инструмента для разных задач', 'VPN создаёт туннель для сетевого трафика. Smart DNS шифрует DNS-запросы и применяет правила их обработки, но не заменяет VPN и не шифрует весь трафик устройства. Smart DNS включён при положительном остатке оплаченного трафика; условия доступа видны в аккаунте. Бесплатный конфигуратор создаёт профили VPN и DNS из заданных параметров и доступен без регистрации.'),
 ('Когда TOLF подходит, а когда стоит сравнить', 'Если вы пользуетесь VPN нерегулярно, несгораемый баланс позволяет оплачивать фактический расход. Если вы каждый день передаёте большие объёмы данных, сравните стоимость своего расхода с безлимитной подпиской: оплата за гигабайты может оказаться дороже. Скорость и доступность зависят от оператора, сети и выбранного сервера; пробный пакет помогает проверить это до покупки.')],
 'next': 'Начните с проверки', 'ending': 'Посмотрите способы подключения и условия учёта трафика. Затем войдите в аккаунт, чтобы увидеть доступность пробного пакета и текущие условия оплаты.', 'vpn': 'О TOLF VPN', 'config': 'Открыть конфигуратор'},
'en': {
 'title': 'Why TOLF?',
 'description': 'Pay-per-gigabyte VPN without a subscription: traffic that does not expire, a trial, connection options, Smart DNS and configuration tools.',
 'lead': 'TOLF Network Suite brings together VPN, Smart DNS and configuration tools. Choose the tool you need and pay for the traffic you use with the VPN, without a monthly subscription.',
 'sections': [
 ('Pay for gigabytes, not calendar days', 'Buy a traffic allowance instead of a month of access. This suits travel, occasional connections and specific tasks. Downloads and uploads both count; 1 GB means 1 billion bytes.'),
 ('Keep your unused balance', 'Paid traffic has no expiry date. Unused gigabytes remain on your balance, and top-ups add to what is left. There is no need to use up a package before the end of the month.'),
 ('No subscription or automatic charges', 'You decide when to top up and how much traffic to buy. Prices and available payment methods are shown before purchase. Buying traffic does not create a monthly subscription.'),
 ('Try it on your own network first', 'A 1 GB trial is available once per registered account, without a bank card or time limit. Test the connection on your device and with your network provider. Trial and paid balances are shown separately; your account shows whether activation is available.'),
 ('Choose your connection method', 'TOLF supports iPhone, iPad, Android and Windows. VPN options include IKEv2 and AnyConnect; iOS users can also use Shadowrocket. Available methods depend on the device. Shadowrocket is purchased separately. Quick setup helps you get started, while manual setup lets you choose parameters.'),
 ('Let local sites use your regular connection', 'In a Shadowrocket configuration, you can choose direct access for Russian .ru, .su and .рф domains and Latvian .lv domains. These requests use your regular connection and IP address without consuming TOLF VPN traffic. These rules apply to this connection method and are not an automatic feature of every client.'),
 ('Three tools for different tasks', 'VPN creates a tunnel for network traffic. Smart DNS encrypts DNS requests and applies rules to their handling, but does not replace a VPN or encrypt all device traffic. Smart DNS is included while your paid traffic balance is positive; access conditions are shown in your account. The free configurator creates VPN and DNS profiles from your settings and works without registration.'),
 ('When TOLF fits, and when to compare', 'For occasional VPN use, a balance that does not expire lets you pay for actual traffic. If you transfer large amounts every day, compare your expected traffic cost with an unlimited subscription: paying per gigabyte may cost more. Speed and availability depend on your provider, network and selected server; the trial lets you test before buying.')],
 'next': 'Start with a test', 'ending': 'Read about connection methods and traffic accounting, then sign in to check trial availability and current payment conditions.', 'vpn': 'About TOLF VPN', 'config': 'Open Configurator'},
'lv': {
 'title': 'Kāpēc TOLF?',
 'description': 'VPN ar maksu par gigabaitiem bez abonēšanas: datu apjoms bez derīguma termiņa, izmēģinājums, savienojumu izvēle, Smart DNS un konfigurators.',
 'lead': 'TOLF Network Suite apvieno VPN, Smart DNS un konfigurēšanas rīkus. Izvēlieties vajadzīgo rīku un maksājiet par VPN datu apjomu bez ikmēneša abonēšanas.',
 'sections': [
 ('Maksājiet par gigabaitiem, nevis kalendāra dienām', 'Jūs iegādājaties datu apjomu, nevis piekļuvi uz mēnesi. Tas ir ērti ceļojumos, neregulārai lietošanai vai atsevišķiem uzdevumiem. Tiek uzskaitīti gan lejupielādētie, gan augšupielādētie dati; 1 GB ir 1 miljards baitu.'),
 ('Neizmantotais atlikums saglabājas', 'Apmaksātajam datu apjomam nav derīguma termiņa. Neizmantotie gigabaiti paliek kontā, un papildinājumi tiek pieskaitīti atlikumam. Nav jāiztērē pakete līdz mēneša beigām.'),
 ('Bez abonēšanas un automātiskiem maksājumiem', 'Jūs pats izlemjat, kad un par cik papildināt atlikumu. Cena un pieejamie maksājuma veidi tiek parādīti pirms pirkuma. Datu apjoma iegāde neveido ikmēneša abonementu.'),
 ('Vispirms pārbaudiet savā tīklā', '1 GB izmēģinājuma pakete ir pieejama vienu reizi katram reģistrētam kontam, bez bankas kartes un laika ierobežojuma. Pārbaudiet savienojumu savā ierīcē un sava operatora tīklā. Izmēģinājuma un apmaksātais atlikums tiek rādīti atsevišķi; aktivizēšanas pieejamība ir redzama kontā.'),
 ('Izvēlieties savienojuma veidu', 'TOLF atbalsta iPhone, iPad, Android un Windows. VPN savienojumam ir pieejami IKEv2 un AnyConnect; iOS var izmantot arī Shadowrocket. Pieejamie veidi ir atkarīgi no ierīces. Shadowrocket jāiegādājas atsevišķi. Ātrā iestatīšana palīdz sākt, bet manuālā ļauj izvēlēties parametrus.'),
 ('Vietējās vietnes var atvērt tieši', 'Shadowrocket konfigurācijā var izvēlēties tiešu piekļuvi Krievijas .ru, .su un .рф domēniem un Latvijas .lv domēniem. Šie pieprasījumi izmanto parasto savienojumu un jūsu parasto IP adresi, netērējot TOLF VPN datu apjomu. Noteikumi attiecas uz šo savienojuma veidu un nav automātiska visu klientu funkcija.'),
 ('Trīs rīki dažādiem uzdevumiem', 'VPN izveido tuneli tīkla datplūsmai. Smart DNS šifrē DNS pieprasījumus un piemēro to apstrādes noteikumus, bet neaizstāj VPN un nešifrē visu ierīces datplūsmu. Smart DNS ir iekļauts, kamēr apmaksātā datu apjoma atlikums ir pozitīvs; piekļuves nosacījumi ir redzami kontā. Bezmaksas konfigurators izveido VPN un DNS profilus no ievadītajiem parametriem un ir pieejams bez reģistrācijas.'),
 ('Kad TOLF ir piemērots un kad vērts salīdzināt', 'Ja VPN lietojat neregulāri, atlikums bez derīguma termiņa ļauj maksāt par faktisko datu patēriņu. Ja katru dienu pārsūtāt lielu datu apjomu, salīdziniet savas izmaksas ar neierobežotu abonementu: maksa par gigabaitiem var būt lielāka. Ātrums un pieejamība ir atkarīgi no operatora, tīkla un izvēlētā servera; izmēģinājums ļauj to pārbaudīt pirms pirkuma.')],
 'next': 'Sāciet ar pārbaudi', 'ending': 'Iepazīstieties ar savienojumu veidiem un datu uzskaiti. Pēc tam piesakieties kontā, lai pārbaudītu izmēģinājuma pieejamību un aktuālos maksājumu nosacījumus.', 'vpn': 'Par TOLF VPN', 'config': 'Atvērt konfiguratoru'}
}

for lang, c in COPY.items():
    url = f'https://tolf.is/{lang}/why-tolf.html'
    urls = {l: f'https://tolf.is/{l}/why-tolf.html' for l in LANGS}
    head = f'<title>{escape(c["title"])} — TOLF Network Suite</title><meta name="description" content="{escape(c["description"], quote=True)}"><meta name="robots" content="index,follow"><link rel="canonical" href="{url}">'
    head += ''.join(f'<link rel="alternate" hreflang="{l}" href="{u}">' for l,u in urls.items())
    head += f'<link rel="alternate" hreflang="x-default" href="{urls["en"]}">'
    head += f'<meta property="og:title" content="{escape(c["title"], quote=True)} — TOLF"><meta property="og:description" content="{escape(c["description"], quote=True)}"><meta property="og:url" content="{url}"><meta property="og:type" content="website">'
    data = {'@context':'https://schema.org','@type':'WebPage','url':url,'name':c['title'],'description':c['description'],'inLanguage':lang}
    head += '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False)+'</script>'
    content = f'<h1>{c["title"]}</h1><p class="lead">{c["lead"]}</p>'
    content += ''.join(f'<section><h2>{escape(h)}</h2><p>{escape(p)}</p></section>' for h,p in c['sections'])
    content += f'<section><h2>{c["next"]}</h2><p>{c["ending"]}</p><div class="next"><a class="button-link" href="https://vpn.tolf.is/{lang}/">{c["vpn"]}</a><a href="https://configurator.tolf.is/?lang={lang}">{c["config"]}</a></div></section>'
    (ROOT/lang/'why-tolf.html').write_text(document(lang,head,content,urls))

ns='http://www.sitemaps.org/schemas/sitemap/0.9'
xhtml='http://www.w3.org/1999/xhtml'
ET.register_namespace('',ns)
ET.register_namespace('xhtml',xhtml)
tree=ET.parse(ROOT/'sitemap.xml')
root=tree.getroot()
for node in list(root):
    if node.find(f'{{{ns}}}loc').text.endswith('/why-tolf.html'):
        root.remove(node)
for lang in LANGS:
    node=ET.SubElement(root,f'{{{ns}}}url')
    ET.SubElement(node,f'{{{ns}}}loc').text=f'https://tolf.is/{lang}/why-tolf.html'
    for alt in (*LANGS,'x-default'):
        ET.SubElement(node,f'{{{xhtml}}}link',rel='alternate',hreflang=alt,href=f'https://tolf.is/{"en" if alt=="x-default" else alt}/why-tolf.html')
ET.indent(tree,space='  ')
tree.write(ROOT/'sitemap.xml',encoding='UTF-8',xml_declaration=True)
