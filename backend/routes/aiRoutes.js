import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RAGService from '../services/ragService.js';
import ChatHistory from '../models/ChatHistory.js';
import UserGoals from '../models/UserGoals.js';
import PageInfo from '../models/PageInfo.js';
import { v4 as uuidv4 } from 'uuid';

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

const router = express.Router();
const ragService = new RAGService();

// Initialize RAG service
ragService.initialize().catch(console.error);

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = uuidv4();
    }

    // Get user context
    let userContext = {};
    if (userId && userId !== 'anonymous') {
      try {
        const userGoals = await UserGoals.findOne({ userId });
        if (userGoals) {
          userContext = {
            goals: userGoals.fitnessGoals,
            preferences: userGoals.dietaryPreferences
          };
        }
      } catch (error) {
        console.error('Error fetching user goals:', error);
      }
    }

    // Generate AI response
    const response = await ragService.generateResponse(message, userContext);

    // Save conversation to history
    if (userId && userId !== 'anonymous') {
      await ChatHistory.findOneAndUpdate(
        { userId, sessionId: currentSessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: message, timestamp: new Date() },
                { role: 'assistant', content: response, timestamp: new Date() }
              ]
            }
          },
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      response,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const { userId, sessionId } = req.query;

    if (!userId || userId === 'anonymous') {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    let query = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const history = await ChatHistory.find(query).sort({ updatedAt: -1 }).limit(10);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user goals
router.post('/user-goals', async (req, res) => {
  try {
    const { userId, goals } = req.body;

    if (!userId || userId === 'anonymous') {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const userGoals = await UserGoals.findOneAndUpdate(
      { userId },
      { ...goals, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, userGoals });
  } catch (error) {
    console.error('Error updating user goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload documents for knowledge base
router.post('/upload-docs', async (req, res) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    const uploadedDocs = [];
    for (const doc of documents) {
      const savedChunks = await ragService.addDocument(
        doc.title,
        doc.content,
        doc.category,
        doc.tags
      );
      uploadedDocs.push(...savedChunks);
    }

    res.json({ success: true, uploadedDocs });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rebuild the knowledge base from markdown page content and gym center metadata
router.post('/knowledge/reindex', async (req, res) => {
  try {
    console.log('Reindex endpoint called');
    const files = fs.readdirSync(docsDirectory).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} markdown file(s) in knowledge_docs`);
    const uploadedDocs = [];

    for (const file of files) {
      console.log('Reindexing file:', file);
      const filePath = path.join(docsDirectory, file);
      const content = fs.readFileSync(filePath, 'utf8').trim();
      const title = file.replace(/\.md$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const category = categoryMap[file] || 'general';
      const tags = tagMap[file.replace(/\.md$/, '')] || ['gym', 'fitness', 'knowledge'];

      const savedChunks = await ragService.addDocument(title, content, category, tags);
      console.log(`Saved ${savedChunks.length} chunk(s) for ${file}`);
      uploadedDocs.push(...savedChunks);
    }

    res.json({ success: true, message: 'Reindexed gym knowledge pages.', uploadedDocsCount: uploadedDocs.length });
  } catch (error) {
    console.error('Error reindexing knowledge base:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a single page-level knowledge document
router.post('/knowledge/add-page', async (req, res) => {
  try {
    const { slug, title, content, category, tags = [] } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({ error: 'slug, title, and content are required' });
    }

    const existingPage = await PageInfo.findOneAndUpdate(
      { slug },
      { title, content, category: category || 'page', tags, source: slug, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    await ragService.addDocument(title, content, category || 'page', tags);

    res.json({ success: true, page: existingPage });
  } catch (error) {
    console.error('Error adding page-level knowledge document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate workout plan
router.post('/workout-plan', async (req, res) => {
  try {
    const { userId, goals } = req.body;

    if (!goals) {
      return res.status(400).json({ error: 'Fitness goals are required' });
    }

    const workoutPlan = await ragService.generateWorkoutPlan(goals);

    // Save workout plan if user is logged in
    if (userId && userId !== 'anonymous') {
      const WorkoutPlan = (await import('../models/WorkoutPlan.js')).default;
      await WorkoutPlan.findOneAndUpdate(
        { userId },
        {
          goals,
          plan: workoutPlan,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    res.json({ workoutPlan });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate diet plan
router.post('/diet-plan', async (req, res) => {
  try {
    const { userId, preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'Diet preferences are required' });
    }

    const dietPlan = await ragService.generateDietPlan(preferences);

    // Save diet plan if user is logged in
    if (userId && userId !== 'anonymous') {
      const DietPlan = (await import('../models/DietPlan.js')).default;
      await DietPlan.findOneAndUpdate(
        { userId },
        {
          preferences,
          plan: dietPlan,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    res.json({ dietPlan });
  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's saved plans
router.get('/user-plans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'anonymous') {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const WorkoutPlan = (await import('../models/WorkoutPlan.js')).default;
    const DietPlan = (await import('../models/DietPlan.js')).default;

    const [workoutPlan, dietPlan] = await Promise.all([
      WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 }),
      DietPlan.findOne({ userId }).sort({ createdAt: -1 })
    ]);

    res.json({
      workoutPlan: workoutPlan ? workoutPlan.plan : null,
      dietPlan: dietPlan ? dietPlan.plan : null
    });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;