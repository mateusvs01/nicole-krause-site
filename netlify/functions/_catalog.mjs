import {serviceDefaults} from './_services.mjs';
export const isServiceKey = key => Object.hasOwn(serviceDefaults,key) || /^service-[a-f0-9-]{36}$/.test(key);
const text=(value,max)=>String(value??'').trim().slice(0,max);
export function validateServices(input={}) {
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Serviços inválidos.');
 const entries=Object.entries({...serviceDefaults,...input});
 if(entries.length>20)throw new Error('O limite é de 20 serviços.');
 return Object.fromEntries(entries.map(([key,saved])=>{
  if(!isServiceKey(key)||!saved||typeof saved!=='object')throw new Error('Identificação de serviço inválida.');
  const base=serviceDefaults[key]||{};const s={...base,...saved};const out={};
  for(const field of ['title','subtitle','intro','quote']){
   out[field]=text(s[field],field==='intro'?700:180);
   if(!out[field])throw new Error('Preencha nome, chamada, descrição e frase de todos os serviços.');
  }
  for(const field of ['benefits','indications']){
   if(!Array.isArray(s[field])||!s[field].length||s[field].length>8)throw new Error('Informe de 1 a 8 itens em benefícios e indicações de '+out.title+'.');
   out[field]=s[field].map(v=>text(v,180));
   if(out[field].some(v=>!v))throw new Error('Preencha todos os itens de '+out.title+'.');
  }
  if(!Array.isArray(s.steps)||!s.steps.length||s.steps.length>8)throw new Error('Informe de 1 a 8 etapas de atendimento.');
  out.steps=s.steps.map(pair=>{
   if(!Array.isArray(pair)||pair.length!==2)throw new Error('Use Título | Descrição em cada etapa.');
   const step=[text(pair[0],100),text(pair[1],400)];
   if(step.some(v=>!v))throw new Error('Preencha o título e a descrição de cada etapa.');return step;
  });
  out.icon=['therapeutic','relaxing','cupping','drainage','leaf'].includes(s.icon)?s.icon:(base.slug?key:'leaf');
  out.iconImage=text(s.iconImage,200);
  if(out.iconImage&&!/^\/\.netlify\/functions\/media\?id=[a-f0-9-]{36}$/.test(out.iconImage))throw new Error('Ícone personalizado inválido. Envie a imagem pelo painel.');
  out.slug=base.slug||key;
  return [key,out];
 }));
}
