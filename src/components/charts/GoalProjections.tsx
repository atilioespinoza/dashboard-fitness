import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Counter from '../ui/Counter';
import { FitnessEntry } from '../../data/mockData';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Target, Calendar, TrendingDown } from 'lucide-react';

import { UserProfile } from '../../hooks/useProfile';

interface GoalProjectionsProps {
    data: FitnessEntry[];
    profile: UserProfile | null;
}

export function GoalProjections({ data, profile }: GoalProjectionsProps) {
    if (data.length < 2) return null;

    const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    const first = sortedData[0];
    const latest = sortedData[sortedData.length - 1];

    const daysDiff = differenceInDays(parseISO(latest.Date), parseISO(first.Date)) || 1;

    const waistEntries = sortedData.filter(d => d.Waist > 0);
    const initialWaist = waistEntries.length > 0 ? waistEntries[0].Waist : latest.Waist;

    // Goals from Profile
    const waistGoals = {
        inter: profile?.target_waist && initialWaist > profile.target_waist
            ? Math.round(initialWaist - ((initialWaist - profile.target_waist) / 2))
            : 91,
        final: profile?.target_waist || 83
    };
    const fatEntries = sortedData.filter(d => d.BodyFat > 0);
    const initialFat = fatEntries.length > 0 ? fatEntries[0].BodyFat : latest.BodyFat;

    const fatGoals = {
        inter: profile?.target_body_fat && initialFat > profile.target_body_fat
            ? Number((initialFat - ((initialFat - profile.target_body_fat) / 2)).toFixed(1))
            : 18,
        final: profile?.target_body_fat || 13
    };

    // Rates (Units per day) - Global Average
    const waistRate = (latest.Waist - first.Waist) / daysDiff;
    const fatRate = (latest.BodyFat - first.BodyFat) / daysDiff;

    const calculateDate = (current: number, target: number, rate: number) => {
        if (current <= target) return "Completado";
        if (rate >= 0) return "Tendencia estable/subiendo";

        const remaining = current - target;
        const daysToGoal = Math.ceil(remaining / Math.abs(rate));
        const estimatedDate = addDays(parseISO(latest.Date), daysToGoal);

        return format(estimatedDate, "d 'de' MMMM, yyyy", { locale: es });
    };

    const projections = [
        {
            label: "Cintura Intermedia",
            target: `${waistGoals.inter}cm`,
            date: calculateDate(latest.Waist, waistGoals.inter, waistRate),
            progress: latest.Waist <= waistGoals.inter,
            color: "text-blue-500"
        },
        {
            label: "Cintura Final",
            target: `${waistGoals.final}cm`,
            date: calculateDate(latest.Waist, waistGoals.final, waistRate),
            progress: latest.Waist <= waistGoals.final,
            color: "text-blue-600"
        },
        {
            label: "% Grasa Intermedio",
            target: `${fatGoals.inter}%`,
            date: calculateDate(latest.BodyFat, fatGoals.inter, fatRate),
            progress: latest.BodyFat <= fatGoals.inter,
            color: "text-emerald-500"
        },
        {
            label: "% Grasa Final",
            target: `${fatGoals.final}%`,
            date: calculateDate(latest.BodyFat, fatGoals.final, fatRate),
            progress: latest.BodyFat <= fatGoals.final,
            color: "text-emerald-600"
        }
    ];

    return (
        <Card className="col-span-12">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="text-blue-500" size={20} />
                    Proyecciones de Metas
                </CardTitle>
                <p className="text-xs text-slate-500 italic">Basado en el promedio histórico de los últimos <Counter value={daysDiff} /> días</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {projections.map((p, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.label}</span>
                                    <span className={`text-[10px] font-black ${p.color} bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-full shadow-sm`}>{p.target}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Calendar className="text-slate-400" size={14} />
                                    <span className={`text-sm font-semibold ${p.progress ? 'text-green-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {p.date}
                                    </span>
                                </div>
                            </div>
                            {!p.progress && p.date !== "Tendencia estable/subiendo" && (
                                <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrendingDown className="text-blue-500" size={12} />
                                    <span className="text-[10px] text-slate-500 font-medium">Manteniendo el ritmo actual</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
