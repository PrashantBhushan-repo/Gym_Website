import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.useFallback = !this.apiKey || this.apiKey === 'your_gemini_api_key_here';
    let generationModelName = process.env.GEMINI_MODEL_NAME || 'models/gemini-flash-latest';
    if (['text-bison-001', 'gemini-1.5-flash', 'gemini-1.5-pro'].includes(generationModelName)) {
      console.warn(`Gemini model ${generationModelName} is not supported by the current API. Falling back to models/gemini-flash-latest.`);
      generationModelName = 'models/gemini-flash-latest';
    }
    this.generationModelName = generationModelName;
    this.embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL_NAME || 'models/gemini-embedding-2';
    this.useEmbeddingFallback = true;

    if (!this.useFallback) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: this.generationModelName });

        try {
          this.embeddingModel = this.genAI.getGenerativeModel({ model: this.embeddingModelName });
          this.useEmbeddingFallback = false;
        } catch (embedError) {
          console.warn('Embedding model initialization failed, using fallback embeddings:', embedError.message);
          this.embeddingModel = null;
          this.useEmbeddingFallback = true;
        }

        console.log(`Gemini API initialized with generation model: ${this.generationModelName}`);
        console.log(`Gemini embedding model: ${this.embeddingModelName} (fallback=${this.useEmbeddingFallback})`);
      } catch (error) {
        console.warn('Gemini API initialization failed, using fallback responses:', error.message);
        this.useFallback = true;
      }
    }

    if (this.useFallback) {
      console.log('Using fallback AI responses (Gemini API key not configured or initialization failed)');
    } else {
      console.log('Using Gemini API for text generation and embeddings');
    }
  }

  /**
   * Generate text response using Gemini Pro or fallback
   * @param {string} prompt - The prompt to send to Gemini
   * @returns {Promise<string>} - The generated response
   */
  async normalizeResponseFormatting(text) {
    if (!text || typeof text !== 'string') {
      return String(text ?? '');
    }

    let cleaned = text
      .replace(/\*\*(.*?)\*\*/gs, '$1')
      .replace(/(^|\n)\s*\*\s+/g, '$1- ')
      .replace(/(^|\n)\s*•\s+/g, '$1- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleaned;
  }

  async generateResponse(prompt) {
    if (this.useFallback) {
      return this.generateFallbackResponse(prompt);
    }

    try {
      const result = await this.model.generateContent([prompt]);
      const response = result?.response ?? result;
      let text = '';

      if (response?.candidates && Array.isArray(response.candidates)) {
        text = response.candidates
          .map(candidate => {
            const content = candidate?.content;
            if (content?.parts) {
              return content.parts.map(part => part.text).join('');
            }
            if (typeof content === 'string') {
              return content;
            }
            return '';
          })
          .join('\n\n')
          .trim();
      } else if (typeof response?.text === 'function') {
        text = await response.text();
      } else if (typeof response === 'string') {
        text = response;
      } else if (response?.content?.parts) {
        text = response.content.parts.map(part => part.text).join('').trim();
      } else {
        text = String(result ?? 'Sorry, I could not generate a response right now.');
      }

      return this.normalizeResponseFormatting(text);
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      return this.generateFallbackResponse(prompt);
    }
  }

  /**
   * Answer a question using context from RAG
   * @param {string} question - User's question
   * @param {string} context - Relevant context from documents
   * @param {Object} userContext - User's goals and preferences
   * @returns {Promise<string>} - AI response
   */
  async answerQuestion(question, context, userContext = {}) {
    const contextPrompt = context ? `\n\nRelevant information:\n${context}` : '';
    const userInfo = userContext.goals || userContext.preferences ?
      `\n\nUser context: Goals - ${userContext.goals || 'N/A'}, Preferences - ${userContext.preferences || 'N/A'}` : '';

    const fullPrompt = `You are a helpful AI fitness assistant for FitZone gym. Use only the relevant information provided in the context below to answer the question. Format your response with clear headings and simple bullet points. Avoid using markdown bold syntax like **. Use plain text bullets such as '-' when listing items.

Question: ${question}${contextPrompt}${userInfo}

Answer clearly and naturally, referencing the context when possible.`;

    return await this.generateResponse(fullPrompt);
  }

  /**
   * Generate fallback response when Gemini API is not available
   * @param {string} prompt - The user's prompt
   * @returns {string} - A fallback response
   */
  generateFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return "Hello! I'm your AI Fitness Assistant. I can help you with:\n- Workout plans\n- Nutrition advice\n- Gym information\nWhat would you like to know?";
    }

    if (lowerPrompt.includes('membership') || lowerPrompt.includes('plans')) {
      return "We offer three membership plans:\n- Basic: ₹2,900/month — gym access, basic equipment, locker rooms\n- Premium: ₹5,900/month — 24/7 access, classes, pool & sauna, one personal training session per month\n- Elite: ₹9,900/month — all Premium benefits plus 4 personal training sessions, nutrition plan, priority booking, and guest passes\nWould you like more details about a specific plan?";
    }

    if (lowerPrompt.includes('hours') || lowerPrompt.includes('open')) {
      return "Our gym is open 24/7. Staff support is available from 5 AM to 11 PM daily. You can access the facility anytime with your membership.";
    }

    if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise')) {
      return "I can help you create a personalized workout plan. Please tell me your goals, such as:\n- Weight loss\n- Muscle gain\n- General fitness\n- Strength training";
    }

    if (lowerPrompt.includes('diet') || lowerPrompt.includes('nutrition')) {
      return "Nutrition is essential for fitness success. I can help with:\n- Meal planning\n- Dietary guidance\n- Healthy eating tips\nWhat type of nutrition support are you looking for?";
    }

    return "I'm here to help with your fitness journey. I can assist with:\n- Workout plans\n- Nutrition advice\n- Gym membership options\n- Class schedules and services\nWhat would you like to know?";
  }

  /**
   * Generate embeddings for text using Gemini
   * @param {string} text - The text to embed
   * @returns {Promise<number[]>} - The embedding vector
   */
  async generateEmbeddings(text) {
    if (this.useFallback || this.useEmbeddingFallback || !this.embeddingModel) {
      return this.generateFallbackEmbedding(text);
    }

    try {
      const result = await this.embeddingModel.embedContent([text]);
      const embedding = result?.embedding?.values ?? result?.data?.[0]?.embedding ?? result?.data?.[0]?.embedding?.values ?? result?.embedding;

      if (Array.isArray(embedding)) {
        return embedding;
      }

      return this.generateFallbackEmbedding(text);
    } catch (error) {
      console.error('Error generating embeddings with Gemini:', error);
      return this.generateFallbackEmbedding(text);
    }
  }

  generateFallbackEmbedding(text) {
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const embedding = [];

    for (let i = 0; i < hash.length; i += 2) {
      embedding.push(parseInt(hash.substr(i, 2), 16) / 255);
    }

    while (embedding.length < 768) {
      embedding.push(0);
    }

    return embedding.slice(0, 768);
  }

  /**
   * Generate a structured workout plan
   * @param {Object} userGoals - User's fitness goals and preferences
   * @returns {Promise<string>} - Formatted workout plan
   */
  async generateWorkoutPlan(userGoals) {
    if (this.useFallback) {
      return this.generateFallbackWorkoutPlan(userGoals);
    }

    const prompt = `
Generate a personalized workout plan based on the following user information:

Goals: ${userGoals.goals || 'General fitness'}
Experience Level: ${userGoals.experience || 'Beginner'}
Days per week: ${userGoals.daysPerWeek || 3}
Equipment: ${userGoals.equipment || 'Bodyweight and basic gym equipment'}
Preferences: ${userGoals.preferences || 'No specific preferences'}

Please provide a detailed workout plan with:
1. Weekly schedule
2. Specific exercises for each day
3. Sets and reps
4. Rest periods
5. Progression tips

Format the response in a clear, easy-to-follow structure.
`;

    return await this.generateResponse(prompt);
  }

  /**
   * Generate fallback workout plan
   * @param {Object} userGoals - User's fitness goals
   * @returns {string} - Basic workout plan
   */
  generateFallbackWorkoutPlan(userGoals) {
    const goals = userGoals.goals || 'general fitness';
    const days = userGoals.daysPerWeek || 3;

    let plan = `**${goals.toUpperCase()} WORKOUT PLAN**\n\n`;
    plan += `**Frequency:** ${days} days per week\n\n`;

    if (goals.toLowerCase().includes('weight loss')) {
      plan += `**Weekly Schedule:**\n`;
      plan += `• **Day 1: Cardio & Core**\n  - 30 min brisk walking/jogging\n  - Planks: 3 sets × 30 seconds\n  - Russian twists: 3 sets × 20 reps\n\n`;
      plan += `• **Day 2: Full Body Strength**\n  - Squats: 3 sets × 15 reps\n  - Push-ups: 3 sets × 10 reps\n  - Bent-over rows: 3 sets × 12 reps\n\n`;
      plan += `• **Day 3: Active Recovery**\n  - Light yoga or stretching\n  - 20 min walking\n\n`;
      if (days >= 4) {
        plan += `• **Day 4: HIIT Circuit**\n  - 20 min HIIT workout\n  - Burpees: 3 sets × 10 reps\n  - Mountain climbers: 3 sets × 30 seconds\n\n`;
      }
    } else if (goals.toLowerCase().includes('muscle') || goals.toLowerCase().includes('strength')) {
      plan += `**Weekly Schedule:**\n`;
      plan += `• **Day 1: Chest & Triceps**\n  - Bench press: 4 sets × 8-12 reps\n  - Push-ups: 3 sets × 12 reps\n  - Tricep dips: 3 sets × 10 reps\n\n`;
      plan += `• **Day 2: Back & Biceps**\n  - Pull-ups or rows: 4 sets × 8-12 reps\n  - Bicep curls: 3 sets × 10 reps\n  - Face pulls: 3 sets × 12 reps\n\n`;
      plan += `• **Day 3: Rest or Light Cardio**\n\n`;
      if (days >= 4) {
        plan += `• **Day 4: Legs**\n  - Squats: 4 sets × 8-12 reps\n  - Lunges: 3 sets × 10 reps per leg\n  - Calf raises: 3 sets × 15 reps\n\n`;
      }
    } else {
      plan += `**Weekly Schedule:**\n`;
      plan += `• **Day 1: Upper Body**\n  - Push-ups: 3 sets × 12 reps\n  - Dumbbell rows: 3 sets × 10 reps\n  - Shoulder press: 3 sets × 10 reps\n\n`;
      plan += `• **Day 2: Lower Body**\n  - Squats: 3 sets × 15 reps\n  - Lunges: 3 sets × 10 reps per leg\n  - Calf raises: 3 sets × 20 reps\n\n`;
      plan += `• **Day 3: Core & Cardio**\n  - Planks: 3 sets × 45 seconds\n  - 20-30 min cardio (walking, cycling, etc.)\n`;
    }

    plan += `\n**Tips:**\n`;
    plan += `• Warm up for 5-10 minutes before each workout\n`;
    plan += `• Rest 60-90 seconds between sets\n`;
    plan += `• Focus on proper form to prevent injury\n`;
    plan += `• Stay hydrated and fuel your body properly\n`;
    plan += `• Track your progress and increase weights/reps as you get stronger\n\n`;
    plan += `Consult with our trainers for personalized adjustments!`;

    return plan;
  }

  /**
   * Generate a personalized diet plan
   * @param {Object} userInfo - User's dietary preferences and goals
   * @returns {Promise<string>} - Formatted diet plan
   */
  async generateDietPlan(userInfo) {
    if (this.useFallback) {
      return this.generateFallbackDietPlan(userInfo);
    }

    const prompt = `
Create a personalized diet plan based on:

Goals: ${userInfo.goals || 'Weight management'}
Dietary Restrictions: ${userInfo.restrictions || 'None'}
Calories per day: ${userInfo.calories || '2000-2500'}
Meal preferences: ${userInfo.preferences || 'Balanced diet'}
Allergies: ${userInfo.allergies || 'None'}

Provide:
1. Daily meal structure
2. Specific food recommendations
3. Portion sizes
4. Nutritional breakdown
5. Shopping list suggestions

Make it practical and sustainable.
`;

    return await this.generateResponse(prompt);
  }

  /**
   * Generate fallback diet plan
   * @param {Object} userInfo - User's dietary preferences
   * @returns {string} - Basic diet plan
   */
  generateFallbackDietPlan(userInfo) {
    const goals = userInfo.goals || 'balanced nutrition';
    const calories = userInfo.calories || '2000-2500';

    let plan = `**${goals.toUpperCase()} DIET PLAN**\n\n`;
    plan += `**Daily Calories:** Approximately ${calories}\n\n`;

    plan += `**Daily Meal Structure:**\n\n`;

    plan += `**Breakfast (400-500 calories):**\n`;
    plan += `• Oatmeal with berries and nuts\n`;
    plan += `• Greek yogurt with fruit\n`;
    plan += `• Whole grain toast with avocado and eggs\n\n`;

    plan += `**Lunch (500-600 calories):**\n`;
    plan += `• Grilled chicken salad with mixed greens\n`;
    plan += `• Turkey wrap with vegetables\n`;
    plan += `• Quinoa bowl with vegetables and lean protein\n\n`;

    plan += `**Dinner (500-600 calories):**\n`;
    plan += `• Baked salmon with sweet potato and broccoli\n`;
    plan += `• Stir-fried tofu with brown rice and vegetables\n`;
    plan += `• Lean beef stir-fry with mixed vegetables\n\n`;

    plan += `**Snacks (200-300 calories total):**\n`;
    plan += `• Apple with almond butter\n`;
    plan += `• Carrot sticks with hummus\n`;
    plan += `• Handful of nuts and dried fruit\n\n`;

    plan += `**Macronutrient Breakdown:**\n`;
    plan += `• Protein: 30-35% (${Math.round((calories.split('-')[0] * 0.35) / 4)}g)\n`;
    plan += `• Carbohydrates: 40-50% (${Math.round((calories.split('-')[0] * 0.45) / 4)}g)\n`;
    plan += `• Fats: 20-30% (${Math.round((calories.split('-')[0] * 0.25) / 9)}g)\n\n`;

    plan += `**Weekly Shopping List:**\n`;
    plan += `• Proteins: Chicken breast, salmon, eggs, Greek yogurt, tofu\n`;
    plan += `• Vegetables: Broccoli, spinach, carrots, sweet potatoes, mixed greens\n`;
    plan += `• Fruits: Apples, berries, bananas\n`;
    plan += `• Grains: Oatmeal, quinoa, brown rice, whole grain bread\n`;
    plan += `• Healthy fats: Avocado, nuts, olive oil, almond butter\n\n`;

    plan += `**Tips:**\n`;
    plan += `• Drink at least 8 glasses of water daily\n`;
    plan += `• Eat every 3-4 hours to maintain energy levels\n`;
    plan += `• Include a variety of colorful vegetables\n`;
    plan += `• Adjust portions based on your hunger and activity level\n`;
    plan += `• Consult our nutritionists for personalized adjustments\n\n`;

    plan += `Remember: Individual needs vary. Consult our nutritionists for personalized plans!`;

    return plan;
  }

  /**
   * Answer gym-related questions using context
   * @param {string} question - User's question
   * @param {string} context - Relevant context from knowledge base
   * @param {Object} userContext - User's goals and preferences
   * @returns {Promise<string>} - AI response
   */
  async answerQuestion(question, context = '', userContext = {}) {
    const contextBlock = context ? `Knowledge from the gym website:\n${context}\n\n` : '';
    const userContextBlock = userContext && Object.keys(userContext).length
      ? `User Profile:\n${Object.entries(userContext)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n')}\n\n`
      : '';

    const prompt = `You are FitZone Gym's AI assistant. Use only the information below from the gym knowledge base to answer the user's question. If the answer is not contained in the knowledge base, be honest and suggest the user contact the gym staff for more details.\n\n${contextBlock}${userContextBlock}Question: ${question}\n\nAnswer:`;

    return await this.generateResponse(prompt);
  }
}

export default GeminiService;