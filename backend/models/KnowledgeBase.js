import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  tags: [String],
  embeddings: [Number], // Vector embeddings for RAG
  source: String, // File path or URL
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

export default KnowledgeBase;