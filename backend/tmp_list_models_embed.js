import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
const res = await fetch(url);
const data = await res.json();
const embedModels = data.models.filter(m => JSON.stringify(m).includes('embedContent'));
console.log('embed models count', embedModels.length);
embedModels.forEach(m => console.log(m.name, JSON.stringify(m.supportedGenerationMethods))); 
console.log('--- available models:');
data.models.forEach(m => {
  if (m.name.includes('embed') || m.displayName.toLowerCase().includes('embed') || (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent'))) {
    console.log(m.name, m.displayName, m.supportedGenerationMethods);
  }
});
