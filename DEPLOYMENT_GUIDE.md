# 🚀 Deployment Guide - AI Fitness Assistant

Complete step-by-step guide to deploy your AI-powered gym chatbot to production.

## 📋 Prerequisites

- ✅ Google Gemini API key (free)
- ✅ MongoDB Atlas account (free tier available)
- ✅ Vercel account (free)
- ✅ Render account (free tier available)
- ✅ GitHub repository

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. **Update package.json** (already done):
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

2. **Environment Variables** for Render:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gym_website
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_random_secret_here
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### Step 2: Deploy to Render

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Service**:
   - **Name**: `fitzone-backend` (or your choice)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

3. **Environment Variables**:
   - Add all variables from Step 1
   - Make sure `GEMINI_API_KEY` is set correctly

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the service URL (e.g., `https://fitzone-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API Configuration**:
   - Edit `frontend/src/config/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
```

2. **Build Configuration**:
   - Create `frontend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 2: Deploy to Vercel

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` directory

2. **Configure Project**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-render-backend-url
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy the domain (e.g., `https://fitzone-frontend.vercel.app`)

## 🔗 Connect Frontend to Backend

### Step 1: Update CORS in Backend

In your Render backend environment variables, update `FRONTEND_URL`:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 2: Update Frontend API URL

In Vercel, set the environment variable:
```
REACT_APP_API_URL=https://your-render-backend-url
```

### Step 3: Redeploy Both Services

1. **Redeploy Backend**: Go to Render → Manual Deploy → Deploy latest commit
2. **Redeploy Frontend**: Vercel auto-deploys on git push, or manual deploy

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. **Sign Up/Login**: [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose free tier (M0)
3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `fitzone_user`
   - Password: `your_secure_password`
   - Built-in Role: `Read and write any database`

4. **Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Allow access from anywhere: `0.0.0.0/0`

5. **Connection String**:
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2: Initialize Knowledge Base

After deployment, run the knowledge base initialization:

```bash
# Locally (for testing)
cd backend
node scripts/initKnowledgeBase.js

# Or via SSH if you have Render paid plan
# Or run locally and the data will sync to Atlas
```

## 🔑 Google Gemini API Setup

### Step 1: Get API Key

1. **Visit**: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Create API Key**: Click "Create API key"
3. **Copy Key**: Save it securely

### Step 2: Add to Environment Variables

In **Render Backend** environment variables:
```
GEMINI_API_KEY=your_api_key_here
```

## ✅ Testing Deployment

### Step 1: Test Backend API

```bash
# Test chat endpoint
curl -X POST https://your-render-backend-url/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, what are your gym hours?"}'
```

Expected response:
```json
{
  "response": "Our gym hours are Monday-Friday 5AM-11PM, Saturday 6AM-10PM, Sunday 7AM-9PM...",
  "sessionId": "some-uuid"
}
```

### Step 2: Test Frontend

1. **Visit**: `https://your-vercel-app.vercel.app`
2. **Open Chatbot**: Click the floating button
3. **Test Questions**:
   - "What membership plans do you offer?"
   - "Create a workout plan for beginners"
   - "What classes are available?"

## 🔧 Troubleshooting Deployment

### Backend Issues

**"Application failed to start"**
- Check Render logs
- Verify all environment variables are set
- Check MongoDB connection string

**"Gemini API error"**
- Verify `GEMINI_API_KEY` is correct
- Check API quota/limits

**"CORS error"**
- Ensure `FRONTEND_URL` matches your Vercel domain
- Include `https://` protocol

### Frontend Issues

**"API calls failing"**
- Check `REACT_APP_API_URL` in Vercel
- Ensure backend is deployed and accessible

**"Chatbot not loading"**
- Check browser console for errors
- Verify component imports

### Database Issues

**"Connection timeout"**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Test connection locally first

## 📊 Monitoring & Maintenance

### Render Monitoring
- **Logs**: View in Render dashboard
- **Metrics**: Response times, error rates
- **Scaling**: Upgrade plan if needed

### Vercel Monitoring
- **Analytics**: Function duration, error rates
- **Logs**: Real-time logs
- **Performance**: Core Web Vitals

### Database Monitoring
- **MongoDB Atlas**: Monitor connection counts, performance
- **Backup**: Enable automated backups

## 🔄 Updates

### Code Updates
1. **Push to GitHub**
2. **Render**: Auto-deploys on push
3. **Vercel**: Auto-deploys on push

### Environment Variables
- Update in respective dashboards
- Redeploy services

### Database Schema
- Update models locally
- Test migrations
- Deploy updated code

## 💰 Cost Optimization

### Free Tiers
- **Render**: 750 hours/month free
- **Vercel**: Unlimited static sites
- **MongoDB Atlas**: 512MB free
- **Gemini API**: 60 requests/minute free

### Paid Upgrades (if needed)
- **Render**: $7/month for always-on service
- **MongoDB Atlas**: $9/month for 2GB storage
- **Gemini API**: Higher limits available

## 🚨 Emergency Contacts

- **Render Support**: https://render.com/docs/support
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/support
- **Google AI Support**: https://ai.google.dev/support

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] MongoDB Atlas connected
- [ ] Gemini API key configured
- [ ] Knowledge base initialized
- [ ] CORS configured correctly
- [ ] Chatbot responding to questions
- [ ] Workout/diet plans generating
- [ ] Mobile responsive
- [ ] Error handling working

**Your AI Fitness Assistant is now live! 🎉**