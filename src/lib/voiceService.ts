import { supabase } from './supabase';
import { parseFitnessEntry } from './gemini';

// Helper for date (centralized for Chile timezone)
const getLocalToday = () => {
    return new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
};


export const processVoiceLog = async (userId: string, text: string) => {
    try {
        // 1. Parse with Gemini
        const aiData = await parseFitnessEntry(text);
        if (!aiData) throw new Error("No pudimos procesar el mensaje.");

        const today = getLocalToday();

        // 2. Fetch existing for the merge logic
        const { data: existing } = await supabase
            .from('fitness_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        // 3. Merge logic (same as QuickLog)
        const currentWeight = aiData.weight ?? existing?.weight ?? 80;
        const totalSteps = aiData.steps_mode === 'set'
            ? (aiData.steps || 0)
            : (existing?.steps || 0) + (aiData.steps || 0);

        const getExistingExKcal = (notes: string | null) => {
            const match = (notes || '').match(/\[ExKcal:\s*(\d+)\]/);
            return match ? parseInt(match[1]) : 0;
        };
        const totalExKcal = aiData.training_mode === 'set'
            ? (aiData.burned_calories || 0)
            : getExistingExKcal(existing?.notes) + (aiData.burned_calories || 0);

        // Calculate metrics
        // (Simplified BMR/TDEE for the API, will be updated by Dashboard on next load)
        const finalTdee = existing?.tdee || 2500;

        const cleanNotes = (existing?.notes || '').replace(/\[ExKcal:\s*\d+\]/g, '').trim();
        const newNotes = `${cleanNotes}\n[Voz] ${text}\n[ExKcal: ${totalExKcal}]`.trim();

        const payload = {
            user_id: userId,
            date: today,
            weight: currentWeight,
            waist: aiData.waist ?? existing?.waist,
            body_fat: aiData.body_fat ?? existing?.body_fat,
            calories: aiData.nutrition_mode === 'set' ? (aiData.calories || 0) : (existing?.calories || 0) + (aiData.calories || 0),
            protein: aiData.nutrition_mode === 'set' ? (aiData.protein || 0) : (existing?.protein || 0) + (aiData.protein || 0),
            carbs: aiData.nutrition_mode === 'set' ? (aiData.carbs || 0) : (existing?.carbs || 0) + (aiData.carbs || 0),
            fat: aiData.nutrition_mode === 'set' ? (aiData.fat || 0) : (existing?.fat || 0) + (aiData.fat || 0),
            steps: totalSteps,
            sleep: aiData.sleep ?? existing?.sleep,
            training: aiData.training || existing?.training,
            tdee: finalTdee,
            notes: newNotes,
        };

        const { error: insertError } = await supabase
            .from('fitness_logs')
            .upsert(payload, { onConflict: 'user_id, date' });

        if (insertError) throw insertError;

        return { success: true, calories: aiData.calories, steps: aiData.steps, raw: aiData };
    } catch (error: any) {
        console.error("Voice Log Error:", error);
        return { success: false, error: error.message };
    }
};
