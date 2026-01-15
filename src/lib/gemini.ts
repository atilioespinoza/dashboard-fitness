import { GoogleGenerativeAI } from "@google/generative-ai";
import { FitnessEntry } from "../data/mockData";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const getGeminiInsights = async (data: FitnessEntry[]) => {
  if (!genAI) {
    throw new Error("No Gemini API Key found");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

  const prompt = `
    Eres un Coach de Fitness experto, científico de datos y nutricionista. 
    Analiza los siguientes datos de los últimos 30 días de un usuario y proporciona exactamente 4 insights clave.
    
    ESTRUCTURA DE RETORNO (JSON):
    Retorna UNICAMENTE un array de objetos con este formato:
    [
      { 
        "type": "positive" | "warning" | "info" | "critical", 
        "category": "Nutrición" | "Entrenamiento" | "Recuperación" | "Hábitos",
        "priority": "Alta" | "Media" | "Baja",
        "title": "título corto y directo", 
        "message": "explicación detallada del patrón detectado",
        "action": "misión o acción concreta para el usuario"
      }
    ]

    DATOS DEL USUARIO (ÚLTIMOS 30 DÍAS):
    ${JSON.stringify(data.slice(0, 30))}

    INSTRUCCIONES CLAVE:
    1. ANALIZA TENDENCIAS: Mira más allá del día a día. ¿El peso baja pero la cintura no? ¿Los pasos afectan el sueño?
    2. ACCIÓN CONCRETA: El campo "action" debe ser una "misión" accionable (ej: "Sube 20g de proteína hoy", "Camina 15 min después de cenar").
    3. CATEGORIZA: Clasifica cada insight correctamente.
    4. PRIORIZA: Usa "Alta" para temas críticos (poca proteína, poco sueño, rebote de peso) y "Media/Baja" para optimizaciones.
    5. IDIOMA: Responde totalmente en ESPAÑOL.
    6. FORMATO: No incluyes markdown adicional, solo el JSON puro.
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
