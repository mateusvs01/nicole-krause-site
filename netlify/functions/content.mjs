import { openStore } from './_store.mjs';
import { defaultContent, mergeContent } from "./_content.mjs";

const response = (body, headers = {}) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  try {
    const store = openStore(event, 'site-content');
    const content = await store.get("current", { type: "json" });
    const publicContent = mergeContent(content);
    publicContent.testimonials = publicContent.testimonials.filter(item => item.visible);
    return response(publicContent, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("Falha ao ler conteúdo:", error.name);
    return response(defaultContent, { "Cache-Control": "no-store", "X-Content-Fallback": "default" });
  }
};
