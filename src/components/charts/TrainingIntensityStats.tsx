import { useMemo } from 'react';
import { FitnessEntry } from '../../data/mockData';
import { Trophy, Flame, Target, Calendar } from 'lucide-react';
import { subDays, isAfter, startOfMonth } from 'date-fns';
import { parseLocalDate } from '../../lib/utils';

interface TrainingIntensityStatsProps {
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

export function TrainingIntensityStats({ data }: TrainingIntensityStatsProps) {
    const stats = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const last30Days = subDays(now, 30);
        const last7Days = subDays(now, 7);

        const monthWorkouts = data.filter(d => d.Training && isAfter(parseLocalDate(d.Date), monthStart)).length;
        const weekWorkouts = data.filter(d => d.Training && isAfter(parseLocalDate(d.Date), last7Days)).length;

        // Consistency: Days with training in last 30 days
        const trainingDays30 = data.filter(d => d.Training && isAfter(parseLocalDate(d.Date), last30Days)).length;
        const consistency = Math.round((trainingDays30 / 30) * 100);

        // Focus Area (Last 14 days)
        const last14Days = data.filter(d => d.Training && isAfter(parseLocalDate(d.Date), subDays(now, 14)));
        const groupCounts: Record<string, number> = {};
        MUSCLE_GROUPS.forEach(g => groupCounts[g.id] = 0);

        last14Days.forEach(day => {
            if (!day.Training) return;
            const trainingLower = day.Training.toLowerCase();
            MUSCLE_GROUPS.forEach(group => {
                if (group.keywords.some(k => trainingLower.includes(k))) {
                    groupCounts[group.id] += 1;
                }
            });
        });

        const focusEntry = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0];
        const focusGroup = focusEntry && focusEntry[1] > 0
            ? MUSCLE_GROUPS.find(g => g.id === focusEntry[0])?.label
            : "Ninguno";

        return {
            monthWorkouts,
            weekWorkouts,
            consistency,
            focusGroup
        };
    }, [data]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Este Mes"
                value={stats.monthWorkouts}
                unit="Sesiones"
                icon={<Calendar size={20} />}
                color="blue"
            />
            <StatCard
                label="Esta Semana"
                value={stats.weekWorkouts}
                unit="Sesiones"
                icon={<Flame size={20} />}
                color="orange"
            />
            <StatCard
                label="Consistencia"
                value={stats.consistency}
                unit="%"
                icon={<Trophy size={20} />}
                color="yellow"
            />
            <StatCard
                label="Enfoque Actual"
                value={stats.focusGroup || "---"}
                unit=""
                icon={<Target size={20} />}
                color="emerald"
            />
        </div>
    );
}

function StatCard({ label, value, unit, icon, color }: { label: string, value: string | number, unit: string, icon: React.ReactNode, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-500",
        orange: "bg-orange-500/10 text-orange-500",
        yellow: "bg-yellow-500/10 text-yellow-500",
        emerald: "bg-emerald-500/10 text-emerald-500",
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
            <div className={`p-2 w-fit rounded-xl ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white transition-transform group-hover:scale-110 origin-left duration-300">
                        {value}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
                </div>
            </div>
            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-20 ${colorClasses[color].split(' ')[0]}`} />
        </div>
    );
}
