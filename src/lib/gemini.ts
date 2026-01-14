import { GoogleGenerativeAI } from "@google/generative-ai";
import { FitnessEntry } from "../data/mockData";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const getGeminiInsights = async (data: FitnessEntry[]) => {
  if (!genAI) {
    throw new Error("No Gemini API Key found");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Eres un Coach de Fitness experto, científico de datos y nutricionista. 
    Analiza los siguientes datos de los últimos 14 días de un usuario y proporciona exactamente 4 insights clave.
    
    ESTRUCTURA DE RETORNO (JSON):
    Retorna un array de objetos con este formato:
    [
      { "type": "positive" | "warning" | "info" | "critical", "title": "...", "message": "..." }
    ]

    DATOS DEL USUARIO:
    ${JSON.stringify(data.slice(0, 14))}

    INSTRUCCIONES:
    - Sé muy específico. Menciona tendencias de peso, cintura, proteína y pasos.
    - Si detectas que el peso baja pero la cintura no, o viceversa, explícalo.
    - Si el sueño es bajo, advierte sobre el cortisol.
    - Usa un tono motivador pero profesional.
    - TRADUCE TODO AL ESPAÑOL.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Improved JSON extraction: find the first '[' and last ']'
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not find JSON array in Gemini response:", text);
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return null;
  }
};
