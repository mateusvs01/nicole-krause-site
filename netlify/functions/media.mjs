import { openStore } from './_store.mjs';
import { randomUUID } from 'node:crypto';

const reply = (statusCode, data) => ({ statusCode, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body:JSON.stringify(data) });
export function decodeImage(value) {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(value || '');
  if (!match) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 1500000 || bytes.length < 12) throw new Error('A imagem deve ter até 1,5 MB após a otimização.');
  const type = match[1];
  const valid = type === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : type === 'png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
  if (!valid) throw new Error('O arquivo não corresponde a uma imagem válida.');
  return { bytes, type: `image/${type}` };
}
export const handler = async (event, context) => {
  if (!['GET','POST'].includes(event.httpMethod)) return reply(405,{error:'Método não permitido.'});
  if (event.httpMethod === 'POST' && !context?.clientContext?.user) return reply(401,{error:'Entre no painel para enviar imagens.'});
  try {
    const store = openStore(event, 'site-media');
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters?.id;
      if (!/^[a-f0-9-]{36}$/.test(id || '')) return reply(404,{error:'Imagem não encontrada.'});
      const result = await store.getWithMetadata(id,{type:'arrayBuffer'});
      if (!result) return reply(404,{error:'Imagem não encontrada.'});
      return {statusCode:200,isBase64Encoded:true,headers:{'Content-Type':result.metadata.type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'},body:Buffer.from(result.data).toString('base64')};
    }
    const body = event.isBase64Encoded ? Buffer.from(event.body,'base64').toString('utf8') : event.body;
    if ((body || '').length > 2100000) return reply(413,{error:'Imagem muito grande.'});
    const {bytes,type} = decodeImage(JSON.parse(body || '{}').image);
    const id = randomUUID();
    await store.set(id,bytes,{metadata:{type}});
    return reply(201,{url:`/.netlify/functions/media?id=${id}`});
  } catch (error) {
    console.error('Media operation failed:', error.name);
    return reply(400,{error:'Não foi possível processar a foto. Use JPG, PNG ou WebP e tente novamente.'});
  }
};
