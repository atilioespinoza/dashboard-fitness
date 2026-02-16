import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { EXERCISE_DATABASE } from '../../data/exerciseDB';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

interface TrainingProgressWidgetProps {
    userId: string;
}

interface ExerciseDataPoint {
    date: string;
    maxWeight: number;
    totalVolume: number;
    estimated1RM: number;
    totalReps: number;
}

export function TrainingProgressWidget({ userId }: TrainingProgressWidgetProps) {
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [historyData, setHistoryData] = useState<ExerciseDataPoint[]>([]);
    const [availableExercises, setAvailableExercises] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<'maxWeight' | 'estimated1RM' | 'totalVolume'>('estimated1RM');

    // Load available exercises from history
    useEffect(() => {
        const fetchExercises = async () => {
            if (!userId) return;
            const { data } = await supabase
                .from('log_events')
                .select('parsed_data')
                .not('parsed_data->session_details', 'is', null);

            if (data) {
                const exercises = new Set<string>();
                data.forEach((row: any) => {
                    const details = row.parsed_data.session_details;
                    if (details && details.exercises) {
                        details.exercises.forEach((ex: any) => {
                            const dbExercise = EXERCISE_DATABASE.find(e => e.name === ex.name);
                            if (dbExercise) {
                                exercises.add(dbExercise.id);
                            }
                        });
                    }
                });
                setAvailableExercises(exercises);
                if (exercises.size > 0 && !selectedExerciseId) {
                    setSelectedExerciseId(Array.from(exercises)[0]);
                }
            }
            setLoading(false);
        };

        fetchExercises();
    }, [userId]);

    // Load data for selected exercise
    useEffect(() => {
        if (!selectedExerciseId || !userId) return;

        const loadExerciseData = async () => {
            const { data } = await supabase
                .from('log_events')
                .select('*')
                .order('date', { ascending: true });

            if (!data) return;

            const selectedExerciseName = EXERCISE_DATABASE.find(e => e.id === selectedExerciseId)?.name;
            if (!selectedExerciseName) return;

            const points: ExerciseDataPoint[] = [];

            data.forEach((row: any) => {
                const details = row.parsed_data?.session_details;
                if (!details || !details.exercises) return;

                const exLog = details.exercises.find((e: any) => e.name === selectedExerciseName && !e.isSkipped);
                if (!exLog) return;

                let maxWeight = 0;
                let totalVolume = 0;
                let max1RM = 0;
                let totalReps = 0;

                const setsCount = exLog.actualReps ? exLog.actualReps.length : exLog.plannedSets;

                for (let i = 0; i < setsCount; i++) {
                    const reps = exLog.actualReps ? exLog.actualReps[i] : (exLog.plannedReps ? (Array.isArray(exLog.plannedReps) ? exLog.plannedReps[i] : exLog.plannedReps) : 0);
                    const weight = exLog.weight || 0;

                    if (weight > maxWeight) maxWeight = weight;
                    totalVolume += reps * weight;
                    totalReps += reps;

                    if (weight > 0 && reps > 0) {
                        const oneRM = weight * (1 + reps / 30);
                        if (oneRM > max1RM) max1RM = oneRM;
                    }
                }

                if (totalReps > 0) {
                    points.push({
                        date: row.date,
                        maxWeight,
                        totalVolume,
                        estimated1RM: Math.round(max1RM),
                        totalReps
                    });
                }
            });

            setHistoryData(points);
        };

        loadExerciseData();
    }, [selectedExerciseId, userId]);

    const getMetricColor = () => {
        switch (metric) {
            case 'estimated1RM': return '#10b981'; // emerald-500
            case 'maxWeight': return '#3b82f6'; // blue-500
            case 'totalVolume': return '#f59e0b'; // amber-500
        }
    };

    if (loading) return (
        <div className="h-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-full group relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Progresión de Fuerza</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Evolución por ejercicio</p>
                    </div>
                </div>

                <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                    {availableExercises.size === 0 ? (
                        <option>Sin datos</option>
                    ) : (
                        Array.from(availableExercises).map(id => {
                            const ex = EXERCISE_DATABASE.find(e => e.id === id);
                            return <option key={id} value={id}>{ex?.name || id}</option>;
                        })
                    )}
                </select>
            </div>

            {selectedExerciseId && historyData.length > 0 ? (
                <div className="flex-1 flex flex-col gap-6 relative z-10">
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-fit">
                        {(['estimated1RM', 'maxWeight', 'totalVolume'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMetric(m)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${metric === m
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                {m === 'estimated1RM' ? '1RM' : m === 'maxWeight' ? 'Máx' : 'Vol'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Récord</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white italic">
                                {Math.max(...historyData.map(d => d[metric]))}
                                <span className="text-xs font-bold text-slate-400 ml-1 not-italic">kg</span>
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Última</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white italic">
                                {historyData[historyData.length - 1]?.[metric] || 0}
                                <span className="text-xs font-bold text-slate-400 ml-1 not-italic">kg</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[220px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id="colorMetricDash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={25}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: '#1e293b' }}
                                    labelStyle={{ fontWeight: 'black', color: '#f8fafc', fontSize: '10px', textTransform: 'uppercase' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={metric}
                                    stroke={getMetricColor()}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMetricDash)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full text-slate-300">
                        <Activity size={40} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No hay registros de fuerza aún</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mt-1">Usa la sección de entrenamiento para registrar tus ejercicios y ver tu progreso aquí.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
