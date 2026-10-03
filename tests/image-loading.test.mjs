import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('saved image stays hidden until loaded and legacy responsive sources are cleared',()=>{
 const attrs=new Map([['srcset','old.webp 640w'],['sizes','560px']]);
 const img={dataset:{media:'hero'},style:{},complete:false,naturalWidth:0,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)};
 const source=readFileSync(new URL('../dist/script.js',import.meta.url),'utf8');
 const code=source.slice(source.indexOf('function useOptimizedImage'),source.indexOf('const serviceRoutes'));
 vm.runInNewContext(code+';applyMedia({hero:"/.netlify/functions/media?id=12345678-1234-4234-8234-123456789abc"});',{document:{querySelectorAll:()=>[img]}});
 assert.ok(attrs.has('data-media-loading'));assert.equal(attrs.has('srcset'),false);assert.equal(attrs.has('sizes'),false);
 assert.match(img.src,/functions\/media/);img.onload();assert.equal(attrs.has('data-media-loading'),false);
});
test('all public photo pages hide default media before first paint',()=>{
 for(const name of ['index','massagem-relaxante','massagem-terapeutica','ventosaterapia','drenagem-linfatica','servico']){
 const html=readFileSync(new URL('../dist/'+name+'.html',import.meta.url),'utf8');
 assert.ok(html.indexOf('classList.add("media-pending")')<html.indexOf('</head>'));
 assert.ok(html.includes('.media-pending [data-media]'));
 }
});
