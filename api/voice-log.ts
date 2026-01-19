// Last updated: 2026-01-16 19:16
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";


export default async function handler(req: any, res: any) {
    // 1. CORS & Setup
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { userId, text } = req.body;

        // 2. Check Environment Variables
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const geminiKey = process.env.VITE_GEMINI_API_KEY;

        if (!supabaseUrl || !supabaseKey || !geminiKey) {
            return res.status(200).json({
                success: false,
                error: "Faltan variables de entorno en Vercel."
            });
        }

        if (!userId || !text) {
            return res.status(200).json({ success: false, error: "Falta userId o texto." });
        }

        // 3. Initialize Clients
        const supabase = createClient(supabaseUrl, supabaseKey);
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });


        // 4. Gemini Parse with Mode detection
        const prompt = `
            Extrae datos de fitness de este texto: "${text}".
            Retorna SOLO JSON con este formato:
            {
              "weight": float|null,
              "waist": float|null,
              "body_fat": float|null,
              "calories": int|null,
              "protein": int|null,
              "carbs": int|null,
              "fat": int|null,
              "nutrition_mode": "add" | "set",
              "steps": int|null,
              "steps_mode": "add" | "set",
              "burned_calories": int|null,
              "training_mode": "add" | "set",
              "sleep": float|null,
              "training": string|null,
              "notes": string|null
            }

            REGLAS CRÍTICAS:
            - Si mencionan una actividad física (ej: "salto cuerda", "pesas", "correr"), ESTIMA DE FORMA REALISTA las calorías quemadas en 'burned_calories' si no las especifican.
            - Usa "add" SIEMPRE para comida, pasos o entrenamientos. El usuario prohíbe el modo "set" para estos campos para evitar borrar registros previos.
            - Los campos de biometría (weight, waist, body_fat) y sueño (sleep) son SIEMPRE absolutos.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const aiText = aiResponse.text();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No se pudo procesar el JSON de la IA.");
        const aiData = JSON.parse(jsonMatch[0]);

        // 5. Fetch Today's Log & Profile
        const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Santiago' }).format(new Date());

        const [logRes, profileRes] = await Promise.all([
            supabase.from('fitness_logs').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
            supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        ]);

        const existing = logRes.data;
        const profile = profileRes.data;

        // 6. Merge Logic (Handling ADD vs SET for all metrics)

        // Nutrition (Always additive)
        const finalCalories = (existing?.calories || 0) + (aiData.calories || 0);
        const finalProtein = (existing?.protein || 0) + (aiData.protein || 0);
        const finalCarbs = (existing?.carbs || 0) + (aiData.carbs || 0);
        const finalFat = (existing?.fat || 0) + (aiData.fat || 0);

        // Steps (Always additive)
        const finalSteps = (existing?.steps || 0) + (aiData.steps || 0);

        // Training (Burned Calories - Always additive)
        const getExistingExKcal = (n: string | null) => {
            const match = (n || '').match(/\[ExKcal:\s*(\d+)\]/);
            return match ? parseInt(match[1]) : 0;
        };
        const currentExKcal = getExistingExKcal(existing?.notes);
        const finalExKcal = currentExKcal + (aiData.burned_calories || 0);

        // 7. Calculate TDEE dynamically
        const currentWeight = aiData.weight ?? existing?.weight ?? 80;
        const caloriePerStep = currentWeight * 0.0005;
        const stepsBonus = finalSteps * caloriePerStep;

        const h = profile?.height || 170;
        const a = profile?.birth_date ? (new Date().getFullYear() - new Date(profile.birth_date).getFullYear()) : 35;
        const g = profile?.gender || 'Masculino';

        let bmrValue = (10 * currentWeight) + (6.25 * h) - (5 * a);
        bmrValue += g === 'Masculino' ? 5 : -161;

        const baseTdee = bmrValue * 1.1;
        const totalActive = (baseTdee - bmrValue) + stepsBonus + finalExKcal;
        const finalTdee = Math.round(bmrValue + totalActive);

        // Notes Update
        const cleanNotes = (existing?.notes || '').replace(/\[ExKcal:\s*\d+\]/g, '').trim();
        const newNotes = `${cleanNotes}\n[VOZ] ${text}\n[ExKcal: ${finalExKcal}]`.trim();

        const payload = {
            user_id: userId,
            date: today,
            weight: currentWeight,
            waist: aiData.waist ?? existing?.waist,
            body_fat: aiData.body_fat ?? existing?.body_fat,
            calories: finalCalories,
            protein: finalProtein,
            carbs: finalCarbs,
            fat: finalFat,
            steps: finalSteps,
            sleep: aiData.sleep ?? existing?.sleep,
            training: aiData.training || existing?.training,
            tdee: finalTdee,
            notes: newNotes,
        };

        const { error: dbError } = await supabase
            .from('fitness_logs')
            .upsert(payload, { onConflict: 'user_id, date' });

        if (dbError) throw dbError;

        // 8. Save individual event for history
        await supabase.from('log_events').insert({
            user_id: userId,
            date: today,
            raw_text: text,
            parsed_data: aiData,
            type: 'voice'
        });

        return res.status(200).json({
            success: true,
            message: "Datos procesados correctamente con actualización de TDEE",
            burned_calories: aiData.burned_calories,
            new_tdee: finalTdee,
            data: aiData
        });

    } catch (error: any) {
        return res.status(200).json({ success: false, error: error.message });
    }
}
