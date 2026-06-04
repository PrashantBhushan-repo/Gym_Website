import dotenv from 'dotenv';
dotenv.config();
import GeminiService from './services/geminiService.js';

async function test() {
  const g = new GeminiService();
  console.log('useFallback', g.useFallback, 'embeddingModel', !!g.embeddingModel);
  try {
    const emb = await g.generateEmbeddings('Test gym content.');
    console.log('embedding length', Array.isArray(emb) ? emb.length : '?', emb?.slice?.(0, 5));
  } catch (e) {
    console.error('error', e);
  }
}

await test();
