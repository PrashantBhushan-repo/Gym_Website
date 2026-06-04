# 🤖 AI Fitness Assistant - FitZone Gym

A production-ready AI chatbot for gym websites built with React, Node.js, Express, MongoDB, and Google Gemini API.

## ✨ Features

- **Smart AI Responses**: Powered by Google Gemini Pro for intelligent gym-related conversations
- **RAG Architecture**: Retrieval-Augmented Generation for accurate, context-aware responses
- **Personalized Plans**: Generate custom workout and diet plans
- **Modern UI**: Beautiful floating chatbot with animations and responsive design
- **Chat History**: Persistent conversation storage in MongoDB
- **Quick Actions**: One-click access to workout plans, diet plans, and FAQs
- **Real-time Typing**: Animated typing indicators for better UX
- **Mobile Friendly**: Fully responsive design for all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Vercel** - Frontend deployment

### Backend
- **Node.js + Express** - RESTful API server
- **Google Gemini API** - AI model for responses
- **MongoDB Atlas** - Database for chat history and knowledge base
- **Render** - Backend deployment

### AI Features
- **RAG System** - Context-aware responses using vector search
- **Knowledge Base** - Pre-loaded gym information (FAQs, policies, services)
- **Personalization** - User goal-based responses
- **Plan Generation** - AI-powered workout and diet plans

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key (free tier available)
- Vercel account (frontend)
- Render account (backend)

### 1. Clone and Install

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Variables

Create `.env` file in backend directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gym_website

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Email (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Session Security
SESSION_SECRET=your_secure_random_session_secret

# CORS
FRONTEND_URL=http://localhost:3000,https://your-frontend-domain.vercel.app
```

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. Initialize Knowledge Base

```bash
cd backend
node scripts/initKnowledgeBase.js
```

This will populate the AI with gym-specific knowledge including:
- Membership plans and pricing
- Facility information and hours
- Personal training services
- Group fitness classes
- Nutrition services
- Gym policies and rules
- Beginner workout guides
- Healthy eating guidelines

### 5. Start Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

### 6. Test the Chatbot

1. Open http://localhost:3000
2. Click the floating chatbot button (💪)
3. Try asking:
   - "What are your membership plans?"
   - "Create a workout plan for me"
   - "What classes do you offer?"
   - "Tell me about your nutrition services"

## 📁 Project Structure

```
gym-website/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic (Gemini, RAG)
│   ├── scripts/             # Initialization scripts
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chatbot/     # AI chatbot component
│   │   │   └── ...
│   │   ├── pages/
│   │   ├── services/        # API services
│   │   └── App.js
│   ├── package.json
│   └── public/
└── README.md
```

## 🔧 API Endpoints

### Chat Endpoints
- `POST /api/chat` - Send message to AI assistant
- `GET /api/history` - Get chat history

### Plan Generation
- `POST /api/workout-plan` - Generate personalized workout plan
- `POST /api/diet-plan` - Generate personalized diet plan
- `GET /api/user-plans/:userId` - Get user's saved plans

### Knowledge Base
- `POST /api/upload-docs` - Add documents to knowledge base
- `POST /api/user-goals` - Update user fitness goals

## 🎨 Customization

### Styling
The chatbot uses custom CSS with modern design. Key files:
- `frontend/src/components/chatbot/Chatbot.css` - Main styling
- Colors and themes can be customized in the CSS variables

### AI Responses
Modify response behavior in:
- `backend/services/geminiService.js` - AI service configuration
- `backend/services/ragService.js` - RAG logic and prompts

### Knowledge Base
Add more gym information by editing:
- `backend/scripts/initKnowledgeBase.js` - Initial data
- Use the `/api/upload-docs` endpoint to add more content

## 🚀 Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Deploy!

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variable: `REACT_APP_API_URL=https://your-render-backend-url`
3. Deploy!

### Environment Variables for Production

```env
# Backend (Render)
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_secure_session_secret
FRONTEND_URL=https://your-vercel-frontend-url
NODE_ENV=production

# Frontend (Vercel)
REACT_APP_API_URL=https://your-render-backend-url
```

## 🤖 How Gemini API Works

1. **API Key**: Get your free API key from Google AI Studio
2. **Model**: Uses Gemini Pro model for text generation
3. **Requests**: Sends prompts with context for intelligent responses
4. **Free Tier**: 60 requests per minute, sufficient for most gym websites

## 🔍 How RAG Works

1. **Knowledge Base**: Stores gym information in MongoDB
2. **Embeddings**: Converts text to vectors for semantic search
3. **Query Processing**: Finds relevant information for user questions
4. **Context Injection**: Adds relevant context to AI prompts
5. **Response Generation**: Gemini generates personalized responses

## 💾 Chat Memory

- **Storage**: MongoDB collections for chat history and user goals
- **Persistence**: Conversations saved per user/session
- **Context**: User goals and preferences remembered across sessions
- **Privacy**: Data stored securely in MongoDB Atlas

## 🛡️ Security & Best Practices

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes user inputs
- **Error Handling**: Graceful error responses
- **Environment Variables**: Sensitive data not in code
- **CORS**: Configured for frontend domains

## 🐛 Troubleshooting

### Common Issues

1. **"Gemini API key invalid"**
   - Check your API key in Google AI Studio
   - Ensure key is copied correctly to `.env`

2. **"MongoDB connection failed"**
   - Verify MongoDB Atlas connection string
   - Check network connectivity
   - Ensure IP whitelist includes your servers

3. **Chatbot not responding**
   - Check browser console for errors
   - Verify backend is running
   - Check CORS settings

4. **Knowledge base empty**
   - Run `node scripts/initKnowledgeBase.js`
   - Check MongoDB connection

### Debug Commands

```bash
# Test backend connection
curl http://localhost:5000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"Hello"}'

# Check MongoDB connection
cd backend && node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(console.error)"

# Test Gemini API
cd backend && node -e "import { GoogleGenerativeAI } from '@google/generative-ai'; const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); console.log('Gemini initialized')"
```

## 📈 Performance Optimization

- **Response Caching**: Implement Redis for frequently asked questions
- **Database Indexing**: Add indexes on frequently queried fields
- **API Rate Limiting**: Prevent abuse with express-rate-limit
- **Compression**: Enable gzip compression for responses
- **CDN**: Use CDN for static assets

## 🔄 Updates & Maintenance

- **Knowledge Base**: Regularly update with new gym information
- **Dependencies**: Keep packages updated for security
- **Monitoring**: Monitor API usage and response times
- **Backup**: Regular MongoDB backups
- **Testing**: Test new features before production deployment

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser/network console for errors
3. Check server logs in Render dashboard
4. Verify environment variables are set correctly

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for gym owners who want to provide exceptional member experiences with AI-powered assistance.**