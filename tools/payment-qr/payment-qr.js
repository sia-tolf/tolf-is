const translations={"ru": ["QR для перевода на счёт", "Введите реквизиты рублёвого счёта и скачайте готовый QR-код.", "ФИО получателя", "Номер счёта — 20 цифр", "Название банка", "БИК — 9 цифр", "Корреспондентский счёт — 20 цифр", "ИНН получателя (необязательно)", "Сумма, ₽ (необязательно)", "Назначение перевода (необязательно)", "Создать QR-код", "Очистить", "Скачать PNG", "Открыть картинку", "QR появится здесь", "Реквизиты обрабатываются только в вашем браузере и не отправляются на сервер.", "Это перевод по реквизитам, не СБП. Распознавание счёта физлица зависит от приложения банка отправителя. Проверьте получателя, комиссию и срок перед подтверждением; начните с небольшой суммы.", "Если сумма не указана, отправитель введёт её в банке.", "Неверная длина или контрольная сумма счёта. Проверьте счёт и БИК.", "Не используйте символ | или переносы строк в реквизитах.", "Введите положительную сумму с точностью до копеек.", "Не удалось создать QR-код. Проверьте реквизиты и сократите назначение.", "QR-код готов. После изменения реквизитов создайте его заново.", "На главную", "Укажите ИНН из 10 или 12 цифр.", "Например: Перевод собственных средств", "Реквизиты берите в приложении банка. Здесь нужен номер счёта, а не карты.", "Получатель и банк", "Сумма и назначение", "Поделиться PNG", "Не удалось открыть картинку. Скачайте PNG."], "en": ["Bank transfer QR", "Enter a RUB account’s bank details and download a QR code.", "Recipient’s full name", "Account number — 20 digits", "Bank name", "BIC — 9 digits", "Correspondent account — 20 digits", "Recipient tax ID (optional)", "Amount, RUB (optional)", "Transfer purpose (optional)", "Create QR code", "Clear", "Download PNG", "Open image", "Your QR code will appear here", "Bank details are processed only in your browser and are not sent to a server.", "This is a transfer using bank details, not SBP. Support for personal accounts depends on the sender’s banking app. Check the recipient, fee and timing before confirming; start with a small amount.", "Leave the amount blank to let the sender enter it in their bank.", "Invalid account length or checksum. Check the account and BIC.", "Do not use | or line breaks in bank details.", "Enter a positive amount with at most two decimal places.", "Unable to create QR. Check the details and shorten the purpose.", "QR code ready. Generate it again after editing any details.", "Home", "Enter a tax ID with 10 or 12 digits.", "For example: Transfer of own funds", "Copy the details from your bank. Use the account number, not a card number.", "Recipient and bank", "Amount and purpose", "Share PNG", "Unable to open the image. Download PNG instead."], "lv": ["QR pārskaitījumam uz kontu", "Ievadiet rubļu konta rekvizītus un lejupielādējiet QR kodu.", "Saņēmēja pilns vārds un uzvārds", "Konta numurs — 20 cipari", "Bankas nosaukums", "BIC — 9 cipari", "Korespondentkonts — 20 cipari", "Saņēmēja nodokļu numurs (nav obligāts)", "Summa, RUB (nav obligāta)", "Maksājuma mērķis (nav obligāts)", "Izveidot QR kodu", "Notīrīt", "Lejupielādēt PNG", "Atvērt attēlu", "Šeit parādīsies QR kods", "Rekvizīti tiek apstrādāti tikai jūsu pārlūkā un netiek nosūtīti uz serveri.", "Tas ir pārskaitījums pēc rekvizītiem, nevis SBP. Privātpersonu kontu atbalsts ir atkarīgs no sūtītāja bankas lietotnes. Pirms apstiprināšanas pārbaudiet saņēmēju, komisiju un izpildes laiku; sāciet ar nelielu summu.", "Ja summa nav norādīta, sūtītājs to ievadīs bankā.", "Nederīgs konta garums vai kontrolsumma. Pārbaudiet kontu un BIC.", "Rekvizītos neizmantojiet simbolu | vai jaunas rindas.", "Ievadiet pozitīvu summu ar ne vairāk kā divām zīmēm aiz komata.", "Neizdevās izveidot QR kodu. Pārbaudiet rekvizītus un saīsiniet maksājuma mērķi.", "QR kods ir gatavs. Pēc rekvizītu maiņas izveidojiet to vēlreiz.", "Sākumlapa", "Ievadiet nodokļu numuru ar 10 vai 12 cipariem.", "Piemēram: Savu līdzekļu pārskaitījums", "Kopējiet rekvizītus no bankas. Nepieciešams konta, nevis kartes numurs.", "Saņēmējs un banka", "Summa un mērķis", "Kopīgot PNG", "Neizdevās atvērt attēlu. Lejupielādējiet PNG."]};

