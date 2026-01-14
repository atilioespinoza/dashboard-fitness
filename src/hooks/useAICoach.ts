import { useMemo } from 'react';
import { FitnessEntry } from '../data/mockData';

export interface Insight {
    type: 'positive' | 'warning' | 'info';
    title: string;
    message: string;
}

export const useAICoach = (data: FitnessEntry[]) => {
    const insights = useMemo(() => {
        if (!data || data.length < 7) return [];

        const list: Insight[] = [];
        const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
        const last7Days = sortedData.slice(0, 7);
        const previous7Days = sortedData.slice(7, 14);

        // 1. Weight Trend Insight
        if (last7Days.length === 7 && previous7Days.length === 7) {
            const avgWeightNow = last7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
            const avgWeightPrev = previous7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
            const diff = avgWeightNow - avgWeightPrev;

            if (diff <= -0.2) {
                list.push({
                    type: 'positive',
                    title: 'Ritmo de Pérdida Óptimo',
                    message: `Tu peso promedio ha bajado ${Math.abs(diff).toFixed(2)}kg esta semana. Estás en la zona ideal para preservar masa muscular.`
                });
            } else if (diff > 0.1) {
                list.push({
                    type: 'warning',
                    title: 'Ligero Repunte en Peso',
                    message: "El peso promedio subió un poco. Revisa si hubo mayor consumo de sodio o si el estrés/descanso están afectando la retención de líquidos."
                });
            }
        }

        // 2. Sleep & Weight Correlation
        const sleepAvg = last7Days.reduce((acc, d) => acc + d.Sleep, 0) / 7;
        if (sleepAvg < 6.5) {
            list.push({
                type: 'warning',
                title: 'Prioriza tu Descanso',
                message: `Tu promedio de sueño esta semana es de ${sleepAvg.toFixed(1)}h. La falta de sueño eleva el cortisol, lo que puede dificultar la pérdida de grasa.`
            });
        } else if (sleepAvg > 7.5) {
            list.push({
                type: 'positive',
                title: 'Recuperación de Campeón',
                message: "Estás durmiendo lo suficiente. Esto optimiza tu entorno hormonal para la quema de grasa y recuperación muscular."
            });
        }

        // 3. Protein Consistency
        const proteinAvg = last7Days.reduce((acc, d) => acc + d.Protein, 0) / 7;
        if (proteinAvg < 140) {
            list.push({
                type: 'info',
                title: 'Ajuste de Proteína',
                message: `Estás promediando ${Math.round(proteinAvg)}g de proteína. Intentar llegar a 150g protegerá mejor tu músculo durante el déficit.`
            });
        } else {
            list.push({
                type: 'positive',
                title: 'Nutrición Sólida',
                message: "Tu ingesta de proteína es excelente. Esto es clave para mantener tu metabolismo activo."
            });
        }

        // 4. Activity/Steps
        const stepsAvg = last7Days.reduce((acc, d) => acc + d.Steps, 0) / 7;
        if (stepsAvg > 12000) {
            list.push({
                type: 'positive',
                title: 'Gasto Energético Alto',
                message: `¡Increíble actividad! Con ${Math.round(stepsAvg)} pasos diarios, estás creando un déficit muy saludable sin pasar hambre.`
            });
        }

        return list;
    }, [data]);

    return insights;
};
