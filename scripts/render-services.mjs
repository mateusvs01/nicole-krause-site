import {readFile,writeFile} from 'node:fs/promises';
import {defaultContent} from '../netlify/functions/_content.mjs';
import {serviceDefaults} from '../netlify/functions/_services.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const calendar='<svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m4 0h3m-10 3h3"/></svg>';
const serviceIcons={};
for(const [key,service] of Object.entries(serviceDefaults)){
 const source=await readFile(new URL('../dist/'+service.slug+'.html',import.meta.url),'utf8');
 serviceIcons[key]=source.match(/<div class="service-hero-icon">([\s\S]*?)<\/div>/)[1];
}
for(const [key,s] of Object.entries(serviceDefaults)){
 const path=new URL('../dist/'+s.slug+'.html',import.meta.url);
 let html=await readFile(path,'utf8');
 const icon=html.match(/<div class="service-hero-icon">([\s\S]*?)<\/div>/)[1];
 const benefitIcons=[...html.matchAll(/<div class="feature-icon">([\s\S]*?)<\/div>/g)].map(m=>m[1]);
 const link='https://wa.me/5551998648724?text='+encodeURIComponent('Olá! Gostaria de agendar '+s.title.toLowerCase()+'.');
 const image=`assets/servico-${key}.webp`;
 const picture=(indication=false,lazy=false)=>`<img src="${image}" data-media="${key}${indication?'Indication':''}" alt="${esc(s.title)} — imagem ilustrativa do atendimento" width="1440" height="960" srcset="${image.replace('.webp','-640.webp')} 640w, ${image} 1440w" sizes="(max-width:700px) calc(100vw - 40px), 560px" decoding="async" ${indication||lazy?'loading="lazy"':'fetchpriority="high"'}/>`;
 const main=`<main class="service-page" data-service-page="${key}">
 <section class="service-hero">
  <div class="container service-hero-grid">
   <div class="service-hero-copy">
    <div class="service-heading"><div class="service-hero-icon">${icon}</div><div><p class="eyebrow">Meus serviços</p><h1 data-service-field="title">${esc(s.title)}</h1></div></div>
    <p class="service-subtitle" data-service-field="subtitle">${esc(s.subtitle)}</p>
    <p class="service-intro" data-service-field="intro">${esc(s.intro)}</p>
    <a class="button" href="${link}" target="_blank" rel="noopener">${calendar}<span>Agende seu horário</span><span aria-hidden="true">→</span></a>
   </div>
   <div class="service-visual">${picture()}<div class="service-photo-caption">Seu bem-estar<br>em minhas mãos.</div></div>
  </div>
 </section>
  <div class="container breadcrumbs"><a href="index.html">Início</a> › <a href="index.html#servicos">Serviços</a> › <span data-service-field="title">${esc(s.title)}</span></div>
 <section class="service-benefits" aria-labelledby="service-benefits-title"><div class="container"><header class="section-heading"><p class="eyebrow">Benefícios</p><h2 id="service-benefits-title">Um cuidado pensado para você</h2></header></div><div class="container benefit-grid">${s.benefits.map((b,i)=>`<div class="benefit-item"><div class="feature-icon">${benefitIcons[i]}</div><h3>${esc(b)}</h3></div>`).join('')}</div></section>
 <section class="service-body"><div class="container">
  <section class="how-section" aria-labelledby="how-title">${picture(false,true)}<div><h2 id="how-title">Como funciona</h2><ol class="steps">${s.steps.map(([title,text])=>`<li><div><strong>${esc(title)}</strong><p>${esc(text)}</p></div></li>`).join('')}</ol></div></section>
  <section class="indication-card" aria-labelledby="indication-title"><div><h2 id="indication-title">Para quem é indicada?</h2><ul class="check-list" data-service-indications>${s.indications.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></div><div class="indication-photo">${picture(true)}<blockquote data-service-field="quote">${esc(s.quote)}</blockquote></div></section>
 </div></section>
 <section class="related-services section" aria-labelledby="related-title"><div class="container"><header class="section-heading"><p class="eyebrow">Continue seu cuidado</p><h2 id="related-title">Conheça os outros serviços</h2><p>Explore outras formas de cuidar do seu bem-estar.</p></header><div class="related-service-grid">${Object.entries(serviceDefaults).filter(([other])=>other!==key).map(([other,service])=>`<a class="related-service-card" href="${service.slug}.html" data-related-service="${other}"><span class="service-icon">${serviceIcons[other]}</span><h3 data-related-field="title">${esc(service.title)}</h3><p data-related-field="subtitle">${esc(service.subtitle)}</p><span class="related-link">Conhecer serviço <span aria-hidden="true">→</span></span></a>`).join('')}</div></div></section>
 <section class="section testimonials" id="depoimentos"><div class="container"><header class="section-heading"><p class="eyebrow">Depoimentos</p><h2>O que dizem minhas clientes</h2></header><div class="testimonial-track" aria-label="Depoimentos de clientes">${defaultContent.testimonials.filter(r=>r.visible!==false).map(r=>`<article class="testimonial-card"><blockquote>“${esc(r.text)}”</blockquote><div class="stars" aria-label="${r.stars} estrelas">${'★'.repeat(r.stars)}</div><div class="testimonial-author">${r.photo?`<img src="${esc(r.photo)}" alt="${esc(r.name)}" loading="lazy">`:''}<cite>— ${esc(r.name)}</cite></div></article>`).join('')}</div></div></section>
 <section class="cta-section"><div class="container cta-card botanical"><div><h2>Pronta para se sentir melhor?</h2><p>Agende seu horário e deixe-me cuidar de você hoje.</p></div><a class="button" href="${link}" target="_blank" rel="noopener">${calendar}<span>Agende seu horário</span><span aria-hidden="true">→</span></a></div></section>

</main>`;
 html=html.replace(/<main[\s\S]*?<\/main>/,main);
 html=html.replace(/<link rel="stylesheet" href="(?:redesign|indication|refinements)\.css[^\"]*"\s*\/>/g,'');
 html=html.replace('</head>','<link rel="stylesheet" href="redesign.css?v=5"/><link rel="stylesheet" href="indication.css?v=2"/><link rel="stylesheet" href="refinements.css?v=15"/></head>');
 html=html.replace(/<script src="script.js[^\"]*"><\/script>/,'<script src="script.js?v=14"></script>');
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const footer=home.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0].replace(/href="#/g,'href="index.html#');
 html=html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,footer);
 await writeFile(path,html);
}
console.log('Quatro serviços com a mesma estrutura e conteúdos próprios.');

const source=await readFile(new URL('../dist/massagem-relaxante.html',import.meta.url),'utf8');
const generic=source.replace('data-service-page="relaxing"','data-service-page="" data-dynamic-service hidden').replace(/<title>[^<]*<\/title>/,'<title>Serviço | Nicole Krause</title>').replace('<main ', '<p id="service-loading" class="container service-loading" role="status">Carregando serviço…</p><main ').replace('</main>','</main><noscript><p class="container">Ative o JavaScript para consultar este serviço.</p></noscript>');
await writeFile(new URL('../dist/servico.html',import.meta.url),generic);