'use strict';
const $=id=>document.getElementById(id), form=$('payment-form');
let lang='ru', imageURL=null, pngBlob=null, errorKey=null;
function tr(i){return translations[lang][i];}
function language(next){
 lang=translations[next]?next:'ru';document.documentElement.lang=lang;document.title=tr(0)+' — TOLF';
 document.querySelectorAll('[data-i]').forEach(el=>el.textContent=tr(+el.dataset.i));
 document.querySelectorAll('[data-lang]').forEach(el=>{el.classList.toggle('active',el.dataset.lang===lang);el.setAttribute('aria-pressed',String(el.dataset.lang===lang));});
 if(errorKey!==null)$('error').textContent=tr(errorKey);
 if(pngBlob)$('status').textContent=tr(22);
 try{localStorage.setItem('tolf-language',lang);}catch{}
}
function invalidate(){if(imageURL)URL.revokeObjectURL(imageURL);imageURL=null;pngBlob=null;$('downloads').hidden=true;$('qr').hidden=true;$('empty').hidden=false;$('status').textContent='';$('error').textContent='';errorKey=null;}
function fail(key,id){errorKey=key;$('error').textContent=tr(key);if(id)$(id).focus();return null;}
function digits(s){return s.replace(/\s/g,'');}
function checksum(account,prefix){const v=prefix+account;return /^\d{23}$/.test(v)&&[...v].reduce((s,c,i)=>s+Number(c)*[7,1,3][i%3],0)%10===0;}
function payload(){
 const v={};for(const input of form.querySelectorAll('input')){v[input.name]=input.value.trim();if(/[|\r\n\x00-\x1f]/.test(v[input.name]))return fail(19,input.id);}
 if(!v.Name||!v.BankName)return fail(21,!v.Name?'Name':'BankName');
 for(const k of ['PersonalAcc','BIC','CorrespAcc','PayeeINN'])v[k]=digits(v[k]);
 if(!/^\d{9}$/.test(v.BIC))return fail(18,'BIC');
 if(!/^\d{20}$/.test(v.PersonalAcc)||!checksum(v.PersonalAcc,v.BIC.slice(-3)))return fail(18,'PersonalAcc');
 if(!/^\d{20}$/.test(v.CorrespAcc)||!checksum(v.CorrespAcc,'0'+v.BIC.slice(4,6)))return fail(18,'CorrespAcc');
 if(v.PayeeINN&&!/^\d{10}(\d{2})?$/.test(v.PayeeINN))return fail(24,'PayeeINN');
 const pairs=['Name','PersonalAcc','BankName','BIC','CorrespAcc'].map(k=>k+'='+v[k]);
 if(v.PayeeINN)pairs.push('PayeeINN='+v.PayeeINN);
 if(v.Sum){let s=v.Sum.replace(',','.');if(!/^\d{1,10}(\.\d{1,2})?$/.test(s))return fail(20,'Sum');let [rub,kopecks='']=s.split('.');let cents=Number(rub)*100+Number(kopecks.padEnd(2,'0'));if(cents<=0)return fail(20,'Sum');pairs.push('Sum='+cents);}
 if(v.Purpose)pairs.push('Purpose='+v.Purpose);
 return 'ST00012|'+pairs.join('|');
}
qrcode.stringToBytes=s=>Array.from(new TextEncoder().encode(s));
let generation=0;
form.addEventListener('input',()=>{generation++;invalidate();});
form.addEventListener('reset',()=>{generation++;invalidate();});
form.addEventListener('submit',async event=>{
 event.preventDefault();invalidate();const stamp=++generation;const data=payload();if(!data)return;
 try{
  const code=qrcode(0,'M');code.addData(data,'Byte');code.make();const count=code.getModuleCount(),scale=Math.max(6,Math.ceil(1024/(count+8))),size=(count+8)*scale;
  const canvas=$('qr');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.fillStyle='#000';
  for(let y=0;y<count;y++)for(let x=0;x<count;x++)if(code.isDark(y,x))ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(stamp!==generation)return;if(!blob)throw new Error('PNG');
  pngBlob=blob;imageURL=URL.createObjectURL(blob);$('download').href=imageURL;$('downloads').hidden=false;$('qr').hidden=false;$('empty').hidden=true;$('status').textContent=tr(22);
  const file=new File([blob],'TOLF-payment-QR.png',{type:'image/png'});$('share').hidden=!(navigator.canShare&&navigator.canShare({files:[file]}));
 }catch{fail(21);}
});
$('open').addEventListener('click',()=>{if(imageURL){const tab=window.open(imageURL,'_blank');if(tab)tab.opener=null;else fail(30);}});
$('share').addEventListener('click',async()=>{if(pngBlob)try{await navigator.share({files:[new File([pngBlob],'TOLF-payment-QR.png',{type:'image/png'})]});}catch(e){if(e.name!=='AbortError')fail(30);}});
document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>language(el.dataset.lang)));
let saved='ru';try{saved=localStorage.getItem('tolf-language')||navigator.language.slice(0,2);}catch{}
language(new URLSearchParams(location.search).get('lang')||saved);
