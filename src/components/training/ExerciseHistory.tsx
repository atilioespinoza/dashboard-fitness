import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Exercise, EXERCISE_DATABASE } from '../../data/exerciseDB';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Search, History, TrendingUp, Dumbbell, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExerciseHistoryProps {
    userId: string;
}

interface ExerciseDataPoint {
    date: string;
    maxWeight: number;
    totalVolume: number; // sets * reps * weight
    estimated1RM: number; // One Rep Max
    totalReps: number;
}

export function ExerciseHistory({ userId }: ExerciseHistoryProps) {
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [historyData, setHistoryData] = useState<ExerciseDataPoint[]>([]);
    const [availableExercises, setAvailableExercises] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<'maxWeight' | 'estimated1RM' | 'totalVolume'>('estimated1RM');
    const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | 'ALL'>('3M');

    // Load available exercises from history
    useEffect(() => {
        const fetchExercises = async () => {
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
                            // Match by name to find ID in our DB, or just store name if not found
                            const dbExercise = EXERCISE_DATABASE.find(e => e.name === ex.name);
                            if (dbExercise) {
                                exercises.add(dbExercise.id);
                            }
                        });
                    }
                });
                setAvailableExercises(exercises);
                if (exercises.size > 0 && !selectedExerciseId) {
                    // Default to first found
                    setSelectedExerciseId(Array.from(exercises)[0]);
                }
            }
            setLoading(false);
        };

        fetchExercises();
    }, [userId]);

    // Load data for selected exercise
    useEffect(() => {
        if (!selectedExerciseId) return;

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

                // Calculate metrics
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

                    // Epley formula for 1RM
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

    // Filter data by time range
    const filteredData = useMemo(() => {
        if (timeRange === 'ALL') return historyData;
        const now = new Date();
        const cutoff = new Date();

        if (timeRange === '1M') cutoff.setMonth(now.getMonth() - 1);
        if (timeRange === '3M') cutoff.setMonth(now.getMonth() - 3);
        if (timeRange === '6M') cutoff.setMonth(now.getMonth() - 6);

        return historyData.filter(d => new Date(d.date) >= cutoff);
    }, [historyData, timeRange]);

    const currentExercise = EXERCISE_DATABASE.find(e => e.id === selectedExerciseId);

    const getMetricLabel = () => {
        switch (metric) {
            case 'estimated1RM': return '1RM Estimado (kg)';
            case 'maxWeight': return 'Peso Máximo (kg)';
            case 'totalVolume': return 'Volumen Total (kg)';
        }
    };

    const getMetricColor = () => {
        switch (metric) {
            case 'estimated1RM': return '#10b981'; // emerald-500
            case 'maxWeight': return '#3b82f6'; // blue-500
            case 'totalVolume': return '#f59e0b'; // amber-500
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando historial...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Progreso por Ejercicio</h3>
                        <p className="text-xs text-slate-500 font-medium">Visualiza tu evolución en fuerza y volumen</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from(availableExercises).map(id => {
                            const ex = EXERCISE_DATABASE.find(e => e.id === id);
                            return <option key={id} value={id}>{ex?.name || id}</option>;
                        })}
                    </select>
                </div>
            </div>

            {selectedExerciseId && historyData.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 justify-between">
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                            {(['estimated1RM', 'maxWeight', 'totalVolume'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMetric(m)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${metric === m
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {m === 'estimated1RM' ? '1RM Est.' : m === 'maxWeight' ? 'Peso Max' : 'Volumen'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                            {(['1M', '3M', '6M', 'ALL'] as const).map(r => (
                                <button
                                    key={r}
                                    onClick={() => setTimeRange(r)}
                                    className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${timeRange === r
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Récord (PR)</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {Math.max(...historyData.map(d => d[metric]))}
                                <span className="text-xs font-bold text-slate-400 ml-1">
                                    {metric === 'totalVolume' ? 'kg' : 'kg'}
                                </span>
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Última Sesión</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {historyData[historyData.length - 1]?.[metric] || 0}
                                <span className="text-xs font-bold text-slate-400 ml-1">kg</span>
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Sesiones Totales</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {historyData.length}
                            </span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredData}>
                                <defs>
                                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={metric}
                                    stroke={getMetricColor()}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMetric)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <History size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Sin Entrenamiento Registrado</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">Completa entrenamientos usando el "Coach en Vivo" para ver tu progreso aquí.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
