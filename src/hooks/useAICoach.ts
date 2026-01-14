import { useMemo } from 'react';
import { FitnessEntry } from '../data/mockData';

export interface Insight {
    type: 'positive' | 'warning' | 'info' | 'critical';
    title: string;
    message: string;
}

export const useAICoach = (data: FitnessEntry[]) => {
    const insights = useMemo(() => {
        if (!data || data.length < 10) return [];

        const list: Insight[] = [];
        const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

        // Window segments
        const last7Days = sortedData.slice(0, 7);
        const prev7Days = sortedData.slice(7, 14);

        // --- 1. METABOLIC EFFICIENCY (The "Grand Truth") ---
        // Compare theoretical vs actual loss
        const avgDeficit = last7Days.reduce((acc, d) => acc + (d.TDEE - d.Calories), 0) / 7;
        const totalDeficit7 = avgDeficit * 7;
        const theoreticalLoss = totalDeficit7 / 7700; // 7700kcal ~ 1kg fat

        const weightNow = last7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
        const weightPrev = prev7Days.reduce((acc, d) => acc + d.Weight, 0) / 7;
        const actualLoss = weightPrev - weightNow;

        if (actualLoss > 0.1) {
            const efficiency = actualLoss / theoreticalLoss;
            if (efficiency > 1.2) {
                list.push({
                    type: 'positive',
                    title: 'Metabolismo Acelerado',
                    message: `Estás perdiendo peso un ${(efficiency * 100 - 100).toFixed(0)}% más rápido de lo previsto teóricamente. Tu NEAT (actividad no deportiva) debe estar por las nubes.`
                });
            } else if (efficiency < 0.5) {
                list.push({
                    type: 'warning',
                    title: 'Resistencia Metabólica',
                    message: "Estás perdiendo menos de lo que dicta tu déficit calórico. Considera revisar la precisión del pesaje de alimentos o el estrés inflamatorio."
                });
            }
        }

        // --- 2. RECOMPOSITION DETECTION (Waist vs Weight) ---
        const waistNow = last7Days.reduce((acc, d) => acc + d.Waist, 0) / 7;
        const waistPrev = prev7Days.reduce((acc, d) => acc + d.Waist, 0) / 7;
        const waistDiff = waistPrev - waistNow;

        if (Math.abs(actualLoss) < 0.2 && waistDiff > 0.3) {
            list.push({
                type: 'positive',
                title: 'Recomposición Corporal',
                message: "¡Excelente noticia! Tu peso apenas se movió, pero tu cintura bajó significativamente. Estás ganando músculo mientras pierdes grasa."
            });
        }

        // --- 3. RECOVERY & TRAINING BALANCE ---
        const trainingDays = last7Days.filter(d => d.Training).length;
        const sleepAvg = last7Days.reduce((acc, d) => acc + d.Sleep, 0) / 7;
        const proteinAvg = last7Days.reduce((acc, d) => acc + d.Protein, 0) / 7;

        if (trainingDays >= 5 && sleepAvg < 6.5) {
            list.push({
                type: 'critical',
                dangerouslySetInnerHTML: true,
                title: 'Riesgo de Sobreentrenamiento',
                message: `Entrenaste ${trainingDays} veces pero dormiste solo ${sleepAvg.toFixed(1)}h. Tu cuerpo no está reparando el tejido. ¡Mañana descansa obligatoriamente!`
            } as any);
        }

        // --- 4. PLATEAU PREDICTION ---
        const last3Entries = last7Days.slice(0, 3);
        const isStable = last3Entries.every(d => Math.abs(d.Weight - weightNow) < 0.2);
        if (isStable && avgDeficit > 400) {
            list.push({
                type: 'info',
                title: 'Predicción de Estancamiento',
                message: "Llevas 3 días con peso idéntico. Es normal debido a la retención de glucógeno. No bajes más las calorías, el peso caerá de golpe pronto (Whoosh Effect)."
            });
        }

        // --- 5. CALISTHENICS SPECIFIC HINT ---
        const hasCalisthenics = last7Days.some(d => d.Training?.toLowerCase().includes('calistenia'));
        if (hasCalisthenics && proteinAvg < 150) {
            list.push({
                type: 'info',
                title: 'Tip para Calistenia',
                message: "Para tus dominadas y fondos, la fuerza relativa es clave. Mantener la proteína alta (1.8g/kg) es vital ahora que estás en déficit."
            });
        }

        // --- 6. ADHERENCE SCORE ---
        const consistency = last7Days.filter(d => d.Calories < d.TDEE).length;
        if (consistency === 7) {
            list.push({
                type: 'positive',
                title: 'Adherencia Perfecta',
                message: "7 de 7 días cumpliendo el déficit. Con esta disciplina, alcanzarás tu meta el " + sortedData[0].Date + " (estimado)."
            });
        }

        return list;
    }, [data]);

    return insights;
};
