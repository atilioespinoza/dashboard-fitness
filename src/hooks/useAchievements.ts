import { useMemo } from 'react';
import { FitnessEntry } from '../data/mockData';
import { Trophy, Flame, Footprints, Moon, Target, Dumbbell } from 'lucide-react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    isUnlocked: boolean;
    progress: number;
    goal: number;
}

export const useAchievements = (data: FitnessEntry[]) => {
    const achievements = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Sort data by date ascending for streak calculations
        const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        const latestEntries = [...sortedData].reverse();

        // 1. The Spartan (Calorie Streak)
        let calStreak = 0;
        for (const entry of latestEntries) {
            if (entry.Calories <= entry.TDEE) calStreak++;
            else break;
        }

        // 2. Protein King (Protein Streak)
        let protStreak = 0;
        for (const entry of latestEntries) {
            if (entry.Protein >= 140) protStreak++;
            else break;
        }

        // 3. Road Runner (Steps Streak)
        let stepsStreak = 0;
        for (const entry of latestEntries) {
            if (entry.Steps >= 12000) stepsStreak++;
            else break;
        }

        // 4. Night Owl / Deep Sleeper (Sleep Streak)
        let sleepStreak = 0;
        for (const entry of latestEntries) {
            if (entry.Sleep >= 7) sleepStreak++;
            else break;
        }

        // 5. New You (New Weight Low)
        const weights = data.map(d => d.Weight);
        const currentWeight = weights[weights.length - 1];
        const minWeight = Math.min(...weights);
        const isNewLow = currentWeight <= minWeight;

        // 6. Consistency Master (Training in the last 7 days)
        const last7Days = latestEntries.slice(0, 7);
        const trainingSessions = last7Days.filter(d => d.Training).length;

        const list: Achievement[] = [
            {
                id: 'spartan',
                title: 'El Espartano',
                description: '7 días seguidos bajo tu TDEE',
                icon: Flame,
                color: 'text-orange-500',
                isUnlocked: calStreak >= 7,
                progress: calStreak,
                goal: 7
            },
            {
                id: 'protein-king',
                title: 'Rey de la Proteína',
                description: '5 días con más de 140g de proteína',
                icon: Trophy,
                color: 'text-yellow-500',
                isUnlocked: protStreak >= 5,
                progress: protStreak,
                goal: 5
            },
            {
                id: 'road-runner',
                title: 'Correcaminos',
                description: '5 días superando los 12,000 pasos',
                icon: Footprints,
                color: 'text-blue-500',
                isUnlocked: stepsStreak >= 5,
                progress: stepsStreak,
                goal: 5
            },
            {
                id: 'deep-sleeper',
                title: 'Sueño de Calidad',
                description: '3 días durmiendo más de 7 horas',
                icon: Moon,
                color: 'text-indigo-500',
                isUnlocked: sleepStreak >= 3,
                progress: sleepStreak,
                goal: 3
            },
            {
                id: 'new-low',
                title: 'Nuevo Mínimo',
                description: 'Has alcanzado un nuevo peso mínimo',
                icon: Target,
                color: 'text-green-500',
                isUnlocked: isNewLow,
                progress: isNewLow ? 1 : 0,
                goal: 1
            },
            {
                id: 'warrior',
                title: 'Guerrero Constante',
                description: 'Al menos 3 entrenamientos esta semana',
                icon: Dumbbell,
                color: 'text-red-500',
                isUnlocked: trainingSessions >= 3,
                progress: trainingSessions,
                goal: 3
            }
        ];

        return list;
    }, [data]);

    return achievements;
};
