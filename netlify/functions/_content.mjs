import {validateServices,isServiceKey} from './_catalog.mjs';
import { serviceDefaults, serviceMedia } from './_services.mjs';
export const defaultContent = {
  version: 3,
  services: serviceDefaults,
  media: { ...serviceMedia, indication: '/assets/indicacao-toalha.webp', indicationPosition: 60, hero: '/assets/massagem-hero.webp', about: '/assets/sobre-jaleco-roxo.webp', heroPosition: 70, aboutPosition: 50 },
  updatedAt: null,
  texts: {
    heroEyebrow: "Cuidar de você também é essencial",
    heroTitle: "Massagem que equilibra corpo, mente e bem-estar.",
    heroText: "Uso técnicas personalizadas para aliviar tensões, reduzir o estresse e renovar suas energias.",
    servicesTitle: "Técnicas que cuidam de você",
    servicesIntro: "Em cada massagem, ofereço um cuidado único, com foco no seu bem-estar e nas suas necessidades.",
    therapeuticDescription: "Ajuda a aliviar tensões e desconfortos musculares, favorecendo mobilidade e bem-estar.",
    relaxingDescription: "Movimentos suaves e ritmados para desacelerar, reduzir o estresse e promover tranquilidade.",
    cuppingDescription: "Técnica complementar com sucção controlada para promover relaxamento e alívio de tensões.",
    drainageDescription: "Movimentos leves e precisos que auxiliam o fluxo linfático e proporcionam sensação de leveza.",
    aboutTitle: "Nicole Krause Massagista",
    aboutParagraph1: "Sou apaixonada por promover bem-estar através do toque. Acredito que cada corpo tem uma história e merece um cuidado especial.",
    aboutParagraph2: "Meu trabalho é proporcionar equilíbrio, conforto e qualidade de vida com técnicas seguras e personalizadas para cada pessoa.",
    benefitsTitle: "Seu corpo agradece",
    benefitsIntro: "O atendimento adequado pode contribuir para mais conforto, descanso e bem-estar na rotina.",
    ctaTitle: "Cuide de você hoje.",
    ctaText: "Estou aqui para cuidar do seu bem-estar. Fale comigo e agende seu horário."
  },
  contact: {
    phoneDisplay: "(51) 99864-8724",
    phoneDigits: "5551998648724",
    instagramHandle: "@nk_massagens",
    instagramUrl: "https://www.instagram.com/nk_massagens/"
  },
  testimonials: [
    { "id": "mariana", "name": "Mariana S.", "text": "A massagem da Nicole é incrível! Saio sempre renovada e sem dores.", "stars": 5, "visible": true },
    { "id": "lidia", "name": "Lídia B.", "text": "Profissional atenciosa e muito competente. Recomendo de olhos fechados!", "stars": 5, "visible": true },
    { "id": "fernanda", "name": "Fernanda R.", "text": "Ambiente acolhedor, mãos que realmente fazem a diferença.", "stars": 5, "visible": true }
  ]
};

const textLimits = {
  heroEyebrow: 100, heroTitle: 160, heroText: 400,
  servicesTitle: 140, servicesIntro: 400,
  therapeuticDescription: 300, relaxingDescription: 300,
  cuppingDescription: 300, drainageDescription: 300,
  aboutTitle: 120, aboutParagraph1: 500, aboutParagraph2: 500,
  benefitsTitle: 140, benefitsIntro: 400, ctaTitle: 140, ctaText: 400
};

const cleanText = (value, max) => String(value ?? "").trim().slice(0, max);

export function imagePath(value) {
  if (!value) return '';
  const path = String(value);
  if (/^\/assets\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp)$/.test(path) || /^\/\.netlify\/functions\/media\?id=[a-f0-9-]{36}$/.test(path)) return path;
  throw new Error('Imagem inválida. Envie a foto pelo painel.');
}

export function mergeContent(saved) {
 const base=structuredClone(defaultContent);
 if (!saved || typeof saved !== 'object') return base;
 return {...base,...saved,
  media:{...base.media,...saved.media}, texts:{...base.texts,...saved.texts}, contact:{...base.contact,...saved.contact},
  testimonials:Array.isArray(saved.testimonials)?saved.testimonials.map(r=>({...r,visible:r.visible!==false,photo:r.photo||''})):base.testimonials,
  services:Object.fromEntries(Object.entries({...base.services,...saved.services}).filter(([key])=>isServiceKey(key)).map(([key,value])=>[key,{...base.services[key],...value}]))
 };
}

export function validateContent(input) {
  if (!input || typeof input !== "object") throw new Error("Conteúdo inválido.");
  const texts = {};
  for (const [key, max] of Object.entries(textLimits)) {
    texts[key] = cleanText(input.texts?.[key], max);
    if (!texts[key]) throw new Error(`O campo ${key} é obrigatório.`);
  }

  const phoneDigits = String(input.contact?.phoneDigits ?? "").replace(/\D/g, "").slice(0, 15);
  if (phoneDigits.length < 10) throw new Error("Informe o WhatsApp com DDI e DDD.");
  const instagramUrl = cleanText(input.contact?.instagramUrl, 250);
  let parsedInstagram;
  try { parsedInstagram = new URL(instagramUrl); } catch { throw new Error("O link do Instagram é inválido."); }
  if (parsedInstagram.protocol !== "https:") throw new Error("O Instagram precisa usar um link HTTPS.");

  if (!Array.isArray(input.testimonials) || input.testimonials.length > 30) {
    throw new Error("É permitido cadastrar até 30 depoimentos.");
  }
  const testimonials = input.testimonials.map((item, index) => {
    const name = cleanText(item?.name, 80);
    const text = cleanText(item?.text, 500);
    if (!name || !text) throw new Error(`Preencha nome e depoimento no item ${index + 1}.`);
    return {
      id: cleanText(item?.id, 80) || `depoimento-${Date.now()}-${index}`,
      name,
      text,
      photo: imagePath(item?.photo),
      stars: Math.max(1, Math.min(5, Number.parseInt(item?.stars, 10) || 5)),
      visible: item?.visible !== false
    };
  });

  const services=validateServices(input.services);
  const mediaDefaults={...defaultContent.media};
  for(const key of Object.keys(services)){
   mediaDefaults[key]??=defaultContent.media.hero;
   mediaDefaults[key+'Indication']??=defaultContent.media.hero;
   mediaDefaults[key+'Position']??=50;
   mediaDefaults[key+'IndicationPosition']??=50;
  }

  return {
    version: 3,
    media: Object.fromEntries(Object.entries(mediaDefaults).map(([key,value])=>[
      key,key.endsWith('Position') ? Math.max(0,Math.min(100,Number(input.media?.[key] ?? value)||0)) :
      (imagePath(input.media?.[key] ?? value) || (key==='about' ? '' : value))
    ])),
    services,
    updatedAt: new Date().toISOString(),
    texts,
    contact: {
      phoneDisplay: cleanText(input.contact?.phoneDisplay, 40),
      phoneDigits,
      instagramHandle: cleanText(input.contact?.instagramHandle, 80),
      instagramUrl
    },
    testimonials
  };
}
