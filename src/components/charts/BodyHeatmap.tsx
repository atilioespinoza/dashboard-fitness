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

    const getHeatStyle = (score: number) => {
        if (score === 0) return { fill: 'currentColor', opacity: 0.1 };
        if (score < 0.3) return { fill: '#60a5fa', opacity: 0.4, filter: 'drop-shadow(0 0 2px #60a5fa)' };
        if (score < 0.6) return { fill: '#3b82f6', opacity: 0.7, filter: 'drop-shadow(0 0 5px #3b82f6)' };
        return { fill: '#2563eb', opacity: 1, filter: 'drop-shadow(0 0 8px #3b82f6)' };
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm h-full flex flex-col relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-1000" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Activity className="text-blue-500" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Anatomía de Entrenamiento</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Carga acumulada (14 días)</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-between gap-6 relative z-10">
                {/* Silhouette Container */}
                <div className="relative w-full max-w-[180px] aspect-[1/2] flex items-center justify-center">
                    <svg viewBox="0 0 100 220" className="w-full h-full text-slate-200 dark:text-slate-800">
                        <defs>
                            <radialGradient id="cardioGradient" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <g className="transition-all duration-700">
                            {/* Detailed Full Body Outline */}
                            <path
                                d="M50,5 C44,5 40,10 40,16 C40,22 44,27 50,27 C56,27 60,22 60,16 C60,10 56,5 50,5 M50,28 C46,28 42,30 38,32 C30,36 28,45 27,55 L22,90 C21,95 23,98 26,98 C28,98 30,96 31,92 L34,65 L36,60 L36,105 C36,110 35,140 33,165 C32,185 34,210 38,210 L50,210 L62,210 C66,210 68,185 67,165 C65,140 64,110 64,105 L64,60 L66,65 L69,92 C70,96 72,98 74,98 C77,98 79,95 78,90 L73,55 C72,45 70,36 62,32 C58,30 54,28 50,28"
                                fill="currentColor"
                                stroke="rgba(100,116,139,0.2)"
                                strokeWidth="0.5"
                            />

                            {/* Back */}
                            <path d="M42,34 Q50,32 58,34 L56,60 Q50,62 44,60 Z" style={getHeatStyle(intensityData.find(m => m.id === 'back')?.score || 0)} />

                            {/* Shoulders */}
                            <path d="M28,38 C27,45 29,52 35,48 C36,40 33,35 28,38" style={getHeatStyle(intensityData.find(m => m.id === 'shoulders')?.score || 0)} />
                            <path d="M72,38 C73,45 71,52 65,48 C64,40 67,35 72,38" style={getHeatStyle(intensityData.find(m => m.id === 'shoulders')?.score || 0)} />

                            {/* Chest */}
                            <path d="M38,40 L50,38 L62,40 L61,58 Q50,62 39,58 Z" style={getHeatStyle(intensityData.find(m => m.id === 'chest')?.score || 0)} />

                            {/* Arms */}
                            <path d="M25,58 L30,55 L34,100 L28,100 Z" style={getHeatStyle(intensityData.find(m => m.id === 'arms')?.score || 0)} />
                            <path d="M75,58 L70,55 L66,100 L72,100 Z" style={getHeatStyle(intensityData.find(m => m.id === 'arms')?.score || 0)} />

                            {/* Abs */}
                            <path d="M42,65 L58,65 L56,100 L44,100 Z" style={getHeatStyle(intensityData.find(m => m.id === 'abs')?.score || 0)} />

                            {/* Legs */}
                            <g style={getHeatStyle(intensityData.find(m => m.id === 'legs')?.score || 0)}>
                                <path d="M36,108 L48,108 L47,160 L34,160 Z" />
                                <path d="M64,108 L52,108 L53,160 L66,160 Z" />
                                <path d="M35,165 L46,165 L44,205 L37,205 Z" />
                                <path d="M65,165 L54,165 L56,205 L63,205 Z" />
                            </g>

                            {/* Cardio - Heart Glow */}
                            {intensityData.find(m => m.id === 'cardio')?.score! > 0 && (
                                <g className="animate-pulse">
                                    <circle cx="50" cy="50" r="8" fill="url(#cardioGradient)" />
                                    <circle cx="50" cy="50" r="2" fill="#ef4444" filter="url(#glow)" />
                                </g>
                            )}
                        </g>
                    </svg>
                </div>

                {/* Legend UI */}
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {intensityData.map((muscle) => (
                        <div key={muscle.id} className="group/item">
                            <div className="flex justify-between items-end mb-1 px-0.5">
                                <span className="text-[9px] uppercase font-bold tracking-[0.1em] text-slate-400 group-hover/item:text-blue-500 transition-colors">
                                    {muscle.label}
                                </span>
                                <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300">
                                    {Math.round(muscle.score * 100)}%
                                </span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${muscle.id === 'cardio' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                        }`}
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
