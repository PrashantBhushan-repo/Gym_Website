import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const models = [
  'text-embedding-004',
  'text-embedding-gecko-001',
  'text-embed-gecko-001',
  'embed-text-v1',
  'embed-text-1',
  'gemini-1.5-embed',
  'gemini-1.0-embed',
  'gemini-embedding-1.0',
  'gemini-embedding-1.5',
  'gemini-embed-text-1'
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.embedContent(['Test gym content.']);
    console.log(modelName, '-> OK length', result?.data?.[0]?.embedding?.length ?? result?.embedding?.length ?? 'unknown');
  } catch (err) {
    console.log(modelName, '-> ERROR', err?.message || err);
  }
}

for (const model of models) {
  await testModel(model);
}
