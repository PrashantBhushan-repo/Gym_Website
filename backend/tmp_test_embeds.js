import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
console.log('proto methods', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)).sort());
console.log('keys', Object.keys(genAI));
if (typeof genAI.embedContent === 'function') {
  const res = await genAI.embedContent(['Hello world']);
  console.log('embed result', JSON.stringify(res, null, 2));
} else {
  console.log('embedContent not direct method');
}
