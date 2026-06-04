import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const tests = ['models/gemini-2.5-flash', 'gemini-2.5-flash', 'models/gemini-flash-latest', 'gemini-flash-latest'];
const prompt = 'Provide a short answer: What are the membership plans?';
for (const modelName of tests) {
  try {
    console.log('--- testing', modelName);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent([prompt]);
    console.log('result', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('error for', modelName, err.message);
  }
}
