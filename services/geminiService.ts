import { GoogleGenAI } from "@google/genai";

// Initialize the client using environment variable (NEXT_PUBLIC_ prefix for client-side access)
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export const askMenuAssistant = async (query: string, menuContext: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert waiter assistant for 'Sanskar Restro'. 
    Answer questions briefly about the menu items. 
    Focus on allergens, taste profiles, and pairings.
    Here is the current menu context: ${menuContext}
    Keep answers under 50 words suitable for a quick verbal reply to a guest.`;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
      }
    });

    return response.text || "I couldn't find an answer for that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the kitchen brain right now.";
  }
};
