import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client. Note: In a real production app, 
// you should proxy this through a backend to protect your API key.
// For this demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getInventoryInsights = async (products: Product[], query: string): Promise<string> => {
  if (!API_KEY) {
    return "API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const inventorySummary = products.map(p => ({
      name: p.name,
      variants: p.variants.map(v => ({
        color: v.name,
        totalSlots: v.entries.length,
        stocked: v.entries.filter(e => e.status === 'stocked').length,
        sold: v.entries.filter(e => e.status === 'sold').length,
        empty: v.entries.filter(e => e.status === 'empty').length,
      }))
    }));

    const prompt = `
      Context: You are an intelligent inventory assistant for a retail app.
      Here is the current inventory data in JSON format:
      ${JSON.stringify(inventorySummary, null, 2)}

      User Query: ${query}

      Instructions:
      - Analyze the data to answer the user's question.
      - Keep answers concise, professional, and helpful.
      - If suggesting actions (like restocking), be specific about which color/product.
      - Do not output Markdown formatting for the whole response, just plain text or simple lists.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for simple queries
      }
    });

    return response.text || "I couldn't generate an insight at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing your inventory.";
  }
};