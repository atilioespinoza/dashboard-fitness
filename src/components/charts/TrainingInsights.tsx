import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { Dumbbell, Info, HeartPulse, Footprints, Zap, ArrowUpCircle, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrainingInsightsProps {
    data: FitnessEntry[];
}

export function TrainingInsights({ data }: TrainingInsightsProps) {
    // Filter days with training info
    const trainingDays = data.filter(d => d.Training && d.Training.trim().length > 0);
    const last10Trainings = trainingDays.slice(-10).reverse();

    const getWorkoutIcon = (training: string) => {
        const text = training.toLowerCase();
        // Cardio / Metabolic
        if (text.includes('cuerda') || text.includes('salto') || text.includes('bici') || text.includes('bicicleta') ||
            text.includes('cardio') || text.includes('hiit') || text.includes('correr') || text.includes('run') || text.includes('natación')) {
            return <HeartPulse className="text-red-500" size={24} />;
        }
        // Bodyweight / Calisthenics
        if (text.includes('calistenia') || text.includes('funcional') || text.includes('bodyweight') || text.includes('push ups') || text.includes('pull ups')) {
            return <Zap className="text-yellow-500" size={24} />;
        }
        // Strength - Lower Body
        if (text.includes('pierna') || text.includes('legs') || text.includes('squat') || text.includes('prensa')) {
            return <Footprints className="text-orange-500" size={24} />;
        }
        // Strength - Upper Body (Push)
        if (text.includes('pecho') || text.includes('chest') || text.includes('push') || text.includes('hombro') || text.includes('militar')) {
            return <ArrowUpCircle className="text-blue-500" size={24} />;
        }
        // Strength - Upper Body (Pull)
        if (text.includes('espalda') || text.includes('back') || text.includes('pull') || text.includes('remo')) {
            return <Target className="text-emerald-500" size={24} />;
        }
        // Strength - Multi/General
        if (text.includes('fuerza') || text.includes('strength') || text.includes('pesas') || text.includes('mancuernas') || text.includes('barra')) {
            return <Dumbbell className="text-indigo-500" size={24} />;
        }
        // Default
        return <Dumbbell className="text-slate-600 opacity-50" size={24} />;
    };

    return (
        <Card className="col-span-12 lg:col-span-12 bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Dumbbell className="text-blue-500" size={24} />
                    Registro de Entrenamiento y Recuperación
                </CardTitle>
                <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {trainingDays.length} sesiones registradas
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {last10Trainings.map((day, idx) => (
                        <div key={idx} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-3 relative group overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors">
                                        {getWorkoutIcon(day.Training || "")}
                                    </div>
                                    <span className="text-xs font-mono text-blue-400">
                                        {format(parseISO(day.Date), 'dd MMM yyyy', { locale: es })}
                                    </span>
                                </div>
                                {day.Steps > 10000 && (
                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Alta Actividad</span>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-slate-100 truncate">
                                {day.Training}
                            </p>
                            <div className="flex items-center gap-4 pt-2 border-t border-slate-800 text-[11px]">
                                <div className="flex flex-col">
                                    <span className="text-slate-500 uppercase font-bold text-[9px]">Proteína</span>
                                    <span className={day.Protein >= 140 ? "text-green-400" : "text-yellow-400"}>
                                        {day.Protein}g {day.Protein >= 140 ? '✓' : '!'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-slate-500 uppercase font-bold text-[9px]">Sueño</span>
                                    <span className="text-slate-300">{day.Sleep} hrs</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-slate-500 uppercase font-bold text-[9px]">Calorías</span>
                                    <span className={day.Calories <= day.TDEE ? "text-green-400" : "text-red-400"}>
                                        {day.Calories - day.TDEE > 0 ? `+${day.Calories - day.TDEE}` : day.Calories - day.TDEE}
                                    </span>
                                </div>
                            </div>
                            {day.Notes && (
                                <div className="flex items-start gap-2 bg-slate-900/40 p-2 rounded text-[10px] text-slate-400 italic">
                                    <span className="mt-0.5 shrink-0 text-slate-500">
                                        <Info size={12} />
                                    </span>
                                    <span className="line-clamp-2">{day.Notes}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
