import { useState, useMemo } from 'react';
import { ExercisePicker } from './ExercisePicker';
import { RoutineExerciseItem } from './RoutineExerciseItem';
import { RestTimer } from './RestTimer';
import { WorkoutLiveSession } from './WorkoutLiveSession';
import { Exercise } from '../../data/exerciseDB';
import { calculateWorkoutCalories, estimateActiveDuration } from '../../lib/calorieCalculator';
import { UserProfile } from '../../hooks/useProfile';
import { Dumbbell, Plus, Zap, CheckCircle2, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface RoutineBuilderProps {
    userId: string;
    profile: UserProfile | null;
    onComplete: () => void;
    onCancel: () => void;
}

interface SelectedExercise {
    id: string; // Unique instance ID
    exercise: Exercise;
    sets: number;
    reps: number;
    weight: number;
    rpe: number;
    restTimeSeconds: number;
}

export function RoutineBuilder({ userId, profile, onComplete, onCancel }: RoutineBuilderProps) {
    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);

    const totalCalories = useMemo(() => {
        if (!profile) return 0;
        const sets = selectedExercises.map(ex => ({
            exercise: ex.exercise,
            durationMinutes: estimateActiveDuration(ex.reps, ex.sets),
            rpe: ex.rpe
        }));
        return calculateWorkoutCalories(sets, {
            weightKp: profile.target_weight || 80,
            heightCm: profile.height || 170,
            age: 30,
            gender: profile.gender || 'Masculino'
        });
    }, [selectedExercises, profile]);

    const addExercise = (exercise: Exercise) => {
        setSelectedExercises(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                exercise,
                sets: 3,
                reps: 10,
                weight: 0,
                rpe: 7,
                restTimeSeconds: 90 // Default 90s
            }
        ]);
        setIsAddingExercise(false);
    };

    const updateExercise = (id: string, updates: Partial<SelectedExercise>) => {
        setSelectedExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    };

    const removeExercise = (id: string) => {
        setSelectedExercises(prev => prev.filter(ex => ex.id !== id));
    };

    const handleFinish = async (caloriesOverride?: number) => {
        if (selectedExercises.length === 0) return;
        setIsSaving(true);
        const finalCalories = typeof caloriesOverride === 'number' ? caloriesOverride : totalCalories;
        try {
            const dateStr = new Intl.DateTimeFormat('fr-CA', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date());

            const workoutSummary = selectedExercises.map(ex => `${ex.exercise.name} (${ex.sets}x${ex.reps})`).join(', ');
            const rawText = `Entrenamiento: ${workoutSummary}`;

            // 1. Log the event
            const { error: eventError } = await supabase.from('log_events').insert({
                user_id: userId,
                date: dateStr,
                raw_text: rawText,
                parsed_data: {
                    burned_calories: finalCalories,
                    training: workoutSummary
                }
            });

            if (eventError) throw eventError;

            // 2. Update the daily summary (similar logic as in QuickLog/LogPage)
            const { data: summary } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', dateStr)
                .maybeSingle();

            if (summary) {
                // Parse existing ExKcal if any
                const match = (summary.notes || '').match(/\[ExKcal:\s*(\d+)\]/);
                const currentExKcal = match ? parseInt(match[1]) : 0;
                const newExKcal = currentExKcal + finalCalories;

                // Simple additive update for notes and total TDEE
                const cleanNotes = (summary.notes || '').replace(/\[ExKcal: \d+\]/g, '').trim();
                const newNotes = `${cleanNotes}\n[ExKcal: ${newExKcal}]`.trim();

                // Recalculate TDEE roughly (this logic should ideally be centralized)
                const newTdee = (summary.tdee || 2500) + finalCalories;

                await supabase.from('fitness_logs').update({
                    training: summary.training ? `${summary.training}, ${workoutSummary}` : workoutSummary,
                    tdee: newTdee,
                    notes: newNotes
                }).eq('user_id', userId).eq('date', dateStr);
            }

            onComplete();
        } catch (err) {
            console.error('Error saving workout:', err);
            alert('Error al guardar el entrenamiento');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header with Stats */}
            {!isLiveMode && (
                <div className="flex justify-between items-center bg-blue-600 rounded-[2rem] p-6 shadow-xl shadow-blue-600/20 text-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Dumbbell size={20} className="text-blue-100" />
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Nueva Sesión</h2>
                        </div>
                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em] opacity-80">Registro Detallado</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 block mb-1">Gasto Estimado</span>
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-3xl font-black tracking-tighter tabular-nums flex items-center gap-2">
                                <Zap size={20} className="text-amber-400 fill-amber-400 animate-pulse" />
                                {totalCalories}
                            </span>
                            <span className="text-xs font-bold uppercase text-blue-100">kcal</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {!isLiveMode ? (
                        <motion.div
                            key="builder"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                {selectedExercises.map((ex) => (
                                    <RoutineExerciseItem
                                        key={ex.id}
                                        exercise={ex.exercise}
                                        sets={ex.sets}
                                        reps={ex.reps}
                                        weight={ex.weight}
                                        rpe={ex.rpe}
                                        restTimeSeconds={ex.restTimeSeconds}
                                        onUpdate={(updates) => updateExercise(ex.id, updates)}
                                        onRemove={() => removeExercise(ex.id)}
                                        onStartRest={() => setActiveTimerSeconds(ex.restTimeSeconds)}
                                    />
                                ))}

                                {selectedExercises.length === 0 && !isAddingExercise && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-100/50 dark:bg-slate-950/50 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] text-center px-10">
                                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl">
                                            <Dumbbell className="text-blue-500" size={32} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">Rutina Vacía</h3>
                                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                                            Diseña tu rutina primero y luego iníciala en modo "Seguimiento en Vivo".
                                        </p>
                                        <button
                                            onClick={() => setIsAddingExercise(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Añadir Primer Ejercicio
                                        </button>
                                    </div>
                                )}

                                {selectedExercises.length > 0 && !isAddingExercise && (
                                    <button
                                        onClick={() => setIsAddingExercise(true)}
                                        className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group flex flex-col items-center gap-2"
                                    >
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <Plus size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Añadir Ejercicio</span>
                                    </button>
                                )}
                            </div>

                            {/* Actions bar for Builder */}
                            <div className="sticky bottom-0 pt-4 bg-slate-50 dark:bg-slate-950 flex gap-4">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Cancelar
                                </button>
                                <button
                                    onClick={() => setIsLiveMode(true)}
                                    disabled={selectedExercises.length === 0 || isSaving}
                                    className={`flex-[2] py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${selectedExercises.length === 0 || isSaving
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                                        }`}
                                >
                                    <Play size={18} /> Iniciar Coach en Vivo
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full pt-4"
                        >
                            <WorkoutLiveSession
                                exercises={selectedExercises}
                                totalEstimatedCalories={totalCalories}
                                onFinish={handleFinish}
                                onCancel={() => setIsLiveMode(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals outside main flow */}
            <AnimatePresence>
                {activeTimerSeconds !== null && (
                    <RestTimer
                        seconds={activeTimerSeconds}
                        onClose={() => setActiveTimerSeconds(null)}
                    />
                )}
                {isAddingExercise && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            onClick={() => setIsAddingExercise(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 w-full max-w-lg shadow-2xl h-[80vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white flex items-center gap-2">
                                    <Plus className="text-blue-500" /> Elegir Ejercicio
                                </h3>
                                <button
                                    onClick={() => setIsAddingExercise(false)}
                                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <ExercisePicker onSelect={addExercise} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
