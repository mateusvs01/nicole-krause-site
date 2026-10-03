import test from "node:test";
import assert from "node:assert/strict";
import { defaultContent, validateContent } from "../netlify/functions/_content.mjs";
test("aceita e normaliza o conteúdo padrão",()=>{const result=validateContent(defaultContent);assert.equal(result.contact.phoneDigits,"5551998648724");assert.equal(result.testimonials.length,3);assert.ok(result.updatedAt)});
test("remove caracteres do telefone",()=>{const input=structuredClone(defaultContent);input.contact.phoneDigits="+55 (51) 99864-8724";assert.equal(validateContent(input).contact.phoneDigits,"5551998648724")});
test("rejeita Instagram sem HTTPS",()=>{const input=structuredClone(defaultContent);input.contact.instagramUrl="javascript:alert(1)";assert.throws(()=>validateContent(input),/HTTPS/)});
test("limita a quantidade de depoimentos",()=>{const input=structuredClone(defaultContent);input.testimonials=Array.from({length:31},(_,index)=>({name:`Cliente ${index}`,text:"Ótimo atendimento",stars:5,visible:true}));assert.throws(()=>validateContent(input),/30/)});
