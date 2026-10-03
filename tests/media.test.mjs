import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeImage, handler } from '../netlify/functions/media.mjs';
import { handler as admin } from '../netlify/functions/admin-content.mjs';
import { defaultContent, validateContent, mergeContent } from '../netlify/functions/_content.mjs';
test('image uploads and content updates require authentication', async()=>{
 assert.equal((await handler({httpMethod:'POST'},{})).statusCode,401);
 assert.equal((await admin({httpMethod:'PUT'},{})).statusCode,401);
});
test('rejects disguised HTML and oversized images',()=>{
 assert.throws(()=>decodeImage('data:image/png;base64,'+Buffer.from('<html>not an image</html>').toString('base64')));
 assert.throws(()=>decodeImage('data:image/jpeg;base64,'+Buffer.alloc(1500001).toString('base64')));
});
test('accepts optimized WebP signature',()=>{
 const bytes=readFileSync(new URL('../dist/assets/logo-transparente.webp',import.meta.url));
 assert.equal(decodeImage('data:image/webp;base64,'+bytes.toString('base64')).type,'image/webp');
});
test('retains optional client photo and uploaded page images',()=>{
 const content=structuredClone(defaultContent);
 const path='/.netlify/functions/media?id=12345678-1234-1234-1234-123456789abc';
 content.media.hero=path;content.testimonials[0].photo=path;
 const result=validateContent(content);assert.equal(result.media.hero,path);assert.equal(result.testimonials[0].photo,path);
 content.media.hero='https://unknown.example/file.svg';assert.throws(()=>validateContent(content));
});
test('legacy content retains text and receives media defaults',()=>{
 const result=mergeContent({texts:{heroTitle:'Meu título'}});
 assert.equal(result.texts.heroTitle,'Meu título');assert.ok(result.media.about);
});
