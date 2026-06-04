import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RAGService from '../services/ragService.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDirectory = path.resolve(__dirname, '../knowledge_docs');

const categoryMap = {
  'about_fitzone.md': 'about',
  'membership_plans.md': 'membership',
  'services_and_classes.md': 'services',
  'contact_and_location.md': 'contact',
  'shop_and_products.md': 'shop',
  'programs_and_policies.md': 'programs',
  'faq_and_support.md': 'faq'
};

const tagMap = {
  about_fitzone: ['about', 'story', 'vision', 'values'],
  membership_plans: ['membership', 'pricing', 'plans', 'benefits'],
  services_and_classes: ['services', 'classes', 'training', 'fitness'],
  contact_and_location: ['contact', 'location', 'hours', 'support'],
  shop_and_products: ['shop', 'products', 'checkout', 'ecommerce'],
  programs_and_policies: ['programs', 'policies', 'nutrition', 'training'],
  faq_and_support: ['faq', 'support', 'help', 'membership']
};

function getTitleFromFileName(filename) {
  const name = filename.replace(/\.md$/, '').replace(/_/g, ' ');
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function initializeKnowledgeBase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/gym_website');
    console.log('Connected to MongoDB');

    const ragService = new RAGService();
    await ragService.initialize();
    console.log('RAG service initialized');

    const files = fs.readdirSync(docsDirectory).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} knowledge documents in ${docsDirectory}`);

    for (const file of files) {
      const filePath = path.join(docsDirectory, file);
      const content = fs.readFileSync(filePath, 'utf8').trim();
      const title = getTitleFromFileName(file);
      const category = categoryMap[file] || 'general';
      const tags = tagMap[file.replace(/\.md$/, '')] || ['gym', 'fitness', 'knowledge'];

      try {
        await ragService.addDocument(title, content, category, tags);
        console.log(`✓ Added: ${title}`);
      } catch (error) {
        console.error(`✗ Failed to add: ${title}`);
        console.error(error);
      }
    }

    console.log('\n🎉 Knowledge base initialization complete!');
    console.log(`Added ${files.length} documents to the gym knowledge base.`);
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initializeKnowledgeBase();