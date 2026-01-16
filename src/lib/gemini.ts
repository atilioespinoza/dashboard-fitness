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
      "score": 0-100,
      "archetype": {
        "name": "Nombre creativo del arquetipo (ej: La Máquina de Consistencia)",
        "emoji": "💎",
        "description": "Explicación de por qué este perfil encaja con el usuario basado en sus patrones de 60 días.",
        "traits": ["Rasgo 1", "Rasgo 2"]
      },
      "goldenFormula": {
        "explanation": "Breve texto explicando que estos valores son tus 'puntos dulces' detectados en tus mejores semanas.",
        "steps": 0,
        "calories": 0,
        "protein": 0,
        "sleep": 0
      },
      "metabolicRedAlert": {
        "active": boolean,
        "level": "warning" | "critical" | "healthy",
        "title": "Título del estado",
        "explanation": "Análisis del flujo metabólico",
        "recommendation": "Sugerencia para mantener o mejorar"
      }
    }

    REGLAS ADICIONALES:
    - RED ALERT: Evalúa SIEMPRE el estado metabólico. Si no hay estancamiento, pon "active": false y "level": "healthy".
    - Si detectas que la cintura o peso no han bajado en los últimos 7-10 días a pesar de cumplimiento >85%, pon "active": true y "level": "critical" o "warning". 
    - RECOMENDACIÓN: Si el estado es "healthy", felicita al usuario y dale un tip para optimizar (ej: 'Sigue así, el flujo es constante').
    - GOLDEN FORMULA: Identifica los valores promedio de las semanas donde el usuario tuvo el mayor progreso en cintura y mejores notas de energía.
    - METAS: Incluye al menos 2 metas intermedias (ej: bajar 2cm de cintura, bajar 2kg) y las metas finales (12% grasa y marcar abs). 
    - ARQUETIPOS: Identifica si el usuario es 'La Máquina de Consistencia', 'El Guerrero de Fin de Semana', 'El Estratega de Recomposición', 'El Velocista Metabólico' o 'El Maestro de la Recuperación'.
    - El usuario prioriza MARCAR ABDOMINALES. Define hitos de cintura cada 2-3cm.
    - Calcula las fechas basándote en la tendencia real de los últimos 30-60 días.
    - Analiza la probabilidad específica para cada meta basada en la racha actual de pasos y nutrición.


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

export const parseFitnessEntry = async (textInput: string) => {
  if (!genAI) throw new Error("No Gemini API Key found");

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Eres un extractor de datos de fitness. Tu misión es convertir lenguaje natural en un objeto JSON estructurado.
    
    TEXTO DEL USUARIO: "${textInput}"
    
    ESTRUCTURA DE RETORNO (JSON):
    {
      "weight": float | null,
      "waist": float | null,
      "body_fat": float | null,
      "calories": int | null,
      "protein": int | null,
      "carbs": int | null,
      "fat": int | null,
      "steps": int | null,
      "steps_mode": "add" | "set",
      "burned_calories": int | null,
      "training_mode": "add" | "set",
      "sleep": float | null,
      "training": string | null,
      "notes": string | null
    }

    REGLAS:
    1. Si mencionan comida, estima las calorías y macros (proteína, carbos, grasas) basados en cantidades promedio si no se especifican.
    2. Si mencionan entrenamiento, descríbelo brevemente en 'training' y ESTIMA las calorías quemadas en 'burned_calories' basándote en el peso actual del usuario y tipo de ejercicio.
    3. Si mencionan peso, cintura o grasa, extráelos.
    4. Usa la unidad métrica (kg, cm).
    5. No inventes datos que no se mencionen o no se puedan estimar lógicamente.
    6. STEPS_MODE / TRAINING_MODE: 
       - Usa "set" si el usuario indica una CORRECCIÓN de un error previo o un total absoluto (ej: "no fueron 45 min de calistenia, fueron 30", "corrige mis pasos a 5000", "total de pasos hoy: 8000").
       - Usa "add" si indica una nueva actividad incremental (ej: "caminé 1000 pasos", "entrené 1 hora").
       - Por defecto usa "add".
    7. Retorna UNICAMENTE el JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing fitness entry:", error);
    return null;
  }
};

