import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'models/gemini-embedding-2' });
const result = await model.embedContent(['Hello world']);
console.log(result.embedding.values.length);
