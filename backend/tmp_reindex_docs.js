import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import RAGService from "./services/ragService.js";

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
await mongoose.connect(mongoURI, { dbName: "gym_website" });
console.log("Connected to MongoDB");
const ragService = new RAGService();
await ragService.initialize();

const docsDirectory = path.resolve('./knowledge_docs');
const files = fs.readdirSync(docsDirectory).filter(file => file.endsWith('.md'));
let total = 0;
for (const file of files) {
  console.log('Reindexing file:', file);
  const filePath = path.join(docsDirectory, file);
  const content = fs.readFileSync(filePath, 'utf8').trim();
  const title = file.replace(/\.md$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const category = {
    'about_fitzone.md': 'about',
    'membership_plans.md': 'membership',
    'services_and_classes.md': 'services',
    'contact_and_location.md': 'contact',
    'shop_and_products.md': 'shop',
    'programs_and_policies.md': 'programs',
    'faq_and_support.md': 'faq'
  }[file] || 'general';
  const tags = {
    about_fitzone: ['about', 'story', 'vision', 'values'],
    membership_plans: ['membership', 'pricing', 'plans', 'benefits'],
    services_and_classes: ['services', 'classes', 'training', 'fitness'],
    contact_and_location: ['contact', 'location', 'hours', 'support'],
    shop_and_products: ['shop', 'products', 'checkout', 'ecommerce'],
    programs_and_policies: ['programs', 'policies', 'nutrition', 'training'],
    faq_and_support: ['faq', 'support', 'help', 'membership']
  }[file.replace(/\.md$/, '')] || ['gym', 'fitness', 'knowledge'];
  const chunks = await ragService.addDocument(title, content, category, tags);
  console.log(`Saved ${chunks.length} chunks for ${title}`);
  total += chunks.length;
}
console.log('Total chunks indexed:', total);
await mongoose.disconnect();
