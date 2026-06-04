import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
for (const modelName of ['models/gemini-embedding-2', 'models/gemini-embedding-001']) {
  try {
    console.log('Testing embedding model', modelName);
    const embedModel = genAI.getEmbeddingModel({ model: modelName });
    const result = await embedModel.embedContent(['Hello world']);
    console.log('result keys', Object.keys(result));
    console.log('embedding len', result?.data?.[0]?.embedding?.length ?? 'unknown');
    console.log('first 5', result?.data?.[0]?.embedding?.slice(0,5));
  } catch (err) {
    console.error('error', modelName, err.message);
  }
}
