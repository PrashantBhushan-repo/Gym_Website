# AI Fitness Assistant Setup Guide

## Overview
This guide will help you set up the AI Fitness Assistant for your gym website using AWS Bedrock and Pinecone for RAG (Retrieval-Augmented Generation).

## Prerequisites
- Node.js 18+
- MongoDB Atlas account
- AWS account with Bedrock access
- Pinecone account

## 1. Environment Variables

Create a `.env` file in the backend root directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gym_website

# AWS Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=gym-knowledge

# Email (existing)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Session (existing)
SESSION_SECRET=your_session_secret

# Google OAuth (existing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Razorpay (existing)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000,https://your-frontend-url.vercel.app
```

## 2. AWS Setup

### Enable Bedrock Models
1. Go to AWS Bedrock console
2. Request access to:
   - Anthropic Claude v2
   - Meta Llama 2 13B Chat
   - Amazon Titan Embeddings
3. Create IAM user with Bedrock permissions

### Required IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

## 3. Pinecone Setup

1. Create Pinecone account
2. Create a new index:
   - Name: `gym-knowledge`
   - Dimension: `1536` (for Titan embeddings)
   - Metric: `cosine`
3. Get your API key

## 4. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 5. Initialize Knowledge Base

Run this script to populate the knowledge base:

```javascript
// In backend/scripts/initKnowledgeBase.js
import mongoose from 'mongoose';
import RAGService from '../services/ragService.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleDocuments = [
  {
    title: "Gym Membership Plans",
    content: "Basic Plan: $29/month - Access to gym equipment. Premium Plan: $49/month - Equipment + classes. Elite Plan: $79/month - All access + personal training.",
    category: "pricing",
    tags: ["membership", "pricing", "plans"]
  },
  {
    title: "Weight Loss Workout",
    content: "Focus on cardio and strength training. 45 minutes cardio, 30 minutes weights. Include HIIT sessions 3x/week.",
    category: "workout",
    tags: ["weight_loss", "cardio", "hiit"]
  },
  // Add more documents...
];

async function initKB() {
  await mongoose.connect(process.env.MONGO_URI);
  const ragService = new RAGService();
  await ragService.initialize();

  for (const doc of sampleDocuments) {
    await ragService.addDocument(doc.title, doc.content, doc.category, doc.tags);
  }

  console.log('Knowledge base initialized');
  process.exit(0);
}

initKB();
```

Run it:
```bash
node scripts/initKnowledgeBase.js
```

## 6. Start the Application

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm start
```

## 7. Test the AI Assistant

1. Open the website
2. Click the chat bubble in the bottom right
3. Ask questions like:
   - "What are your membership prices?"
   - "How can I lose weight?"
   - "What's your refund policy?"

## 8. Deployment

### Backend (Render)
1. Connect your GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### Frontend (Vercel)
1. Connect GitHub repo
2. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add environment variables if needed

## 9. Monitoring

- Monitor AWS Bedrock usage in AWS console
- Check Pinecone usage dashboard
- Monitor MongoDB Atlas performance

## 10. Security Best Practices

- Use environment variables for all secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Regular security audits

## Troubleshooting

### Common Issues

1. **Bedrock Access Denied**
   - Ensure model access is approved in AWS Bedrock
   - Check IAM permissions

2. **Pinecone Connection Failed**
   - Verify API key
   - Check index name and dimensions

3. **Embeddings Generation Failed**
   - Ensure Titan Embeddings access
   - Check AWS region

4. **Chat Not Working**
   - Check backend logs
   - Verify API endpoints
   - Check CORS settings

## Support

For issues, check:
- AWS Bedrock documentation
- Pinecone documentation
- MongoDB Atlas logs
- Application logs