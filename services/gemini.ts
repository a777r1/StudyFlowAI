
import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

// Fix: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); strictly as instructed.
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const chatWithLumina = async (message: string, history: { role: string; content: string }[], imageBase64?: string) => {
  const ai = getGeminiClient();
  
  const systemInstruction = `You are Lumina, a brilliant and empathetic AI study assistant. 
  Your mission is to help students understand complex concepts, not just give answers.
  - Use the Feynman Technique (explain like I'm 5 when asked).
  - Provide structured explanations with bullet points.
  - Use Markdown for bolding and code blocks.
  - If an image of notes is provided, analyze the text and clarify doubts.
  - Be encouraging and curious.`;

  const contents: any = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  const userParts: any[] = [{ text: message }];
  if (imageBase64) {
    userParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
  }

  contents.push({ role: 'user', parts: userParts });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text;
};

export const generateFlashcards = async (topic: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate 5 high-quality flashcards for the topic: ${topic}. Focus on key concepts and definitions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
