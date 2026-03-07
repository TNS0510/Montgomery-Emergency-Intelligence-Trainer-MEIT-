import { DecisionRecord, Scenario } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const aiFeedbackService = {
  async generateFeedback(history: DecisionRecord[], scenarios: Scenario[]): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return this.generateMockFeedback(history);
    }

    try {
      const prompt = `Analyze these emergency dispatch decisions: ${JSON.stringify(history)}. 
      Provide a concise coaching feedback for the dispatcher.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      return response.text || "Analysis complete. Keep up the good work.";
    } catch (error) {
      console.error("AI Feedback Error:", error);
      return this.generateMockFeedback(history);
    }
  },

  generateMockFeedback(history: DecisionRecord[]): string {
    const accuracy = (history.filter(h => h.isCorrect).length / history.length) * 100;
    if (accuracy === 100) return "Exceptional performance. Your triage accuracy is perfect.";
    if (accuracy > 80) return "Good job. Focus on the subtle differences between emergency and non-emergency calls.";
    return "Training required. Review the rationale for missed calls to improve your triage skills.";
  }
};
