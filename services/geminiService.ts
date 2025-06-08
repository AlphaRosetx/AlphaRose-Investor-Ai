
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import {HarmCategory, HarmBlockThreshold} from "@google/genai";


let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


export const initializeGeminiClient = (apiKey: string): boolean => {
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    ai = null;
    return false;
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    return true;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    ai = null;
    return false;
  }
};

export const startNewChatSession = (systemInstruction: string): boolean => {
  if (!ai) {
    console.error("Gemini AI client not initialized. Call initializeGeminiClient first with a valid API key.");
    chatSession = null;
    return false;
  }
  try {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash-preview-04-17',
      config: {
        systemInstruction: systemInstruction,
        safetySettings: safetySettings,
      },
      // history: [] // The Chat object manages its history. Starting new for new system instructions.
    });
    return true;
  } catch (error) {
    console.error("Failed to start new chat session:", error);
    chatSession = null;
    return false;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    // This could happen if startNewChatSession failed or was not called.
    return "Error: Chat session is not active. Please ensure the API key is correct and the session could be started.";
  }
  if (!ai) { // Should be redundant if chatSession exists, but good check
      return "Error: Gemini AI client is not initialized.";
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error) {
        // Check for common API errors, e.g., quota issues, auth failures
        if (error.message.includes("API key not valid")) {
             return "Error: The provided API key is not valid. Please check your API key.";
        }
        return `AI Communication Error: ${error.message}`;
    }
    return "An unexpected error occurred while communicating with the AI.";
  }
};
