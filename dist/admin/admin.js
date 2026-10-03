
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]);
const fieldLabels = {heroEyebrow:'Chamada acima do título',heroTitle:'Título principal',heroText:'Texto principal',servicesTitle:'Título dos serviços',servicesIntro:'Introdução dos serviços',therapeuticDescription:'Massagem terapêutica',relaxingDescription:'Massagem relaxante',cuppingDescription:'Ventosaterapia',drainageDescription:'Drenagem linfática',aboutTitle:'Título sobre mim',aboutParagraph1:'Sobre mim — primeiro parágrafo',aboutParagraph2:'Sobre mim — segundo parágrafo',benefitsTitle:'Título dos benefícios',benefitsIntro:'Introdução dos benefícios',ctaTitle:'Título da chamada final',ctaText:'Texto da chamada final'};
let content, selected = 0, dirty = false, busy = false, currentUser, contentReady = false, defaults;
const recoveryFlow = /(?:^#|&)(?:recovery_token|invite_token|confirmation_token)=/.test(location.hash);

function status(message, error = false) {
 const box = $('#status'); box.textContent = message; box.classList.toggle('error',error); box.hidden = false;
 clearTimeout(status.timer); status.timer = setTimeout(() => box.hidden = true, error ? 15000 : 6000);
}
function changed() { if(!contentReady)return; dirty = true; $('#save-hint').textContent = 'Você tem alterações não salvas.'; }
function showPanel(name) {
 setSidebar(false);
 document.querySelectorAll('[data-view]').forEach(p => p.hidden = p.dataset.view !== name);
 document.querySelectorAll('.sidebar [data-panel]').forEach(b => b.classList.toggle('active',b.dataset.panel === name));
 const nav = document.querySelector('.sidebar [data-panel="'+name+'"]');
 $('#panel-title').textContent = nav?.textContent.replace(/^[^\wÀ-ÿ]+/,'').trim() || 'Meu painel';
}
function collect() {
 if (!content) return;
 document.querySelectorAll('[data-text]').forEach(f => content.texts[f.dataset.text] = f.value);
 document.querySelectorAll('[data-contact]').forEach(f => content.contact[f.dataset.contact] = f.value);
 document.querySelectorAll('[data-position]').forEach(f => content.media[f.dataset.position] = Number(f.value));
 document.querySelectorAll('[data-service-key]').forEach(f=>{content.services[f.dataset.serviceKey][f.dataset.serviceField]=['indications','benefits'].includes(f.dataset.serviceField)?f.value.split('\n').map(s=>s.trim()).filter(Boolean):f.dataset.serviceField==='steps'?f.value.split('\n').filter(s=>s.trim()).map(line=>{const [title,...rest]=line.split('|');return [title.trim(),rest.join('|').trim()];}):f.value;});
 const review = content.testimonials[selected];
 if (review) document.querySelectorAll('[data-review]').forEach(f => review[f.dataset.review] = f.type === 'checkbox' ? f.checked : f.dataset.review === 'stars' ? Number(f.value) : f.value);
}
async function api(path, method = 'GET', body) {
 if (!currentUser) throw new Error('Entre novamente no painel.');
 const token = await currentUser.jwt();
 const res = await fetch('/.netlify/functions/'+path,{method,cache:'no-store',headers:{Accept:'application/json',Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const data = await res.json().catch(() => {throw new Error('A resposta do servidor não é válida. Confira se o projeto completo e as funções foram publicados na Netlify.');});
 if (!res.ok) throw new Error(data.error || (res.status===401?'Sua sessão expirou. Entre novamente.':method==='GET'?'Não consegui carregar o conteúdo. Tente novamente.':'Não consegui salvar. Tente novamente.'));
 return data;
}
function avatar(item) { return item.photo ? '<img class="review-avatar" src="'+esc(item.photo)+'" alt="" />' : '<span class="review-avatar">'+esc(item.name?.slice(0,1)||'♡')+'</span>'; }
function row(item,index,selectable=true) {
 return '<button type="button" class="review-row '+(index===selected?'selected':'')+'" '+(selectable?'data-select="'+index+'"':'data-panel="testimonials"')+'>'+avatar(item)+'<span class="review-summary"><strong>'+esc(item.name||'Nova cliente')+'</strong><span>'+esc(item.text||'Escreva o depoimento')+'</span></span><span class="badge">'+(item.visible?'Visível':'Oculto')+'</span></button>';
}
function stats() {
 $('#testimonial-count').textContent = content.testimonials.length;
 $('#visible-count').textContent = content.testimonials.filter(r=>r.visible).length;
 $('#updated-at').textContent = content.updatedAt ? new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(content.updatedAt)) : 'Ainda não';
 $('#recent-reviews').innerHTML = content.testimonials.slice(0,3).map((r,i)=>row(r,i,false)).join('') || '<p class="empty">Nenhum depoimento cadastrado.</p>';
}
function reviews() {
 $('#testimonial-list').innerHTML = '<h2>Minhas clientes</h2><p>Selecione um depoimento para editar.</p>'+ (content.testimonials.map((r,i)=>row(r,i)).join('') || '<p class="empty">Clique em “Novo depoimento” para começar.</p>');
 const r = content.testimonials[selected];
 $('#testimonial-editor').innerHTML = r ? '<h2>Editar depoimento</h2><div class="editor-fields"><label class="field">Nome da cliente<input data-review="name" maxlength="80" value="'+esc(r.name)+'"></label><label class="field">Depoimento<textarea data-review="text" maxlength="500">'+esc(r.text)+'</textarea></label><label class="field">Avaliação<select data-review="stars">'+[5,4,3,2,1].map(n=>'<option '+(r.stars===n?'selected ':'')+'value="'+n+'">'+n+' estrelas</option>').join('')+'</select></label><div class="field"><label for="review-photo">Foto da cliente (opcional)</label>'+(r.photo?'<img class="review-photo-preview" src="'+esc(r.photo)+'" alt="Foto da cliente"><button type="button" data-remove-photo="review">Remover foto</button>':'')+'<input id="review-photo" type="file" accept="image/jpeg,image/png,image/webp" data-upload="review"></div><label class="toggle"><input type="checkbox" data-review="visible" '+(r.visible?'checked':'')+'>Exibir no site</label></div><div class="editor-actions"><span>Salve para publicar.</span><button class="danger" type="button" id="delete-review">Excluir depoimento</button></div>' : '<h2>Seu próximo depoimento</h2><p>Cadastre o relato de uma cliente e escolha se deseja exibi-lo.</p>';
 stats();
}
function render() {
 $('#texts-form').innerHTML = Object.entries(fieldLabels).map(([key,label])=>'<label class="field '+(/Text|Intro|Paragraph|Description/.test(key)?'full':'')+'">'+label+'<textarea data-text="'+key+'" maxlength="'+(/Title|Eyebrow/.test(key)?160:500)+'">'+esc(content.texts[key])+'</textarea></label>').join('');
 const labels = {phoneDisplay:'Telefone exibido',phoneDigits:'WhatsApp com DDI e DDD (ex.: 5551998648724)',instagramHandle:'Nome do Instagram',instagramUrl:'Link completo do Instagram'};
 $('#contact-form').innerHTML = Object.entries(labels).map(([key,label])=>'<label class="field">'+label+'<input data-contact="'+key+'" value="'+esc(content.contact[key])+'" '+(key==='instagramUrl'?'type="url"':'')+'></label>').join('');
 serviceEditors(); photos(); reviews();
}
function serviceEditors() {
 const labels={title:'Nome do serviço',subtitle:'Chamada curta (também aparece nos cartões)',intro:'Descrição da abertura',benefits:'Benefícios — um por linha (até 8)',steps:'Como funciona — uma etapa por linha: Título | Descrição',indications:'Para quem é indicada? — uma indicação por linha (até 8)',quote:'Frase sobre a imagem'};
 const icons={leaf:'Folha',therapeutic:'Mãos',relaxing:'Flor',cupping:'Ondas',drainage:'Gota'};
 $('#services-form').innerHTML=Object.entries(content.services||{}).map(([key,service])=>{
  const url=defaults.services[key]?'/'+defaults.services[key].slug+'.html':'/servico.html?id='+encodeURIComponent(key);
  return '<details class="card service-editor" data-service-editor="'+esc(key)+'"><summary>'+esc(service.title||'Novo serviço')+'</summary><p>Edite os campos abaixo. As fotos ficam em “Fotos do site”. O link funciona depois de salvar.</p><a href="'+url+'" target="_blank" rel="noopener">Abrir página do serviço ↗</a><div class="fields">'+Object.entries(labels).map(([field,label])=>{
   const value=field==='steps'?(service.steps||[]).map(pair=>pair.join(' | ')).join('\n'):['benefits','indications'].includes(field)?(service[field]||[]).join('\n'):service[field];
   return '<label class="field '+(['intro','indications','benefits','steps'].includes(field)?'full':'')+'">'+label+'<textarea data-service-key="'+key+'" data-service-field="'+field+'" maxlength="'+(field==='steps'?4100:['indications','benefits'].includes(field)?1440:field==='intro'?700:180)+'">'+esc(value)+'</textarea></label>';
  }).join('')+'<label class="field">Ícone<select data-service-key="'+key+'" data-service-field="icon">'+Object.entries(icons).map(([value,label])=>'<option value="'+value+'" '+((service.icon||(defaults.services[key]?key:'leaf'))===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label><div class="field">Ícone personalizado (PNG, WebP ou JPG)'+(service.iconImage?'<img class="custom-icon-preview" src="'+esc(service.iconImage)+'" alt="Ícone escolhido"><button type="button" data-remove-icon="'+key+'">Usar ícone padrão</button>':'')+'<input type="file" accept="image/png,image/webp,image/jpeg" data-upload="icon" data-icon-key="'+key+'"><small>Prefira PNG ou WebP com fundo transparente. O arquivo substitui o ícone padrão deste serviço.</small></div></div></details>';
 }).join('');
}
function addService(){
 if(!contentReady||busy)return;
 collect();if(Object.keys(content.services).length>=20)return status('O limite é de 20 serviços.',true);
 const key='service-'+crypto.randomUUID();
 content.services[key]={slug:key,title:'',subtitle:'',intro:'',quote:'',benefits:[],indications:[],steps:[],icon:'leaf'};
 for(const part of [key,key+'Indication']){content.media[part]=defaults.media.hero;content.media[part+'Position']=50;}
 serviceEditors();photos();changed();
 const editor=document.querySelector('[data-service-editor="'+key+'"]');editor.open=true;editor.querySelector('textarea').focus();
 status('Preencha os dados do novo serviço e escolha as fotos em “Fotos do site”. Depois salve.');
}
function photos() {
 const fields=[['hero','Foto da tela inicial','Abertura da página inicial.'],['about','Minha foto — Sobre mim','A imagem padrão é ilustrativa. Você pode trocá-la por uma foto real.']];
 Object.entries(content.services||{}).forEach(([key,service])=>{
  fields.push([key,service.title+' — atendimento','Aparece na abertura e em Como funciona.']);
  fields.push([key+'Indication',service.title+' — indicações','Foto do bloco Para quem é indicada?']);
 });
 $('#photos-form').innerHTML=fields.map(([key,title,help])=>'<article class="card"><h2>'+esc(title)+'</h2><p>'+help+'</p>'+(content.media[key]?'<img class="photo-preview" style="object-position:'+content.media[key+'Position']+'% center" src="'+esc(content.media[key])+'" alt="'+esc(title)+'">':'<div class="photo-empty">Nenhuma foto adicionada</div>')+'<label class="field">Escolher foto<input type="file" accept="image/jpeg,image/png,image/webp" data-upload="'+key+'"></label><label class="field">Enquadramento horizontal<input type="range" min="0" max="100" data-position="'+key+'Position" value="'+(content.media[key+'Position']??50)+'"></label><button type="button" data-remove-photo="'+key+'">'+(key==='about'?'Remover foto':'Restaurar foto padrão')+'</button></article>').join('');
}
async function prepareImage(file, max, transparent=false) {
 if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Escolha JPG, PNG ou WebP.');
 if (file.size > 15000000) throw new Error('Escolha uma foto de até 15 MB.');
 const url = URL.createObjectURL(file);
 try {
  const img = new Image(); img.src = url; await img.decode();
  const scale = Math.min(1, max / Math.max(img.width,img.height));
  const canvas = document.createElement('canvas'); canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
  const ctx=canvas.getContext('2d'); if(!transparent){ctx.fillStyle='#fffaf8'; ctx.fillRect(0,0,canvas.width,canvas.height);} ctx.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/webp',.82);
 } finally { URL.revokeObjectURL(url); }
}
async function upload(input) {
 if (busy || !contentReady || !content || !input.files[0]) return;
 collect(); busy=true; $('#save-button').disabled=true;
 const key=input.dataset.upload, iconKey=input.dataset.iconKey, reviewId=content.testimonials[selected]?.id;
 status('Preparando e enviando a foto…');
 try {
  const image=await prepareImage(input.files[0],key==='icon'?192:key==='review'?360:1440,key==='icon');
  const result=await api('media','POST',{image});
  if(key==='icon'){content.services[iconKey].iconImage=result.url;serviceEditors();document.querySelector('[data-service-editor="'+iconKey+'"]').open=true;}
  else if (key==='review') { const r=content.testimonials.find(r=>r.id===reviewId); if(r)r.photo=result.url; reviews(); }
  else {content.media[key]=result.url; photos();}
  changed();status('Imagem pronta. Clique em “Salvar alterações” para publicar.');
 } catch(error){status(error.message,true);}
 finally {busy=false;$('#save-button').disabled=false;}
}
async function loadDefaults(){
 if(defaults)return defaults;
 const res=await fetch('/content-defaults.json',{cache:'no-store'});
 if(!res.ok)throw new Error('Não foi possível ler os arquivos do site. Confira o deploy.');
 defaults=await res.json();return defaults;
}
function lockEditor(locked){
 document.querySelectorAll('#texts-form input,#texts-form textarea,#services-form textarea,#services-form select,#services-form input,#services-form button,#contact-form input,#photos-form input,#photos-form button,#testimonial-editor input,#testimonial-editor textarea,#testimonial-editor select,#testimonial-editor button').forEach(el=>el.disabled=locked);
 $('#save-button').disabled=locked;$('#add-testimonial').disabled=locked;$('#add-service').disabled=locked;
}
async function enter(user) {
 currentUser=user;contentReady=false;$('#login-screen').hidden=true;$('#admin-app').hidden=false;$('#user-email').textContent=user.email;
 $('#load-error').hidden=true;$('#retry-load').disabled=true;$('#save-hint').textContent='Carregando o conteúdo do site…';lockEditor(true);
 try {
  await loadDefaults();
  const data=await api('admin-content');
  if(!data.texts||!data.contact||!Array.isArray(data.testimonials))throw new Error('O servidor retornou um conteúdo incompleto. Confira se as funções estão atualizadas.');
  content={...data,media:{...defaults.media,...data.media},services:{...defaults.services,...data.services}};
  contentReady=true;dirty=false;render();lockEditor(false);
  $('#save-hint').textContent='Conteúdo carregado. Pronto para editar.';
 }catch(error){
  if(defaults){content=structuredClone(defaults);render();lockEditor(true);}
  $('#save-hint').textContent='Falha ao carregar. A edição está bloqueada para proteger seus dados.';
  $('#load-error-message').textContent=error.message+(defaults?' Abaixo aparece somente o conteúdo padrão de referência; ele não substituiu seus dados salvos.':'');
  $('#load-error').hidden=false;status(error.message,true);
 }finally{$('#retry-load').disabled=false;}
}
async function save() {
 if (!content || !contentReady || busy) return;
 collect();busy=true;$('#save-button').disabled=true;$('#save-button').textContent='Salvando…';
 try {const result=await api('admin-content','PUT',content);content=result.content;dirty=false;render();$('#save-hint').textContent='Todas as alterações foram salvas.';status('Alterações salvas. O site pode levar alguns instantes para exibir a atualização.');}
 catch(error){status(error.message,true);}
 finally {busy=false;$('#save-button').disabled=false;$('#save-button').textContent='Salvar alterações';}
}
document.addEventListener('click', e=>{
 const panel=e.target.closest('[data-panel]');if(panel){collect();showPanel(panel.dataset.panel);if(content)stats();}
 const select=e.target.closest('[data-select]');if(select&&contentReady&&!busy){collect();selected=Number(select.dataset.select);reviews();}
 if(e.target.closest('#add-testimonial')&&content&&contentReady&&!busy){collect();if(content.testimonials.length>=30)return status('O limite é de 30 depoimentos.',true);content.testimonials.unshift({id:crypto.randomUUID(),name:'',text:'',stars:5,visible:true,photo:''});selected=0;reviews();changed();}
 if(e.target.closest('#delete-review')&&content&&contentReady&&!busy&&confirm('Excluir este depoimento? A exclusão só será publicada depois de salvar.')){collect();content.testimonials.splice(selected,1);selected=0;reviews();changed();}
 const removeIcon=e.target.closest('[data-remove-icon]');if(removeIcon&&contentReady&&!busy){collect();const key=removeIcon.dataset.removeIcon;content.services[key].iconImage='';serviceEditors();document.querySelector('[data-service-editor="'+key+'"]').open=true;changed();}
 const remove=e.target.closest('[data-remove-photo]');if(remove&&content&&contentReady&&!busy){collect();const key=remove.dataset.removePhoto;if(key==='review'){content.testimonials[selected].photo='';reviews();}else{content.media[key]=key==='about'?'':(defaults.media[key]||defaults.media.hero);photos();}changed();}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-text],[data-contact],[data-review],[data-position],[data-service-key]')){changed();if(e.target.dataset.position){const img=e.target.closest('article').querySelector('.photo-preview');if(img)img.style.objectPosition=e.target.value+'% center';}}});
document.addEventListener('change',e=>{if(e.target.matches('[data-upload]'))upload(e.target);if(e.target.matches('[data-service-key]'))changed();});
document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();save();}));
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});
$('#save-button').addEventListener('click',save);
$('#login-button').addEventListener('click',()=>{if(window.netlifyIdentity)window.netlifyIdentity.open('login');else status('O serviço de login não carregou. Verifique sua conexão e atualize a página.',true);});
$('#logout-button').addEventListener('click',()=>{if(!dirty||confirm('Sair sem salvar as alterações?')){dirty=false;window.netlifyIdentity.logout();}});
$('#recovery-help').hidden=!recoveryFlow;
if(window.netlifyIdentity){
 window.netlifyIdentity.on('init',user=>{if(user&&!recoveryFlow)enter(user);});
 window.netlifyIdentity.on('login',user=>{window.netlifyIdentity.close();enter(user);});
 window.netlifyIdentity.on('logout',()=>location.replace('/admin/'));
 window.netlifyIdentity.on('error',()=>status('Não foi possível concluir o acesso. Se o link expirou, solicite um novo em “Forgot password?”.',true));
 // The CDN widget initializes on DOMContentLoaded and handles invitation/recovery hashes.
} else status('O serviço de login não carregou. Atualize a página.',true);

function setSidebar(open){
 document.body.classList.toggle('sidebar-open',open);
 $('#sidebar-toggle').setAttribute('aria-expanded',String(open));
 $('#sidebar-toggle').setAttribute('aria-label',open?'Fechar menu lateral':'Abrir menu lateral');
 $('#sidebar-backdrop').hidden=!open;
}
$('#sidebar-toggle').addEventListener('click',()=>setSidebar(!document.body.classList.contains('sidebar-open')));
$('#sidebar-backdrop').addEventListener('click',()=>setSidebar(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setSidebar(false);});
$('#retry-load').addEventListener('click',()=>enter(currentUser));

$('#add-service').addEventListener('click',addService);
