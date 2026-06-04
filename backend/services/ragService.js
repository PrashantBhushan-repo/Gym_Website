import GeminiService from './geminiService.js';
import VectorService from './vectorService.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import GymCenter from '../models/GymCenter.js';

class RAGService {
  constructor() {
    this.geminiService = new GeminiService();
    this.vectorService = new VectorService();
  }

  async initialize() {
    await this.vectorService.initIndex();
  }

  chunkText(text, maxChunkSize = 1000, overlap = 200) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const chunks = [];
    let start = 0;
    let index = 0;

    while (start < normalized.length) {
      let end = Math.min(start + maxChunkSize, normalized.length);
      if (end < normalized.length) {
        const lastSpace = normalized.lastIndexOf(' ', end);
        if (lastSpace > start) {
          end = lastSpace;
        }
      }

      const chunkText = normalized.slice(start, end).trim();
      if (!chunkText) break;

      chunks.push({
        index,
        text: chunkText
      });

      if (end >= normalized.length) {
        break;
      }

      start = Math.max(0, end - overlap);
      index += 1;
    }

    return chunks;
  }

  /**
   * Add a document to the knowledge base
   * @param {string} title - Document title
   * @param {string} content - Document content
   * @param {string} category - Document category
   * @param {Array} tags - Document tags
   * @returns {Promise<Array>} - Saved document chunks
   */
  async addDocument(title, content, category, tags = []) {
    try {
      const chunks = this.chunkText(content, 1000, 200);
      const savedDocs = [];

      for (const chunk of chunks) {
        const chunkTitle = chunks.length === 1
          ? title
          : `${title} — chunk ${chunk.index + 1}`;

        const embedding = await this.geminiService.generateEmbeddings(chunk.text);
        const doc = new KnowledgeBase({
          title: chunkTitle,
          content: chunk.text,
          category,
          tags,
          embeddings: embedding,
          source: title,
          chunkIndex: chunk.index
        });
        await doc.save();
        savedDocs.push(doc);

        const vector = {
          id: doc._id.toString(),
          values: embedding,
          metadata: {
            title: chunkTitle,
            category,
            tags: tags.join(','),
            source: title,
            content: chunk.text.substring(0, 500)
          }
        };
        await this.vectorService.storeVectors([vector]);
      }

      return savedDocs;
    } catch (error) {
      console.error('Error adding document to RAG:', error);
      throw error;
    }
  }

  /**
   * Search for relevant documents
   * @param {string} query - Search query
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} - Relevant documents
   */
  async searchRelevantDocuments(query, topK = 5) {
    try {
      const keywords = query.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);

      if (keywords.length === 0) {
        return await KnowledgeBase.find().limit(topK).sort({ category: 1 }).lean();
      }

      try {
        const queryEmbedding = await this.geminiService.generateEmbeddings(query);
        const matches = await this.vectorService.searchVectors(queryEmbedding, topK);
        const docIds = matches.map(match => match.id);
        const documents = await KnowledgeBase.find({ _id: { $in: docIds } }).lean();
        const documentsById = documents.reduce((map, doc) => {
          map[doc._id.toString()] = doc;
          return map;
        }, {});
        const orderedDocs = matches.map(match => documentsById[match.id]).filter(Boolean);
        if (orderedDocs.length > 0) {
          return orderedDocs;
        }
        console.warn('Vector search returned no documents, falling back to keyword search.');
      } catch (vectorError) {
        console.warn('Vector search failed, falling back to keyword search:', vectorError.message);
      }

      const allDocs = await KnowledgeBase.find().lean();
      const scoredDocs = allDocs.map(doc => {
        let score = 0;
        const titleLower = (doc.title || '').toLowerCase();
        const contentLower = (doc.content || '').toLowerCase();
        const categoryLower = (doc.category || '').toLowerCase();
        const tagsLower = (doc.tags || []).map(t => t.toLowerCase()).join(' ');

        keywords.forEach(keyword => {
          if (categoryLower.includes(keyword)) score += 10;
          if (titleLower.includes(keyword)) score += 8;
          if (tagsLower.includes(keyword)) score += 6;
          if (contentLower.includes(keyword)) score += 2;
        });

        return { ...doc, score };
      })
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return scoredDocs;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  async searchGymCenters(query, maxResults = 3) {
    try {
      if (!query || !query.trim()) {
        return [];
      }

      const safeQuery = query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const regex = new RegExp(safeQuery, 'i');

      return await GymCenter.find({
        $or: [
          { name: regex },
          { address: regex },
          { city: regex },
          { state: regex },
          { facilityDescription: regex },
          { collaborationTerms: regex }
        ]
      })
        .limit(maxResults)
        .lean();
    } catch (error) {
      console.error('Error searching gym centers:', error);
      return [];
    }
  }

  /**
   * Generate AI response using RAG
   * @param {string} query - User's question
   * @param {Object} userContext - User's goals and preferences
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(query, userContext = {}) {
    try {
      // Search for relevant documents and gym centers
      const relevantDocs = await this.searchRelevantDocuments(query, 5);
      const relevantGyms = await this.searchGymCenters(query, 3);

      console.log(`[RAG] Query: "${query}"`);
      console.log(`[RAG] Found ${relevantDocs.length} documents, ${relevantGyms.length} gyms`);

      // Build context from relevant documents
      const documentContext = relevantDocs.length > 0
        ? relevantDocs.map(doc =>
            `Title: ${doc.title}\nCategory: ${doc.category}\nContent: ${doc.content}`
          ).join('\n\n')
        : '';

      const gymContext = relevantGyms.length > 0
        ? relevantGyms.map(gym =>
            `Gym Center: ${gym.name}\nAddress: ${gym.address}, ${gym.city}, ${gym.state} ${gym.postalCode}\nPhone: ${gym.phone}\nEmail: ${gym.email}\nContact: ${gym.contactPerson}\nFacilities: ${gym.facilityDescription || 'N/A'}\nDetails: ${gym.collaborationTerms || 'N/A'}`
          ).join('\n\n')
        : '';

      const combinedContext = [documentContext, gymContext].filter(Boolean).join('\n\n');

      console.log(`[RAG] Context length: ${combinedContext.length} chars`);

      // Use Gemini service to generate response
      const response = await this.geminiService.answerQuestion(query, combinedContext, userContext);

      console.log(`[RAG] Response length: ${response.length} chars`);
      return response;
    } catch (error) {
      console.error('Error generating RAG response:', error);
      // Fallback response if RAG fails
      return "I'm sorry, I'm having trouble accessing my knowledge base right now. For personalized fitness advice, please consult with our gym trainers.";
    }
  }

  /**
   * Generate a workout plan for a user
   * @param {Object} userGoals - User's fitness goals
   * @returns {Promise<string>} - Workout plan
   */
  async generateWorkoutPlan(userGoals) {
    return await this.geminiService.generateWorkoutPlan(userGoals);
  }

  /**
   * Generate a diet plan for a user
   * @param {Object} userInfo - User's dietary information
   * @returns {Promise<string>} - Diet plan
   */
  async generateDietPlan(userInfo) {
    return await this.geminiService.generateDietPlan(userInfo);
  }
}

export default RAGService;