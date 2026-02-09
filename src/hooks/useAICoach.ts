import { useMemo, useState } from 'react';
import { FitnessEntry } from '../data/mockData';
import { getGeminiInsights } from '../lib/gemini';

export interface Insight {
    type: 'positive' | 'warning' | 'info' | 'critical';
    title: string;
    message: string;
    category: 'Nutrición' | 'Entrenamiento' | 'Recuperación' | 'Hábitos';
    priority: 'Alta' | 'Media' | 'Baja';
    action?: string;
}

export const useAICoach = (data: FitnessEntry[]) => {
    const [geminiInsights, setGeminiInsights] = useState<Insight[] | null>(() => {
        const cached = localStorage.getItem('gemini_insights_cache');
        return cached ? JSON.parse(cached) : null;
    });
    const [loading, setLoading] = useState(false);

    // 1. Heuristic fallback logic
    const heuristicInsights = useMemo(() => {
        if (!data || data.length < 10) return [];
        const list: Insight[] = [];
        const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
        const last7Days = sortedData.slice(0, 7);

        const getWeekAvg = (entries: FitnessEntry[], weeksAgo: number, key: 'Weight' | 'Waist') => {
            const start = weeksAgo * 7;
            const end = start + 7;
            const slice = entries.slice(start, end);
            if (slice.length === 0) return null;
            return slice.reduce((acc, d) => acc + d[key], 0) / slice.length;
        };

        const w0 = getWeekAvg(sortedData, 0, 'Weight');
        const w1 = getWeekAvg(sortedData, 1, 'Weight');
        const w2 = getWeekAvg(sortedData, 2, 'Weight');
        const wa0 = getWeekAvg(sortedData, 0, 'Waist');
        const wa1 = getWeekAvg(sortedData, 1, 'Waist');

        if (w0 !== null && w1 !== null) {
            const weightDiff = Math.abs(w0 - w1);
            const waistDiff = (wa1 || 0) - (wa0 || 0);

            if (weightDiff < 0.2 && waistDiff > 0.3) {
                list.push({
                    type: 'positive',
                    title: 'Recomposición Corporal',
                    message: "¡Excelente! Tu peso se mantiene estable pero tu cintura está bajando. Estás ganando músculo mientras pierdes grasa.",
                    category: 'Entrenamiento',
                    priority: 'Alta',
                    action: 'Sigue con la intensidad actual, el proceso es óptimo.'
                });
            } else if (weightDiff < 0.2 && w2 !== null && Math.abs(w1 - (w2 || 0)) < 0.2) {
                list.push({
                    type: 'warning',
                    title: 'Meseta de Progreso',
                    message: "Tu peso promedio apenas ha variado en las últimas 2-3 semanas. Podrías estar en una fase de mantenimiento metabólico.",
                    category: 'Nutrición',
                    priority: 'Media',
                    action: 'Revisa tu actividad diaria o reduce ligeramente las calorías.'
                });
            }
        }

        // New Insight for consistency/missing data
        const entriesWithData = data.filter(d => d.Weight > 0).length;
        const totalDaysRange = data.length > 0
            ? Math.floor((new Date().getTime() - new Date(data[0].Date).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        if (totalDaysRange > 7 && entriesWithData / totalDaysRange < 0.7) {
            list.push({
                type: 'info',
                title: 'Consistencia de Datos',
                message: "No te preocupes si faltan algunos días de pesaje. La línea de 'Tendencia' en el gráfico de peso se ajusta automáticamente para mostrar tu progreso real ignorando las fluctuaciones diarias.",
                category: 'Hábitos',
                priority: 'Baja',
                action: 'Navega por las tendencias promedio de 7 días para ver el progreso real.'
            });
        }

        const proteinAvg = last7Days.reduce((acc, d) => acc + d.Protein, 0) / 7;
        if (proteinAvg >= 150) {
            list.push({
                type: 'positive',
                title: 'Blindaje Muscular',
                message: `Con ${Math.round(proteinAvg)}g de proteína, tu pérdida de peso es de alta calidad.`,
                category: 'Nutrición',
                priority: 'Media',
                action: 'Sigue priorizando las fuentes de proteína magra.'
            });
        }

        const sleepAvg = last7Days.reduce((acc, d) => acc + d.Sleep, 0) / 7;
        if (sleepAvg < 6.5) {
            list.push({
                type: 'warning',
                title: 'Deuda de Sueño',
                message: "Promedias menos de 6.5h de sueño. Esto eleva el cortisol y frena la quema de grasa.",
                category: 'Recuperación',
                priority: 'Alta',
                action: 'Intenta acostarte 30 min antes hoy.'
            });
        }

        return list.slice(0, 4);
    }, [data]);

    const refreshAI = async () => {
        if (import.meta.env.VITE_GEMINI_API_KEY && data.length >= 7) {
            setLoading(true);
            try {
                const insights = await getGeminiInsights(data);
                if (insights) {
                    setGeminiInsights(insights);
                    localStorage.setItem('gemini_insights_cache', JSON.stringify(insights));
                }
            } catch (error) {
                console.error("AI Refresh Error:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        insights: geminiInsights || heuristicInsights,
        loading,
        isAI: !!geminiInsights,
        refreshAI
    };
};
