import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
const res = await fetch(url);
console.log('status', res.status);
const body = await res.text();
console.log(body);
