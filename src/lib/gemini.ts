import { GoogleGenerativeAI } from "@google/generative-ai";
import { FitnessEntry } from "../data/mockData";

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const API_KEY = getEnv('VITE_GEMINI_API_KEY');
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;


export const getGeminiInsights = async (data: FitnessEntry[]) => {
  if (!genAI) {
    throw new Error("No Gemini API Key found");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // Ensure data is sorted by date descending (newest first)
  const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  const prompt = `
    Eres PRIME 12 Coach, un experto en biohacking, entrenamiento de fuerza y recomposición corporal. 
    Tu misión es llevar al usuario a su "Estado Prime" (12% de grasa corporal y máximo rendimiento).
    Analiza los siguientes datos de los últimos 30 días y proporciona exactamente 4 insights clave.
    
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

    DATOS DEL USUARIO (MÁS RECIENTES PRIMERO):
    ${JSON.stringify(sortedData.slice(0, 30))}

    INSTRUCCIONES CLAVE:
    1. ANALIZA ENTRENAMIENTO: Revisa el campo "Training". Busca nombres de ejercicios, repeticiones y pesos. Si detectas que un ejercicio se repite con el mismo peso/reps por 3 sesiones, advierte sobre estancamiento. Si ves una mejora en volumen (sets * reps), celébralo como "Sobrecarga Progresiva".
    2. ENTRENAMIENTOS CORPORALES: Si el usuario hace Dominadas o Flexiones con peso corporal (0kg), fíjate en el aumento de repeticiones totales como medida de progreso.
    3. RECOMPOSICIÓN: Si el peso medio es estable pero la cintura baja (>0.3cm/semana), es recomposición. Atribúyelo a la calidad del entrenamiento.
    4. ACCIÓN CONCRETA: El campo "action" debe ser una "misión" accionable enfocada en entrenamiento si es posible (ej: "Añade 1 serie más a tus dominadas", "Intenta subir 2.5kg en tu press de banca").
    5. PRIORIZA: Usa "Alta" para estancamientos reales de fuerza (> 2 semanas sin mejora) o falta de proteína/sueño.
    6. IDIOMA: Responde totalmente en ESPAÑOL.
    7. FORMATO: No incluyes markdown adicional, solo el JSON puro.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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

  // Ensure data is sorted by date descending (newest first)
  const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  const prompt = `
    Eres PRIME 12 Executive Coach, experto en fisiología del ejercicio y High Performance. 
    Analiza este dataset completo (últimos 30-60 días) y genera un REPORTE DE ESTADO PRIME DE ALTO NIVEL.
    
    DATOS DEL USUARIO (MÁS RECIENTES PRIMERO):
    ${JSON.stringify(sortedData.slice(0, 60))}

    TU REPORTE DEBE TENER ESTA ESTRUCTURA (JSON):
    {
      "executiveSummary": "Un párrafo potente analizando la evolución metabólica y de FUERZA real.",
      "blindSpots": ["Punto ciego 1 (ej: falta de frecuencia en pierna)", "Punto ciego 2"],
      "projections": {
        "scenario": "Descripción del escenario actual",
        "goals": [
          { 
            "name": "Nombre de la meta (ej: Meta de Fuerza: Dominadas +5 reps)", 
            "estimatedDate": "Fecha estimada", 
            "progress": 0-100,
            "probability": 0-100,
            "analysis": "Análisis de por qué llegará a esta meta de rendimiento."
          }
        ],
        "overallProbability": 0-100
      },
      "metabolicAnalysis": "Análisis técnico de la relación entre nutrición, pasos y rendimiento en el gym.",
      "score": 0-100,
      "archetype": {
        "name": "Nombre creativo",
        "emoji": "🔥",
        "description": "Basado en su estilo de entrenamiento (ej: El Calisténico Metódico)",
        "traits": ["Rasgo 1", "Rasgo 2"]
      },
      "goldenFormula": {
        "explanation": "Combinación perfecta de variables para su mejor progreso detectado.",
        "steps": 0,
        "calories": 0,
        "protein": 0,
        "sleep": 0
      },
      "metabolicRedAlert": {
        "active": boolean,
        "level": "warning" | "critical" | "healthy",
        "title": "Estatus de Rendimiento/Metabolismo",
        "explanation": "Detalla si hay sobreentrenamiento o estancamiento de fuerza.",
        "recommendation": "Sugerencia técnica de entrenamiento (ej: Deload week, aumento de RPE)"
      }
    }

    REGLAS DE ANÁLISIS DE ENTRENAMIENTO:
    - Cruza los datos: Si el peso no baja pero el volumen de entrenamiento sube, es una victoria de recomposición.
    - Identifica los ejercicios principales en el texto de "Training" y evalúa si hay "Sobrecarga Progresiva".
    - Si detectas que entrena poco (menos de 3 veces/semana), el Red Alert debe activarse por "Bajo Estímulo".
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
      "nutrition_mode": "add" | "set",
      "steps": int | null,
      "steps_mode": "add" | "set",
      "burned_calories": int | null,
      "training_mode": "add" | "set",
      "sleep": float | null,
      "training": string | null,
      "notes": string | null
    }

    REGLAS:
    1. Si mencionan comida, estima las calorías y macros basados en cantidades promedio si no se especifican.
    2. Si mencionan entrenamiento, descríbelo brevemente en 'training' y ESTIMA las calorías quemadas en 'burned_calories'.
    3. Si mencionan peso, cintura o grasa, extráelos.
    4. Usa la unidad métrica (kg, cm).
    5. MODOS (nutrition_mode / steps_mode / training_mode): 
       - Usa SIEMPRE "add". NUNCA uses "set" para comida, pasos o entrenamientos. El usuario quiere que estos registros sean siempre incrementales.
       - Los campos de biometría (weight, waist, body_fat) y sueño (sleep) son SIEMPRE absolutos ("set" implícito).
    6. Retorna UNICAMENTE el JSON.
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

