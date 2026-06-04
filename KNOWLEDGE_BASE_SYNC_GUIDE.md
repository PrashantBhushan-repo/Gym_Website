# Knowledge Base Synchronization Guide

## Problem
Your local MongoDB had the gym knowledge base data, but the deployed MongoDB cluster was empty because the initialization script was never executed on the server.

## Solution
I've implemented automatic knowledge base initialization on server startup. Here's what was done:

### Changes Made
1. **Updated `backend/server.js`**:
   - Added `fs`, `path`, and `fileURLToPath` imports
   - Added directory configuration and category/tag maps
   - Added `initializeKnowledgeBaseIfEmpty()` function that:
     - Checks if the KnowledgeBase collection is empty on startup
     - If empty, automatically populates it with documents from `backend/knowledge_docs/` folder
     - Uses the same RAG service to generate embeddings and store documents

### How It Works

**On Local Environment:**
- Server starts → checks if collection is empty → if yes, auto-populates with your gym knowledge docs
- If already populated, it skips initialization and uses existing data

**On Deployed Environment (Render, Vercel):**
1. Push your code updates (which include the server.js changes)
2. Deploy to Render/Vercel (this will restart the server)
3. Server automatically detects empty collection and populates it
4. Your AI assistant will now have access to the knowledge base globally

## Deployment Steps

### Step 1: Push Changes to GitHub
```bash
cd c:\Users\prash\OneDrive\Desktop\Gym_Website
git add -A
git commit -m "Auto-initialize knowledge base on server startup"
git push origin local:main
```

### Step 2: Deploy to Your Services
- **Render Backend**: Will auto-redeploy on git push, or manually redeploy from Render dashboard
- **MongoDB**: Ensure your Atlas cluster URI is set correctly in environment variables

### Step 3: Verify Deployment
1. Wait 1-2 minutes after deployment for server to start
2. Test your AI assistant at: `https://gym-website-xtj6.onrender.com`
3. Your chatbot should now respond with answers related to your gym

## Manual Population (If Needed)

If you need to manually trigger knowledge base population:

```bash
# From Render dashboard or local terminal:
curl -X POST https://your-backend-url/api/knowledge/reindex
```

Or add an authorization header if you implement authentication:
```bash
curl -X POST https://your-backend-url/api/knowledge/reindex \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

## Environment Variables Required

Make sure these are set in your deployed environment:

**Render Backend:**
- `MONGO_URI` or `MONGODB_URI` - Your MongoDB Atlas connection string
- `GEMINI_API_KEY` - Google Gemini API key (same as local)
- `GEMINI_MODEL_NAME` - (optional, defaults to 'models/gemini-flash-latest')
- `GEMINI_EMBEDDING_MODEL_NAME` - (optional, defaults to 'models/gemini-embedding-2')

**Vercel Frontend:**
- `REACT_APP_API_URL` - Your Render backend URL

## Troubleshooting

### Knowledge base still empty after deployment?

1. **Check MongoDB Connection:**
   ```bash
   # In Render logs, look for:
   "Connected to MongoDB"
   ```

2. **Check Initialization Log:**
   ```bash
   # In Render logs, look for:
   "📚 Knowledge base is empty. Initializing with gym knowledge documents..."
   ```

3. **Manual Reindex:**
   - Visit: `https://your-backend-url/api/knowledge/reindex`
   - Should return: `{"success":true,"message":"Reindexed gym knowledge pages.","uploadedDocsCount":X}`

4. **Verify Knowledge Docs:**
   - Ensure `backend/knowledge_docs/` folder with .md files is committed to git
   - Check that files include: `about_fitzone.md`, `membership_plans.md`, etc.

### API Keys Not Working?

1. **Verify same API key is used:**
   - Local and deployed should use the SAME `GEMINI_API_KEY`
   - Check Render environment variables vs local `.env`

2. **Test API Key:**
   ```bash
   # In backend, the GeminiService will log if initialization fails
   # Check Render logs for warnings
   ```

## Testing the Solution

1. **Local Test First:**
   ```bash
   cd backend
   npm start
   ```
   - Should see: `✅ Knowledge base initialized with X documents!`

2. **Ask Your Chatbot:**
   - "What membership plans do you have?"
   - "Tell me about your gym services"
   - "What are your contact details?"
   - Should get answers from your knowledge base

3. **Deployed Test:**
   - Visit your Vercel app: `https://gym-website-eight-plum.vercel.app`
   - Ask the same questions
   - Should get same answers as local

## Files Modified

- `backend/server.js` - Added auto-initialization logic
- No breaking changes to existing code
- Backward compatible with existing database

## Next Steps

1. Commit and push these changes
2. Redeploy your Render backend
3. Wait 2-3 minutes for initialization
4. Test your deployed application

Your AI assistant should now work globally! 🚀
