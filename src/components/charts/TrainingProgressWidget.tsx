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
    Area,
    ReferenceLine
} from 'recharts';
import { TrendingUp, Activity, Award, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const [metric, setMetric] = useState<'maxWeight' | 'estimated1RM' | 'totalVolume' | 'totalReps'>('estimated1RM');

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
            let allWeightIsZero = true;

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

                    if (weight > 0) allWeightIsZero = false;

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

            // Si es un ejercicio corporal (todo peso 0), cambiar métrica por defecto a Reps
            if (allWeightIsZero && points.length > 0) {
                setMetric('totalReps');
            } else if (metric === 'totalReps' && !allWeightIsZero) {
                // Si volvemos a un ejercicio con peso y estábamos en reps, 1RM suele ser más útil
                setMetric('estimated1RM');
            }
        };

        loadExerciseData();
    }, [selectedExerciseId, userId]);

    const getMetricColor = () => {
        switch (metric) {
            case 'estimated1RM': return '#10b981'; // emerald-500
            case 'maxWeight': return '#3b82f6'; // blue-500
            case 'totalVolume': return '#f59e0b'; // amber-500
            case 'totalReps': return '#8b5cf6'; // violet-500
        }
    };

    const getMetricLabel = () => {
        switch (metric) {
            case 'estimated1RM': return 'Fuerza (1RM)';
            case 'maxWeight': return 'Carga Máxima';
            case 'totalVolume': return 'Volumen Diario (kg)';
            case 'totalReps': return 'Volumen Diario (reps)';
        }
    };

    const getMetricUnit = () => metric === 'totalReps' ? 'reps' : 'kg';

    const prValue = historyData.length > 0 ? Math.max(...historyData.map(d => d[metric])) : 0;
    const initialValue = historyData.length > 0 ? historyData[0][metric] : 0;
    const growth = initialValue > 0 ? Math.round(((historyData[historyData.length - 1]?.[metric] || 0) - initialValue) / initialValue * 100) : 0;

    if (loading) return (
        <div className="h-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-full group relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl opacity-50" />

            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Progresión Elite</h3>
                            {growth !== 0 && (
                                <span className={`${growth > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1`}>
                                    <TrendingUp size={10} className={growth < 0 ? 'rotate-180' : ''} /> {growth > 0 ? '+' : ''}{growth}%
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            <Info size={12} className="text-blue-500" /> Evolución histórica de rendimiento
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <select
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                        className="flex-1 xl:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                        {Array.from(availableExercises).map(id => {
                            const ex = EXERCISE_DATABASE.find(e => e.id === id);
                            return <option key={id} value={id}>{ex?.name || id}</option>;
                        })}
                    </select>
                </div>
            </div>

            {selectedExerciseId && historyData.length > 0 ? (
                <div className="flex-1 flex flex-col gap-6 relative z-10">
                    {/* Metric Selector Tabs */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5">
                        {(['estimated1RM', 'maxWeight', 'totalVolume', 'totalReps'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMetric(m)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${metric === m
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md scale-105'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                {m === 'estimated1RM' ? '1RM' : m === 'maxWeight' ? 'Máx KG' : m === 'totalVolume' ? 'Vol KG' : 'Vol Reps'}
                            </button>
                        ))}
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 group/stat relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/stat:opacity-20 transition-opacity">
                                <Award size={32} />
                            </div>
                            <span className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] block mb-2 text-shadow-sm">Récord Histórico</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 dark:text-white italic">
                                    {prValue}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase">{getMetricUnit()}</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 group/stat relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/stat:opacity-20 transition-opacity">
                                <Calendar size={32} />
                            </div>
                            <span className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] block mb-2 text-shadow-sm">Última Sesión</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400 italic">
                                    {historyData[historyData.length - 1]?.[metric] || 0}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase">{getMetricUnit()}</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 group/stat relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hidden sm:block">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/stat:opacity-20 transition-opacity">
                                <Activity size={32} />
                            </div>
                            <span className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] block mb-2 text-shadow-sm">Consistencia</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-blue-500 dark:text-blue-400 italic">
                                    {historyData.length}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase ml-1">sesiones</span>
                            </div>
                        </div>
                    </div>

                    {/* Elite Chart Center */}
                    <div className="flex-1 min-h-[280px] w-full mt-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-[2rem] p-4 border border-slate-200/50 dark:border-white/5">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMetricElite" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={getMetricColor()} stopOpacity={0.4} />
                                        <stop offset="80%" stopColor={getMetricColor()} stopOpacity={0.05} />
                                        <stop offset="100%" stopColor={getMetricColor()} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                    tickFormatter={(val) => format(new Date(val), 'dd MMM', { locale: es })}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={['dataMin', 'dataMax']}
                                    padding={{ top: 20, bottom: 20 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip metricLabel={getMetricLabel()} color={getMetricColor()} unit={getMetricUnit()} />}
                                    cursor={{ stroke: getMetricColor(), strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <ReferenceLine y={prValue} stroke="#ec4899" strokeDasharray="5 5" opacity={0.3} label={{ value: 'PR', position: 'right', fill: '#ec4899', fontSize: 10, fontWeight: 'black' }} />
                                <Area
                                    type="monotone"
                                    dataKey={metric}
                                    stroke={getMetricColor()}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorMetricElite)"
                                    animationDuration={2000}
                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3 }}
                                    dot={<CustomDot prValue={prValue} metric={metric} />}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] bg-slate-50/30 dark:bg-slate-900/10">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-full text-slate-200 dark:text-slate-700 shadow-xl ring-8 ring-slate-50 dark:ring-white/5">
                        <Activity size={56} />
                    </div>
                    <div className="max-w-xs">
                        <h4 className="text-lg font-black text-slate-700 dark:text-slate-300 uppercase italic tracking-tighter">Sin Datos de Progresión</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">Registra ejercicios específicos en tus rutinas para desbloquear el análisis de fuerza y volumen.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const CustomDot = (props: any) => {
    const { cx, cy, payload, prValue, metric } = props;
    if (payload[metric] === prValue) {
        return (
            <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#ec4899" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#fff" strokeWidth="20" />
            </svg>
        );
    }
    return null;
};

const CustomTooltip = ({ active, payload, label, metricLabel, color, unit }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[180px]">
                <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(label), 'dd MMMM, yyyy', { locale: es })}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{metricLabel}</p>
                    <p className="text-2xl font-black text-white italic">
                        {payload[0].value}
                        <span className="text-xs font-bold text-slate-500 ml-1">{unit}</span>
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Volumen</p>
                        <p className="text-xs font-black text-slate-300">{data.totalVolume}<span className="text-[8px] ml-0.5">kg</span></p>
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Reps Totales</p>
                        <p className="text-xs font-black text-slate-300">{data.totalReps}</p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
