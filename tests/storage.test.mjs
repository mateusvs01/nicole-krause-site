import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../netlify/functions/admin-content.mjs';
import {openStore} from '../netlify/functions/_store.mjs';
import {defaultContent} from '../netlify/functions/_content.mjs';
const auth={clientContext:{user:{sub:'test-admin'}}};
test('loads legacy content, preserves edits, saves and reads it back',async()=>{
 let saved={contact:{phoneDisplay:'Meu contato'},testimonials:[],texts:{heroTitle:'Título editado'}};
 const handler=createHandler(()=>({get:async()=>saved,setJSON:async(key,value)=>{saved=value;}}));
 const loaded=JSON.parse((await handler({httpMethod:'GET'},auth)).body);
 assert.equal(loaded.texts.heroTitle,'Título editado');
 assert.equal(loaded.contact.phoneDisplay,'Meu contato');
 assert.deepEqual(loaded.testimonials,[]);
 assert.ok(loaded.media.cupping);
 loaded.contact.phoneDigits='5551999999999';
 const response=await handler({httpMethod:'PUT',body:JSON.stringify(loaded)},auth);
 assert.equal(response.statusCode,200);
 assert.equal(JSON.parse((await handler({httpMethod:'GET'},auth)).body).contact.phoneDigits,'5551999999999');
});
test('storage failure is explicit and invalid input never writes',async()=>{
 const handler=createHandler(()=>{throw new Error('offline');});
 assert.equal((await handler({httpMethod:'GET'},auth)).statusCode,503);
 assert.equal((await handler({httpMethod:'PUT',body:'{}'},auth)).statusCode,400);
 assert.equal((await handler({httpMethod:'PUT',body:JSON.stringify(defaultContent)},{})).statusCode,401);
});
test('Lambda blob reads use the supplied edge without requiring an uncached URL',async()=>{
 let requested;
 const store=openStore({headers:{'x-nf-site-id':'test-site','x-nf-deploy-id':'test-deploy'},blobs:Buffer.from(JSON.stringify({url:'https://example.test',token:'test-only'})).toString('base64')},'site-content',{
  fetch:async(url)=>{requested=String(url);return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}});}
 });
 assert.deepEqual(await store.get('current',{type:'json'}),{ok:true});
 assert.ok(requested.startsWith('https://example.test/'));
});
