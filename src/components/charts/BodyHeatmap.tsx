import { useMemo } from 'react';
import { FitnessEntry } from '../../data/mockData';
import { Activity } from 'lucide-react';

interface BodyHeatmapProps {
    data: FitnessEntry[];
}

const MUSCLE_GROUPS = [
    { id: 'chest', label: 'Pecho', keywords: ['pecho', 'pectoral', 'bench', 'press', 'banca', 'aperturas', 'lagartijas', 'flexiones', 'fondos', 'calistenia'] },
    { id: 'back', label: 'Espalda', keywords: ['espalda', 'dominadas', 'pull', 'remo', 'dorsal', 'jalón', 'calistenia'] },
    { id: 'legs', label: 'Piernas', keywords: ['pierna', 'cuadriceps', 'sentadilla', 'squat', 'leg', 'prensa', 'femoral', 'isquios', 'peso muerto', 'estocada', 'búlgara', 'bici', 'cuerda', 'calistenia'] },
    { id: 'shoulders', label: 'Hombros', keywords: ['hombro', 'deltoid', 'militar', 'press de hombro', 'laterales', 'frontal', 'fondos', 'calistenia'] },
    { id: 'arms', label: 'Brazos', keywords: ['brazo', 'biceps', 'triceps', 'curl', 'extension', 'martillo', 'dominadas', 'fondos', 'calistenia'] },
    { id: 'abs', label: 'Abdomen', keywords: ['abdomen', 'abs', 'core', 'plancha', 'crunch', 'abdominal', 'elevación', 'pierna', 'calistenia'] },
    { id: 'cardio', label: 'Cardio', keywords: ['bici', 'cuerda', 'cardio', 'correr', 'trote', 'hiit'] },
];

export const BodyHeatmap = ({ data }: BodyHeatmapProps) => {
    const intensityData = useMemo(() => {
        // Look at the last 14 days for intensity
        const last14Days = [...data]
            .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
            .slice(0, 14);

        const counts: Record<string, number> = {};
        MUSCLE_GROUPS.forEach(g => counts[g.id] = 0);

        last14Days.forEach(day => {
            if (!day.Training) return;
            const trainingLower = day.Training.toLowerCase();

            MUSCLE_GROUPS.forEach(group => {
                if (group.keywords.some(k => trainingLower.includes(k))) {
                    counts[group.id] += 1;
                }
            });
        });

        // Normalize scores (max 4 sessions in 14 days = 1.0 intensity)
        return MUSCLE_GROUPS.map(group => ({
            id: group.id,
            label: group.label,
            score: Math.min(counts[group.id] / 4, 1)
        }));
    }, [data]);

    const getHeatColor = (score: number) => {
        if (score === 0) return 'fill-slate-200 dark:fill-slate-800';
        if (score < 0.3) return 'fill-blue-400/40 dark:fill-blue-500/20';
        if (score < 0.6) return 'fill-blue-500';
        return 'fill-blue-600 dark:fill-blue-400';
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Activity className="text-blue-500" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Intensidad por Músculo</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Estimación basada en últimos 14 días</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-8">
                {/* Human Silhouette SVG */}
                <div className="relative w-48 h-80">
                    <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl">
                        {/* Static Body Outline */}
                        <path
                            d="M50,10 C45,10 42,15 42,20 C42,25 45,30 50,30 C55,30 58,25 58,20 C58,15 55,10 50,10 Z M50,32 C40,32 30,35 25,45 L20,70 L25,75 L30,60 L35,100 L30,150 L35,190 L50,190 L65,190 L70,150 L65,100 L70,60 L75,75 L80,70 L75,45 C70,35 60,32 50,32 Z"
                            className="fill-slate-100 dark:fill-slate-800/50 stroke-slate-200 dark:stroke-slate-700"
                            strokeWidth="1"
                        />

                        {/* Muscle Regions - Simplified Path Indicators */}

                        {/* Shoulders */}
                        <circle cx="32" cy="48" r="6" className={`${getHeatColor(intensityData.find(m => m.id === 'shoulders')?.score || 0)} transition-colors duration-700`} />
                        <circle cx="68" cy="48" r="6" className={`${getHeatColor(intensityData.find(m => m.id === 'shoulders')?.score || 0)} transition-colors duration-700`} />

                        {/* Chest */}
                        <path
                            d="M38,50 Q50,45 62,50 Q62,65 50,70 Q38,65 38,50"
                            className={`${getHeatColor(intensityData.find(m => m.id === 'chest')?.score || 0)} transition-colors duration-700`}
                        />

                        {/* Abs */}
                        <rect x="42" y="75" width="16" height="25" rx="4" className={`${getHeatColor(intensityData.find(m => m.id === 'abs')?.score || 0)} transition-colors duration-700`} />

                        {/* Arms (Biceps Area) */}
                        <path d="M24,55 L28,75 L33,75 L30,55 Z" className={`${getHeatColor(intensityData.find(m => m.id === 'arms')?.score || 0)} transition-colors duration-700`} />
                        <path d="M76,55 L72,75 L67,75 L70,55 Z" className={`${getHeatColor(intensityData.find(m => m.id === 'arms')?.score || 0)} transition-colors duration-700`} />

                        {/* Legs (Quads Area) */}
                        <path d="M34,105 L30,150 L46,150 L48,105 Z" className={`${getHeatColor(intensityData.find(m => m.id === 'legs')?.score || 0)} transition-colors duration-700`} />
                        <path d="M66,105 L70,150 L54,150 L52,105 Z" className={`${getHeatColor(intensityData.find(m => m.id === 'legs')?.score || 0)} transition-colors duration-700`} />

                        {/* Cardio Indicator (Pulse at center) */}
                        <circle cx="50" cy="62" r="4" className={`${getHeatColor(intensityData.find(m => m.id === 'cardio')?.score || 0)} transition-colors duration-700 animate-pulse`} />
                    </svg>
                </div>

                {/* Legend / Metrics */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full max-w-[280px]">
                    {intensityData.map((muscle) => (
                        <div key={muscle.id} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{muscle.label}</span>
                                <span className="text-[10px] font-mono text-blue-500">{Math.round(muscle.score * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${muscle.score * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
