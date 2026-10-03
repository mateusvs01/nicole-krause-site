import { openStore } from './_store.mjs';
import { mergeContent, validateContent } from './_content.mjs';
const json = (body, statusCode = 200) => ({
 statusCode, headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},
 body:JSON.stringify(body)
});
export function createHandler(storeFactory = openStore) {
 return async (event, context) => {
  if (!context?.clientContext?.user) return json({error:'Acesso não autorizado. Entre novamente no painel.'},401);
  if (!['GET','PUT'].includes(event.httpMethod)) return json({error:'Método não permitido.'},405);
  let updated;
  if (event.httpMethod === 'PUT') {
   try {
    const body = event.isBase64Encoded ? Buffer.from(event.body,'base64').toString('utf8') : event.body;
    updated = validateContent(JSON.parse(body || '{}'));
   } catch (error) { return json({error:error instanceof SyntaxError?'Dados inválidos. Atualize a página e tente novamente.':error.message},400); }
  }
  try {
   const store = storeFactory(event,'site-content');
   if(event.httpMethod === 'GET') return json(mergeContent(await store.get('current',{type:'json'})));
   await store.setJSON('current',updated);
   return json({ok:true,content:updated});
  } catch(error) {
   console.error('Site content operation failed:',event.httpMethod,error.name);
   return json({error:event.httpMethod==='GET'?'Não foi possível carregar o conteúdo salvo. Tente novamente. Se persistir, confira o deploy das funções na Netlify.':'Não foi possível gravar as alterações. Elas continuam no painel para você tentar novamente.',code:'CONTENT_STORAGE_UNAVAILABLE'},503);
  }
 };
}
export const handler = createHandler();
