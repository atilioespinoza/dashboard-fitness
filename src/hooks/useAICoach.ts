import { useMemo, useState, useEffect } from 'react';
import { FitnessEntry } from '../data/mockData';
import { getGeminiInsights } from '../lib/gemini';

export interface Insight {
    type: 'positive' | 'warning' | 'info' | 'critical';
    title: string;
    message: string;
}

export const useAICoach = (data: FitnessEntry[]) => {
    const [geminiInsights, setGeminiInsights] = useState<Insight[] | null>(null);
    const [loading, setLoading] = useState(false);

    // 1. Heuristic fallback logic (The previous "smart" logic)
    const heuristicInsights = useMemo(() => {
        if (!data || data.length < 10) return [];
        const list: Insight[] = [];
        const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
        const last7Days = sortedData.slice(0, 7);
        const prev7Days = sortedData.slice(7, 14);

        // Core Metabolic Logic
        const weightNow = last7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
        const weightPrev = prev7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
        const actualLoss = weightPrev - weightNow;
        const waistNow = last7Days.reduce((acc, d) => acc + d.Waist, 0) / 7;
        const waistPrev = prev7Days.reduce((acc, d) => acc + d.Waist, 0) / 7;
        const waistDiff = waistPrev - waistNow;

        if (Math.abs(actualLoss) < 0.2 && waistDiff > 0.3) {
            list.push({
                type: 'positive',
                title: 'Recomposición Corporal',
                message: "Tu cintura baja pero tu peso es estable: Estás perdiendo grasa y ganando músculo simultáneamente."
            });
        }

        const proteinAvg = last7Days.reduce((acc, d) => acc + d.Protein, 0) / 7;
        if (proteinAvg >= 150) {
            list.push({
                type: 'positive',
                title: 'Blindaje Muscular',
                message: `Con ${Math.round(proteinAvg)}g de proteína, tu pérdida de peso es de alta calidad.`
            });
        }

        const sleepAvg = last7Days.reduce((acc, d) => acc + d.Sleep, 0) / 7;
        if (sleepAvg < 6.5) {
            list.push({
                type: 'warning',
                title: 'Deuda de Sueño',
                message: "Promedias menos de 6.5h de sueño. Esto eleva el cortisol y frena la quema de grasa."
            });
        }

        return list.slice(0, 4);
    }, [data]);

    // 2. Fetch Gemini Insights if API key is present
    useEffect(() => {
        const fetchGemini = async () => {
            if (import.meta.env.VITE_GEMINI_API_KEY && data.length >= 7) {
                setLoading(true);
                const insights = await getGeminiInsights(data);
                if (insights) {
                    setGeminiInsights(insights);
                }
                setLoading(false);
            }
        };
        fetchGemini();
    }, [data]);

    return {
        insights: geminiInsights || heuristicInsights,
        loading,
        isAI: !!geminiInsights
    };
};
