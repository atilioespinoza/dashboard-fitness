import { useMemo } from 'react';
import { FitnessEntry } from '../data/mockData';

export interface Insight {
    type: 'positive' | 'warning' | 'info' | 'critical';
    title: string;
    message: string;
}

export const useAICoach = (data: FitnessEntry[]) => {
    const insights = useMemo(() => {
        if (!data || data.length < 14) return [];

        const list: Insight[] = [];
        const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

        // Window segments
        const last7Days = sortedData.slice(0, 7);
        const prev7Days = sortedData.slice(7, 14);
        const last14Days = sortedData.slice(0, 14);

        // --- Helper: Standard Deviation ---
        const getStdDev = (arr: number[]) => {
            const mean = arr.reduce((acc, v) => acc + v, 0) / arr.length;
            return Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / arr.length);
        };

        // --- 1. METABOLIC EFFICIENCY & ADAPTATION ---
        const avgDeficit7 = last7Days.reduce((acc, d) => acc + (d.TDEE - d.Calories), 0) / 7;
        const avgDeficitPrev = prev7Days.reduce((acc, d) => acc + (d.TDEE - d.Calories), 0) / 7;

        const weightNow = last7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
        const weightPrev = prev7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
        const actualLoss = weightPrev - weightNow;
        const theoreticalLoss = (avgDeficit7 * 7) / 7700;

        // Detection of metabolic adaptation
        if (avgDeficit7 > 500 && actualLoss < 0.1 && avgDeficitPrev > 500) {
            list.push({
                type: 'critical',
                title: 'Alerta de Adaptación Metabólica',
                message: "Llevas 2 semanas en déficit alto pero el peso no baja. Tu metabolismo se ha ralentizado (Termogénesis Adaptativa). ¡Sugerencia: Haz 2 días de 'Refeed' subiendo carbohidratos a tus calorías de mantenimiento!"
            });
        }

        // --- 2. WEIGHT VOLATILITY ANALYSIS (Real vs Water) ---
        const weightVolatility = getStdDev(last7Days.map(d => d.Weight));
        if (weightVolatility > 0.6) {
            list.push({
                type: 'info',
                title: 'Alta Volatilidad detected',
                message: `Tu peso oscila mucho (${weightVolatility.toFixed(2)}kg de desviación). Esto indica que los cambios en la báscula son mayormente agua, sodio o inflamación, no grasa real. No te estreses por los números diarios.`
            });
        }

        // --- 3. CARB-WEIGHT CORRELATION ---
        // Look for days where Carbs > Avg + 20% and check if next day weight spiked
        const avgCarbs = last14Days.reduce((acc, d) => acc + d.Carbs, 0) / 14;
        const spikes = last7Days.filter((d, i) => {
            if (i === 0) return false; // Need next day (which is i-1 in our reverse sorted)
            return d.Carbs > avgCarbs * 1.2 && sortedData[i - 1]?.Weight > d.Weight + 0.3;
        });

        if (spikes.length >= 2) {
            list.push({
                type: 'warning',
                title: 'Sensibilidad a Carbohidratos',
                message: "He detectado que tus días de carga de carbohidratos elevan tu peso por retención de glucógeno. Es temporal y normal, pero tenlo en cuenta para no frustrarte los lunes."
            });
        }

        // --- 4. RECOMPOSITION & WAIST TREND ---
        const waistNow = last7Days.reduce((acc, d) => acc + d.Waist, 0) / 7;
        const waistPrev = prev7Days.reduce((acc, d) => acc + d.Waist, 0) / 7;
        const waistDiff = waistPrev - waistNow;

        if (Math.abs(actualLoss) < 0.2 && waistDiff > 0.3) {
            list.push({
                type: 'positive',
                title: 'Recomposición Corporal',
                message: "Tu cintura baja pero tu peso es estable: Estás perdiendo grasa y ganando músculo simultáneamente. ¡Sigue así, es el escenario ideal!"
            });
        }

        // --- 5. NEAT DECAY DETECTION (Steps) ---
        const stepsNow = last7Days.reduce((acc, d) => acc + d.Steps, 0) / 7;
        const stepsPrev = prev7Days.reduce((acc, d) => acc + d.Steps, 0) / 7;
        if (stepsNow < stepsPrev * 0.8) {
            list.push({
                type: 'warning',
                title: 'Caída de NEAT detectada',
                message: `Tus pasos han bajado un ${(100 - (stepsNow / stepsPrev) * 100).toFixed(0)}% respecto a la semana pasada. Tu cuerpo está intentando ahorrar energía por el déficit. ¡No dejes de moverte!`
            });
        }

        // --- 6. SUBJECTIVE FEELING ANALYSIS (Notes) ---
        const notesText = last7Days.map(d => d.Notes.toLowerCase()).join(' ');
        const fatigueKeywords = ['cansado', 'fatiga', 'sueño', 'agotado', 'débil', 'hambre'];
        const fatigueMatches = fatigueKeywords.filter(k => notesText.includes(k));

        if (fatigueMatches.length >= 2) {
            list.push({
                type: 'warning',
                title: 'Signos de Fatiga Acumulada',
                message: `En tus notas mencionas: "${fatigueMatches.join(', ')}". El déficit está empezando a pasar factura. Baja la intensidad del entrenamiento un 20% esta semana (Deload).`
            });
        }

        // --- 7. STREAK & ADHERENCE PREDICTION ---
        const proteinAvg = last7Days.reduce((acc, d) => acc + d.Protein, 0) / 7;
        if (proteinAvg >= 150) {
            list.push({
                type: 'positive',
                title: 'Blindaje Muscular',
                message: `Promediar ${Math.round(proteinAvg)}g de proteína garantiza que la pérdida de peso sea casi 100% tejido adiposo. Nivel de protección: Alto.`
            });
        }

        // Limit to 4 most relevant insights to keep UI clean
        return list.slice(0, 4);
    }, [data]);

    return insights;
};
