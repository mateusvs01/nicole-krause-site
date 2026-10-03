import './render-services.mjs';
import { writeFile } from 'node:fs/promises';
import { defaultContent } from '../netlify/functions/_content.mjs';
await writeFile(new URL('../dist/content-defaults.json',import.meta.url),JSON.stringify(defaultContent,null,2)+'\n');
console.log('Conteúdo inicial do site e do admin atualizado.');
