import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL_NAME || 'text-bison-001';
const genAI = new GoogleGenerativeAI(apiKey);
console.log('genAI keys', Object.keys(genAI));
const model = genAI.getGenerativeModel({ model: modelName });
console.log('model proto methods', Object.getOwnPropertyNames(Object.getPrototypeOf(model)).sort());

const prompt = 'Q: What are the membership plans?\nA:';
const result = await model.generateContent([prompt]);
console.log('result type', typeof result);
console.dir(result, { depth: 5 });
