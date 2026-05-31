import axios from 'axios';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8001';

const aiClient = axios.create({
  baseURL: AI_API_URL,
  timeout: 100000,
});

export const aiService = {
  async getMentorRecommendations(userId: string, skills: string[] = [], topK: number = 5) {
    try {
      const response = await aiClient.post('/api/v1/recommend/mentors', {
        user_id: userId,
        skills,
        top_k: topK
      });
      return response.data;
    } catch (error) {
      console.error('AI mentor recommendations error:', error);
      return [];
    }
  },

  async getCourseRecommendations(userId: string, interests: string[] = [], topK: number = 5) {
    try {
      const response = await aiClient.post('/api/v1/recommend/courses', {
        user_id: userId,
        interests,
        top_k: topK
      });
      return response.data;
    } catch (error) {
      console.error('AI course recommendations error:', error);
      return [];
    }
  },

  async chat(message: string, sessionId?: string) {
    try {
      const response = await aiClient.post('/api/v1/chat', {
        message,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  async query(question: string) {
    try {
      const response = await aiClient.post('/api/v1/query', {
        query: question
      });
      return response.data;
    } catch (error) {
      console.error('AI query error:', error);
      throw error;
    }
  }
};
