import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
for (const modelName of ['models/gemini-embedding-2', 'models/gemini-embedding-001', 'models/gemini-2.5-flash']) {
  try {
    console.log('Testing model', modelName);
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log('proto methods', Object.getOwnPropertyNames(Object.getPrototypeOf(model)).sort());
    if (typeof model.embedContent === 'function') {
      const result = await model.embedContent(['Hello world']);
      console.log('embed success len', result?.data?.[0]?.embedding?.length);
    } else if (typeof model.generateContent === 'function') {
      const result = await model.generateContent(['Hello world']);
      console.log('generate success', JSON.stringify(result, null, 2));
    } else {
      console.log('no useful method');
    }
  } catch (err) {
    console.error('error for', modelName, err.message);
  }
}
