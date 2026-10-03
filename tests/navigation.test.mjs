import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
test('clicking Testimonials keeps it selected at the bottom; manual scrolling resumes tracking',()=>{
 const source=readFileSync(new URL('../dist/script.js',import.meta.url),'utf8').split('// Keep the clicked section active')[1];
 const listeners={};
 const sections=['inicio','depoimentos','contato'].map((id,i)=>({id,offsetTop:i*400,top:i*400,hidden:false,getBoundingClientRect(){return {top:this.top};}}));
 const links=sections.map(section=>({href:'https://example.test/#'+section.id,handlers:{},attributes:{},active:false,classList:{toggle(_,active){links.find(l=>l.classList===this).active=active;}},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},addEventListener(k,f){this.handlers[k]=f;}}));
 const location={href:'https://example.test/',pathname:'/',hash:''};
 runInNewContext('// Keep the clicked section active'+source,{URL,decodeURIComponent,location,document:{querySelectorAll:()=>links,getElementById:id=>sections.find(s=>s.id===id),querySelector:()=>({getBoundingClientRect:()=>({bottom:94})}),documentElement:{clientWidth:1200,scrollHeight:1000}},addEventListener:(k,f)=>{listeners[k]=f;},requestAnimationFrame:f=>f(),scrollY:400,innerHeight:600});
 links[1].handlers.click();sections[1].top=120;sections[2].top=350;listeners.scroll();
 assert.equal(links[1].active,true);assert.equal(links[2].active,false);assert.equal(links[1].attributes['aria-current'],'location');
 listeners.wheel();sections[2].top=100;listeners.scroll();assert.equal(links[2].active,true);assert.equal(links[1].active,false);
});
