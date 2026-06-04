import mongoose from 'mongoose';

const pageInfoSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'page' },
  tags: [String],
  source: { type: String, default: 'page_info' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PageInfo = mongoose.model('PageInfo', pageInfoSchema);
export default PageInfo;
