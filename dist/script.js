const menuButton = document.querySelector('.menu-toggle');
function closeMenu() {
 document.body.classList.remove('menu-open');
 menuButton?.setAttribute('aria-expanded','false');
 menuButton?.setAttribute('aria-label','Abrir menu');
}
menuButton?.addEventListener('click',()=>{
 const open=document.body.classList.toggle('menu-open');
 menuButton.setAttribute('aria-expanded',String(open));
 menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
});
document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
function setText(selector,value){if(value!==undefined)document.querySelectorAll(selector).forEach(e=>e.textContent=value);}
function updateContact(contact) {
 document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href='tel:+'+contact.phoneDigits;a.textContent=contact.phoneDisplay;});
 document.querySelectorAll('a[href*="wa.me/"]').forEach(a=>{
  const query=new URL(a.href).search;
  a.href='https://wa.me/'+contact.phoneDigits+query;
 });
 document.querySelectorAll('a[href*="instagram.com"],a[data-contact-link="instagram"]').forEach(a=>{
  a.href=contact.instagramUrl;
  if(!a.classList.contains('button')&&!a.querySelector('[data-contact-label]'))a.textContent=contact.instagramHandle;
 });
 setText('[data-contact-label="phone"]',contact.phoneDisplay);
 setText('[data-contact-label="instagram"]',contact.instagramHandle);
}
function useOptimizedImage(img,source) {
 const builtIn=/^\/?assets\/(massagem-hero|sobre-jaleco-roxo|indicacao-toalha|ilustracao-massagem|servico-(?:therapeutic|relaxing|cupping|drainage))\.(?:png|webp)$/.exec(source);
 if(builtIn){
  const base='/assets/'+builtIn[1];
  img.src=base+'.webp';img.srcset=base+'-640.webp 640w, '+base+'.webp 1440w';
  img.sizes='(max-width:700px) calc(100vw - 40px), 560px';
 }else{img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=source;}
 img.decoding='async';
}
function applyMedia(media={}) {
 document.querySelectorAll('[data-media]').forEach(img=>{
  const key=img.dataset.media,src=media[key];
  if(src!==undefined){
   img.hidden=!src;
   if(src){
    img.setAttribute('data-media-loading','');
    const reveal=()=>img.removeAttribute('data-media-loading');
    img.onload=reveal;img.onerror=reveal;
    useOptimizedImage(img,src);
    if(img.complete&&img.naturalWidth)reveal();
   }
  }
  if(media[key+'Position']!==undefined)img.style.objectPosition=media[key+'Position']+'% center';
  if(key==='about'){
   img.closest('.about-art').hidden=img.hidden;
   document.querySelector('.about-grid')?.classList.toggle('without-photo',img.hidden);
  }
 });
}
const serviceRoutes={therapeutic:'massagem-terapeutica.html',relaxing:'massagem-relaxante.html',cupping:'ventosaterapia.html',drainage:'drenagem-linfatica.html'};
const servicePaths={"leaf": "M12 36C7 23 17 12 38 7c1 19-7 31-22 29M9 43l21-25M17 33l-1-9m7 2 8-1", "heart": "M24 40 9 25C-2 13 13 3 24 15 35 3 50 13 39 25Z", "relaxing": "M24 38C12 30 12 19 24 7c12 12 12 23 0 31ZM16 17l-7-3c-2 12 2 21 15 24M32 17l7-3c2 12-2 21-15 24M11 27l-7-1c2 11 11 16 20 12M37 27l7-1c-2 11-11 16-20 12", "cupping": "M5 18h24c9 0 9-12 2-12-4 0-6 3-5 6M4 25h34c9 0 9-13 2-13M7 32h21c9 0 9 12 2 12-4 0-6-3-5-6M13 10h5c6 0 6-8 1-8", "drainage": "M24 5C21 10 10 23 10 30a14 14 0 0 0 28 0C38 23 27 10 24 5ZM30 29c1 5-2 8-6 9", "therapeutic": "M18 43v-7c0-4-3-7-6-10l-4-4c-3-3-6 0-3 3l5 6M5 23V10c0-4 4-4 4 0v9M11 21V8c0-4 4-4 4 0v15M4 26c0 5 3 10 7 13v4M30 43v-7c0-4 3-7 6-10l4-4c3-3 6 0 3 3l-5 6M43 23V10c0-4-4-4-4 0v9M37 21V8c0-4-4-4-4 0v15M44 26c0 5-3 10-7 13v4"};
function catalogIcon(name,image){if(image&&/^\/\.netlify\/functions\/media\?id=[a-f0-9-]{36}$/.test(image)){const img=document.createElement("img");img.src=image;img.alt="";img.className="custom-service-icon";img.width=56;img.height=56;img.decoding="async";return img;}const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 48 48');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',servicePaths[name]||servicePaths.leaf);svg.append(path);return svg;}
function catalogElement(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function applyCatalog(content){
 const services=content.services||{};
 const page=document.querySelector('[data-service-page]');
 if(page?.hasAttribute('data-dynamic-service')){
  const key=new URLSearchParams(location.search).get('id');const service=Object.hasOwn(services,key)?services[key]:null;
  const message=document.querySelector('#service-loading');
  if(!service){page.hidden=true;if(message){message.hidden=false;message.textContent='Não foi possível encontrar este serviço. Volte à página inicial ou tente novamente em instantes.';}return;}
  page.dataset.servicePage=key;
  page.querySelectorAll('[data-media]').forEach(img=>{img.dataset.media=key+(img.closest('.indication-photo')?'Indication':'');img.alt=service.title;});
  const media=content.media||(content.media={});
  media[key] ||= media.hero;media[key+'Indication'] ||= media[key]||media.hero;
  page.hidden=false;if(message)message.hidden=true;
 }
 const current=page?.dataset.servicePage;
 for(const [selector,related] of [['#servicos .service-grid',false],['.related-service-grid',true]]){
  const grid=document.querySelector(selector);if(!grid)continue;
  const entries=Object.entries(services).filter(([key])=>!related||key!==current);
  if(related)grid.closest('.related-services').hidden=!entries.length;
  grid.replaceChildren(...entries.map(([key,service])=>{
   const card=catalogElement('a',related?'related-service-card':'service-card');
   card.href=serviceRoutes[key]||'servico.html?id='+encodeURIComponent(key);
   const icon=catalogElement('span','service-icon');icon.append(catalogIcon(service.icon||(serviceRoutes[key]?key:'leaf'),service.iconImage));
   const description=related?service.subtitle:(content.texts?.[key+'Description']||service.subtitle);
   card.append(icon,catalogElement('h3','',service.title),catalogElement('p','',description),catalogElement('span',related?'related-link':'service-link','Conhecer serviço →'));
   return card;
  }));
 }
}

function applyService(services={}) {
 document.querySelectorAll('[data-related-service]').forEach(card=>{
  const item=services[card.dataset.relatedService];if(!item)return;
  card.querySelectorAll('[data-related-field]').forEach(el=>{if(item[el.dataset.relatedField])el.textContent=item[el.dataset.relatedField];});
 });
 const page=document.querySelector('[data-service-page]');
 const service=services[page?.dataset.servicePage];
 if(!service)return;
 document.title=service.title+' | Nicole Krause';
 page.querySelector('.service-hero-icon')?.replaceChildren(catalogIcon(service.icon||(serviceRoutes[page.dataset.servicePage]?page.dataset.servicePage:'leaf'),service.iconImage));
 const benefits=page.querySelector('.service-benefits .benefit-grid');
 const priorIcons=benefits?[...benefits.querySelectorAll('.feature-icon svg')]:[];
 if(benefits&&Array.isArray(service.benefits))benefits.replaceChildren(...service.benefits.map((text,i)=>{
  const item=catalogElement('div','benefit-item');const icon=catalogElement('div','feature-icon');icon.append(service.iconImage?catalogIcon(service.icon,service.iconImage):serviceRoutes[page.dataset.servicePage]&&priorIcons[i]?priorIcons[i].cloneNode(true):catalogIcon(service.icon||'leaf'));item.append(icon,catalogElement('h3','',text));return item;
 }));
 const steps=page.querySelector('.steps');
 if(steps&&Array.isArray(service.steps))steps.replaceChildren(...service.steps.map(([title,text])=>{const li=catalogElement('li');const body=catalogElement('div');body.append(catalogElement('strong','',title),catalogElement('p','',text));li.append(body);return li;}));
 page.querySelectorAll('a[href*="wa.me/"]').forEach(a=>{const url=new URL(a.href);url.searchParams.set('text','Olá! Gostaria de agendar '+service.title.toLowerCase()+'.');a.href=url.href;});
 page.querySelectorAll('[data-service-field]').forEach(e=>{
  const value=service[e.dataset.serviceField];if(value!==undefined)e.textContent=value;
 });
 const list=page.querySelector('[data-service-indications]');
 if(list&&Array.isArray(service.indications))list.replaceChildren(...service.indications.map(text=>{
  const li=document.createElement('li');li.textContent=text;return li;
 }));
}
function applyContent(content) {
 applyCatalog(content);applyMedia(content.media);applyService(content.services);
 const t=content.texts||{};
 const selectors={
  heroEyebrow:'.hero-copy .eyebrow',heroTitle:'.hero-copy h1',heroText:'.hero-copy > p:not(.eyebrow)',
  servicesTitle:'#servicos .section-heading h2',servicesIntro:'#servicos .section-heading > p:last-child',
  aboutTitle:'#sobre .about-copy h2',benefitsTitle:'#beneficios .section-heading h2',
  benefitsIntro:'#beneficios .section-heading > p:last-child',ctaTitle:'#contato h2',
  ctaText:'#contato .cta-card > div > p:not(.eyebrow)'
 };
 Object.entries(selectors).forEach(([key,selector])=>setText(selector,t[key]));
 const about=document.querySelectorAll('#sobre .about-copy > p:not(.eyebrow)');
 if(about[0]&&t.aboutParagraph1)about[0].textContent=t.aboutParagraph1;
 if(about[1]&&t.aboutParagraph2)about[1].textContent=t.aboutParagraph2;
 if(content.contact)updateContact(content.contact);
 const track=document.querySelector('.testimonial-track');
 if(track&&Array.isArray(content.testimonials)){
  const visible=content.testimonials.filter(r=>r.visible!==false);
  track.closest('#depoimentos').hidden=!visible.length;
  track.replaceChildren(...visible.map(r=>{
   const article=document.createElement('article');article.className='testimonial-card';
   const stars=document.createElement('div');stars.className='stars';stars.setAttribute('aria-label',r.stars+' estrelas');stars.textContent='★'.repeat(r.stars);
   const quote=document.createElement('blockquote');quote.textContent='“'+r.text+'”';
   const author=document.createElement('div');author.className='testimonial-author';
   if(r.photo){const img=document.createElement('img');img.src=r.photo;img.alt=r.name;img.loading='lazy';img.decoding='async';img.width=42;img.height=42;author.append(img);}
   const cite=document.createElement('cite');cite.textContent='— '+r.name;author.append(cite);
   article.append(quote,stars,author);return article;
  }));
 }
 setupTestimonials();
}
function setupTestimonials(){
 const track=document.querySelector('.testimonial-track');if(!track)return;
 track._cleanup?.();
 const controls=document.createElement('div');controls.className='testimonial-controls';
 let paused=false,hover=false,touching=false;
 const media=matchMedia('(max-width:700px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const visibleCount=()=>media.matches?1:3;
 const move=direction=>{const step=(track.firstElementChild?.getBoundingClientRect().width||0)+18;const max=track.scrollWidth-track.clientWidth;const next=track.scrollLeft+step*direction;track.scrollTo({left:next>max+2?0:next< -2?max:Math.min(next,max),behavior:reduce.matches?'instant':'smooth'});};
 const button=(label,text,fn)=>{const b=document.createElement('button');b.type='button';b.ariaLabel=label;b.textContent=text;b.addEventListener('click',fn);controls.append(b);return b;};
 button('Depoimento anterior','←',()=>move(-1));
 const pause=button('Pausar passagem automática','Pausar',()=>{paused=!paused;update();});
 button('Próximo depoimento','→',()=>move(1));track.after(controls);
 function update(){controls.hidden=track.children.length<=visibleCount();pause.textContent=paused?'Continuar':'Pausar';pause.ariaLabel=paused?'Continuar passagem automática':'Pausar passagem automática';pause.hidden=reduce.matches;}
 track.onmouseenter=()=>hover=true;track.onmouseleave=()=>hover=false;
 track.ontouchstart=()=>touching=true;track.ontouchend=track.ontouchcancel=()=>touching=false;
 const timer=setInterval(()=>{if(paused||hover||touching||reduce.matches||document.hidden||controls.hidden||track.parentElement.contains(document.activeElement))return;const rect=track.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)move(1);},5500);
 media.addEventListener('change',update);reduce.addEventListener('change',update);update();
 track._cleanup=()=>{clearInterval(timer);controls.remove();media.removeEventListener('change',update);reduce.removeEventListener('change',update);};
}
async function loadContent(){
 try{
  const response=await fetch('/.netlify/functions/content',{cache:'no-store',signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Content unavailable');
  applyContent(await response.json());
 }catch{
  try{const fallback=await fetch('/content-defaults.json',{signal:AbortSignal.timeout(5000)});if(fallback.ok)applyContent(await fallback.json());}catch{}
 }finally{document.documentElement.classList.remove('media-pending');}
}
loadContent();


// Keep the clicked section active, even when the page reaches its scroll limit.
(() => {
 const links=[...document.querySelectorAll('.main-nav a:not(.nav-cta)')];
 const sections=links.map(link=>{
  const url=new URL(link.href,location.href);
  if(url.pathname!==location.pathname||!url.hash)return null;
  const section=document.getElementById(decodeURIComponent(url.hash.slice(1)));
  return section?{link,section}:null;
 }).filter(Boolean).sort((a,b)=>a.section.offsetTop-b.section.offsetTop);
 function activate(link){
  links.forEach(item=>{const active=item===link;item.classList.toggle('active',active);if(active)item.setAttribute('aria-current',sections.length?'location':'page');else item.removeAttribute('aria-current');});
 }
 if(!sections.length){const active=links.find(link=>link.classList.contains('active'));if(active)activate(active);return;}
 let queued=false,selectedTarget=null;
 function sync(){
  queued=false;if(selectedTarget){activate(selectedTarget.link);return;}
  const line=(document.querySelector('.site-header')?.getBoundingClientRect().bottom||0)+64;
  let current=sections[0];
  for(const item of sections)if(!item.section.hidden&&item.section.getBoundingClientRect().top<=line)current=item;
  activate(current.link);
 }
 function fromHash(){
  const item=sections.find(item=>'#'+item.section.id===location.hash);
  if(item){selectedTarget=item;activate(item.link);}else{selectedTarget=null;sync();}
 }
 sections.forEach(item=>item.link.addEventListener('click',()=>{selectedTarget=item;activate(item.link);}));
 const release=()=>{selectedTarget=null;};
 addEventListener('wheel',release,{passive:true});addEventListener('touchmove',release,{passive:true});
 addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)&&!e.target?.matches?.('input,textarea,select,[contenteditable]'))release();});
 addEventListener('pointerdown',e=>{if(e.clientX>=document.documentElement.clientWidth)release();});
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(sync);}},{passive:true});
 addEventListener('resize',sync);addEventListener('load',fromHash);addEventListener('hashchange',fromHash);fromHash();
})();
