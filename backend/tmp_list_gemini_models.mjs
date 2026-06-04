import dotenv from 'dotenv';
dotenv.config();
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
const data = await res.json();
console.log('status', res.status);
console.log(JSON.stringify(data, null, 2));
