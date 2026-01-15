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

export const getFullReport = async (data: FitnessEntry[]) => {
  if (!genAI) {
    throw new Error("No Gemini API Key found");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Eres un Consultor de Salud y High Performance Coach. 
    Analiza este dataset completo (últimos 30-60 días) y genera un REPORTE EJECUTIVO DE ALTO NIVEL.
    
    DATOS DEL USUARIO:
    ${JSON.stringify(data.slice(0, 60))}

    TU REPORTE DEBE TENER ESTA ESTRUCTURA (JSON):
    {
      "executiveSummary": "Un párrafo potente analizando la evolución metabólica real.",
      "blindSpots": ["Punto ciego 1", "Punto ciego 2"],
      "projections": {
        "scenario": "Descripción del escenario actual",
        "goals": [
          { 
            "name": "Nombre de la meta (ej: Meta Intermedia: Cintura 88cm)", 
            "estimatedDate": "Fecha estimada", 
            "progress": 0-100,
            "probability": 0-100,
            "analysis": "Breve explicación de por qué este hito es clave y qué lo determina."
          }
        ],
        "overallProbability": 0-100
      },
      "metabolicAnalysis": "Análisis técnico de por qué los resultados se dan a este ritmo.",
      "score": 0-100
    }

    REGLAS ADICIONALES:
    - Incluye al menos 2 metas intermedias (ej: bajar 2cm de cintura, bajar 2kg) y las metas finales (12% grasa y marcar abs).
    - Para cada meta, calcula una probabilidad específica basada en la racha actual de pasos y nutrición.
    - El usuario prioriza marcar abdominales. Define hitos de cintura cada 2-3cm.

    REGLAS:
    - Sé crítico pero constructivo.
    - Si los datos son inconsistentes (ej: mucho déficit pero el peso no baja), menciónalo como un Punto Ciego (posible subestime de calorías).
    - TODO EN ESPAÑOL.
    - Retorna solo el JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating full report:", error);
    return null;
  }
};
