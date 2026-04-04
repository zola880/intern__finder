import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiInstance = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  aiInstance = new GoogleGenAI({ apiKey });
} else {
  console.warn('Gemini API key not configured. AI features will be disabled.');
}

export const ai = aiInstance;

export const MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  LITE: "gemini-3.1-flash-lite-preview",
  IMAGE: "gemini-2.5-flash-image",
};

// Mock AI response for when API key is not available
export const mockAIResponse = {
  text: "I'm sorry, but the AI assistant is currently unavailable. Please configure your Gemini API key to enable AI-powered career guidance. You can get an API key from https://aistudio.google.com/app/apikey"
};
