
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

        // 2. Check Environment Variables (The most common crash point)
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const geminiKey = process.env.VITE_GEMINI_API_KEY;

        if (!supabaseUrl || !supabaseKey || !geminiKey) {
            return res.status(200).json({
                success: false,
                error: "Faltan variables de entorno en Vercel. Asegúrate de tener VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (la secreta) y VITE_GEMINI_API_KEY."
            });
        }


        if (!userId || !text) {
            return res.status(200).json({ success: false, error: "Falta userId o texto en la solicitud." });
        }

        // 3. Initialize Clients
        const supabase = createClient(supabaseUrl, supabaseKey);
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" || "gemini-1.5-flash" });

        // 4. Gemini Parse
        const prompt = `Extrae datos de fitness de este texto: "${text}". Retorna SOLO JSON: {weight: float|null, calories: int|null, protein: int|null, steps: int|null, notes: string|null}`;
        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const aiText = aiResponse.text();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Gemini no pudo procesar el texto.");
        const aiData = JSON.parse(jsonMatch[0]);

        // 5. Fetch Today's Log (Chile Timezone)
        const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Santiago' }).format(new Date());

        const { data: existing } = await supabase
            .from('fitness_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        // 6. Merge & Upsert
        const payload = {
            user_id: userId,
            date: today,
            calories: (existing?.calories || 0) + (aiData.calories || 0),
            protein: (existing?.protein || 0) + (aiData.protein || 0),
            steps: (existing?.steps || 0) + (aiData.steps || 0),
            notes: `${existing?.notes || ''}\n[Voz] ${text}`.trim(),
            weight: aiData.weight ?? existing?.weight ?? 80,
            tdee: existing?.tdee || 2500
        };

        const { error: dbError } = await supabase
            .from('fitness_logs')
            .upsert(payload, { onConflict: 'user_id, date' });

        if (dbError) throw dbError;

        return res.status(200).json({
            success: true,
            message: "Datos guardados correctamente",
            data: aiData
        });

    } catch (error: any) {
        return res.status(200).json({ success: false, error: error.message });
    }
}
