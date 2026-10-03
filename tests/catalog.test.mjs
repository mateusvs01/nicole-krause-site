import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent,validateContent,mergeContent} from '../netlify/functions/_content.mjs';
import {createHandler} from '../netlify/functions/admin-content.mjs';
import {readFileSync} from 'node:fs';
const key='service-12345678-1234-4234-8234-123456789abc';
function custom(){
 const input=structuredClone(defaultContent);
 input.services[key]={title:'Meu atendimento',subtitle:'Uma pausa para você',intro:'Preparo uma sessão personalizada.',quote:'Um momento seu.',benefits:['Relaxamento'],indications:['Quem busca autocuidado'],steps:[['Conversa','Escuto suas preferências.']],icon:'leaf'};
 input.media[key]='/.netlify/functions/media?id=12345678-1234-4234-8234-123456789abc';
 input.media[key+'Indication']=input.media[key];return input;
}
test('new service and its photos survive authenticated save and reload',async()=>{
 let stored;const handler=createHandler(()=>({get:async()=>stored,setJSON:async(_,value)=>{stored=structuredClone(value);}}));
 const auth={clientContext:{user:{sub:'test-admin'}}};
 assert.equal((await handler({httpMethod:'PUT',body:JSON.stringify(custom())},auth)).statusCode,200);
 const read=JSON.parse((await handler({httpMethod:'GET'},auth)).body);
 assert.equal(Object.keys(read.services).length,5);assert.equal(read.services[key].title,'Meu atendimento');
 assert.equal(read.media[key],custom().media[key]);assert.equal(read.media[key+'Indication'],custom().media[key]);
 assert.deepEqual(read.services[key].steps,[['Conversa','Escuto suas preferências.']]);
});
test('rejects malformed new service, unsafe IDs and photos',()=>{
 let input=custom();input.services[key].steps=[['Sem descrição']];assert.throws(()=>validateContent(input),/Título/);
 input=custom();input.services['../../admin']=input.services[key];assert.throws(()=>validateContent(input),/Identificação/);
 input=custom();input.media[key]='javascript:alert(1)';assert.throws(()=>validateContent(input),/Imagem inválida/);
});
test('legacy service edits receive missing fields without losing edits',()=>{
 const result=mergeContent({services:{relaxing:{title:'Meu título'}},texts:{heroTitle:'Título inicial'}});
 assert.equal(result.services.relaxing.title,'Meu título');assert.ok(result.services.relaxing.steps.length);assert.equal(result.texts.heroTitle,'Título inicial');
 assert.doesNotThrow(()=>validateContent(result));
});
test('limits the catalog and preserves the built-in service addresses',()=>{
 const input=custom();input.services.relaxing.slug='../../admin';assert.equal(validateContent(input).services.relaxing.slug,'massagem-relaxante');
 for(let i=0;i<17;i++)input.services['service-'+String(i).padStart(36,'0')]=input.services[key];
 assert.throws(()=>validateContent(input),/20 serviços/);
});
test('every service page has the requested section order and breadcrumb below opening',()=>{
 for(const file of ['massagem-relaxante.html','massagem-terapeutica.html','ventosaterapia.html','drenagem-linfatica.html','servico.html']){
  const html=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  assert.ok(html.indexOf('class="related-services')<html.indexOf('id="depoimentos"'));
  assert.ok(html.indexOf('id="depoimentos"')<html.indexOf('class="cta-section"'));
  assert.ok(html.indexOf('class="service-visual"')<html.indexOf('class="container breadcrumbs"'));
 }
});
test('custom service icons survive save and reload and reject arbitrary sources',async()=>{
 const input=custom();input.services[key].iconImage=input.media[key];
 let stored;const handler=createHandler(()=>({get:async()=>stored,setJSON:async(_,value)=>{stored=structuredClone(value);}}));
 const auth={clientContext:{user:{sub:'admin'}}};
 assert.equal((await handler({httpMethod:'PUT',body:JSON.stringify(input)},auth)).statusCode,200);
 const read=JSON.parse((await handler({httpMethod:'GET'},auth)).body);
 assert.equal(read.services[key].iconImage,input.media[key]);
 for(const source of ['javascript:alert(1)','https://example.com/icon.svg','data:image/svg+xml,<svg>']){input.services[key].iconImage=source;assert.throws(()=>validateContent(input),/Ícone personalizado/);}
 input.services[key].iconImage='';assert.equal(validateContent(input).services[key].iconImage,'');
});
