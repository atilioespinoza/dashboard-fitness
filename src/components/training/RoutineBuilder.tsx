import { useState, useMemo } from 'react';
import { ExercisePicker } from './ExercisePicker';
import { RoutineExerciseItem } from './RoutineExerciseItem';
import { RestTimer } from './RestTimer';
import { WorkoutLiveSession } from './WorkoutLiveSession';
import { Exercise } from '../../data/exerciseDB';
import { calculateWorkoutCalories, calculateWorkoutDuration, estimateActiveDuration, estimateActiveDurationFromList } from '../../lib/calorieCalculator';
import { UserProfile } from '../../hooks/useProfile';
import { Dumbbell, Plus, Zap, X, Play, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useRoutines } from '../../hooks/useRoutines';
import { audioManager } from '../../lib/audioManager';
import { Save } from 'lucide-react';

interface RoutineBuilderProps {
    userId: string;
    profile: UserProfile | null;
    onComplete: () => void;
    onCancel: () => void;
    routineId?: string;
    initialName?: string;
    initialExercises?: {
        exercise: Exercise;
        sets: number;
        reps: number;
        weight: number;
        rpe: number;
        restTimeSeconds: number;
        durationMinutes?: number;
        repsPerSet?: number[];
    }[];
}

interface SelectedExercise {
    id: string; // Unique instance ID
    exercise: Exercise;
    sets: number;
    reps: number;
    weight: number;
    rpe: number;
    restTimeSeconds: number;
    durationMinutes?: number;
    repsPerSet?: number[];
}

export function RoutineBuilder({ userId, profile, onComplete, onCancel, routineId, initialName, initialExercises }: RoutineBuilderProps) {
    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>(() => {
        if (initialExercises) {
            return initialExercises.map(ex => ({
                id: crypto.randomUUID(),
                ...ex
            }));
        }
        return [];
    });
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [routineName, setRoutineName] = useState(initialName || '');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [completedSessionData, setCompletedSessionData] = useState<any | null>(null);
    const { saveRoutine, updateRoutine } = useRoutines(userId);

    const workoutData = useMemo(() => {
        return selectedExercises.map(ex => {
            let duration = 0;
            if (ex.exercise.category === 'Cardio' && ex.durationMinutes) {
                duration = ex.durationMinutes;
            } else if (ex.repsPerSet) {
                duration = estimateActiveDurationFromList(ex.repsPerSet);
            } else {
                duration = estimateActiveDuration(ex.reps, ex.sets);
            }

            return {
                exercise: ex.exercise,
                durationMinutes: duration,
                rpe: ex.rpe,
                sets: ex.sets,
                restTimeSeconds: ex.restTimeSeconds,
                repsPerSet: ex.repsPerSet
            };
        });
    }, [selectedExercises]);

    const totalCalories = useMemo(() => {
        if (!profile) return 0;
        return calculateWorkoutCalories(workoutData, {
            weightKp: profile.target_weight || 80,
            heightCm: profile.height || 170,
            age: 30,
            gender: profile.gender || 'Masculino'
        });
    }, [workoutData, profile]);

    const totalDuration = useMemo(() => {
        return calculateWorkoutDuration(workoutData);
    }, [workoutData]);

    const addExercise = (exercise: Exercise) => {
        setSelectedExercises(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                exercise,
                sets: exercise.category === 'Cardio' ? 1 : 3,
                reps: 10,
                weight: 0,
                rpe: 7,
                restTimeSeconds: exercise.category === 'Cardio' ? 0 : 90,
                durationMinutes: exercise.category === 'Cardio' ? 30 : undefined
            }
        ]);
        setIsAddingExercise(false);
    };

    const updateExercise = (id: string, updates: Partial<SelectedExercise>) => {
        setSelectedExercises(prev => prev.map(ex => {
            if (ex.id !== id) return ex;

            const nextEx = { ...ex, ...updates };

            // Sync repsPerSet if sets changed and it exists
            if (updates.sets !== undefined && ex.repsPerSet) {
                const diff = updates.sets - ex.repsPerSet.length;
                if (diff > 0) {
                    // Add new sets with the value of the last set
                    const lastVal = ex.repsPerSet[ex.repsPerSet.length - 1] || ex.reps;
                    nextEx.repsPerSet = [...ex.repsPerSet, ...Array(diff).fill(lastVal)];
                } else if (diff < 0) {
                    // Remove sets from the end
                    nextEx.repsPerSet = ex.repsPerSet.slice(0, updates.sets);
                }
            }

            return nextEx;
        }));
    };

    const removeExercise = (id: string) => {
        setSelectedExercises(prev => prev.filter(ex => ex.id !== id));
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= selectedExercises.length) return;

        setSelectedExercises(prev => {
            const next = [...prev];
            const [moved] = next.splice(index, 1);
            next.splice(newIndex, 0, moved);
            return next;
        });
    };

    const handleFinish = async (caloriesOverride?: number, sessionDetails?: any) => {
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

            // Determine which exercises were actually done
            const actualExercises = sessionDetails
                ? sessionDetails.exercises.filter((ex: any) => !ex.isSkipped)
                : selectedExercises;

            const workoutSummary = actualExercises.map((ex: any) => {
                const exerciseName = ex.name || ex.exercise?.name;
                if (ex.category === 'Cardio' || ex.exercise?.category === 'Cardio') {
                    return `${exerciseName} (${ex.durationMinutes || 0} min)`;
                }
                const repsString = ex.actualReps
                    ? `[${ex.actualReps.join(',')}]`
                    : (ex.repsPerSet ? `[${ex.repsPerSet.join(',')}]` : `${ex.reps}`);
                const sets = ex.actualReps ? ex.actualReps.length : ex.sets;
                const weightSuffix = ex.weight > 0 ? ` @ ${ex.weight}kg` : '';
                return `${exerciseName} (${sets}x${repsString}${weightSuffix})`;
            }).join(', ');

            const rawText = `Entrenamiento: ${workoutSummary}`;

            // 1. Log the event
            const { error: eventError } = await supabase.from('log_events').insert({
                user_id: userId,
                date: dateStr,
                raw_text: rawText,
                parsed_data: {
                    burned_calories: finalCalories,
                    planned_calories: totalCalories,
                    training: workoutSummary,
                    session_details: sessionDetails
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


            setCompletedSessionData({
                actualCalories: finalCalories,
                plannedCalories: totalCalories,
                summary: workoutSummary,
                details: sessionDetails
            });
        } catch (err) {
            console.error('Error saving workout:', err);
            alert('Error al guardar el entrenamiento');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!routineName.trim() || selectedExercises.length === 0) return;
        setIsSavingTemplate(true);

        // Map to cleaner objects for storage
        const exercisesToSave = selectedExercises.map(({ exercise, sets, reps, weight, rpe, restTimeSeconds, durationMinutes, repsPerSet }) => ({
            exercise,
            sets,
            reps,
            weight,
            rpe,
            restTimeSeconds,
            durationMinutes,
            repsPerSet
        }));

        try {
            if (routineId) {
                await updateRoutine(routineId, routineName, exercisesToSave);
            } else {
                await saveRoutine(routineName, exercisesToSave);
            }
            alert('¡Rutina guardada con éxito!');
        } catch (err) {
            alert('Error al guardar la plantilla.');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header with Stats */}
            {/* Header with Stats and Name */}
            <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center text-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Dumbbell size={20} className="text-blue-400" />
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Nueva Sesión</h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Configura tu rutina</p>
                    </div>
                    <div className="flex gap-6 md:gap-10">
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Duración</span>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="text-3xl font-black tracking-tighter tabular-nums flex items-center gap-2 text-white">
                                    <Clock size={20} className="text-blue-400" />
                                    {totalDuration}
                                </span>
                                <span className="text-xs font-bold uppercase text-slate-400">min</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Gasto</span>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="text-3xl font-black tracking-tighter tabular-nums flex items-center gap-2 text-white">
                                    <Zap size={20} className="text-amber-400 fill-amber-400 animate-pulse" />
                                    {totalCalories}
                                </span>
                                <span className="text-xs font-bold uppercase text-slate-400">kcal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Nombre de la rutina (ej: Empuje A...)"
                        value={routineName}
                        onChange={(e) => setRoutineName(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                        onClick={handleSaveTemplate}
                        disabled={!routineName.trim() || selectedExercises.length === 0 || isSavingTemplate}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all disabled:opacity-30"
                    >
                        {isSavingTemplate ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> {routineId ? 'Actualizar Plan' : 'Guardar Plan'}</>}
                    </button>
                </div>
            </div>

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
                                {selectedExercises.map((ex, index) => (
                                    <RoutineExerciseItem
                                        key={ex.id}
                                        exercise={ex.exercise}
                                        sets={ex.sets}
                                        reps={ex.reps}
                                        weight={ex.weight}
                                        rpe={ex.rpe}
                                        restTimeSeconds={ex.restTimeSeconds}
                                        durationMinutes={ex.durationMinutes}
                                        repsPerSet={ex.repsPerSet}
                                        onUpdate={(updates) => updateExercise(ex.id, updates)}
                                        onRemove={() => removeExercise(ex.id)}
                                        onMoveUp={index > 0 ? () => moveExercise(index, 'up') : undefined}
                                        onMoveDown={index < selectedExercises.length - 1 ? () => moveExercise(index, 'down') : undefined}
                                        onStartRest={() => {
                                            audioManager.init();
                                            setActiveTimerSeconds(ex.restTimeSeconds);
                                        }}
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
                            {completedSessionData ? (
                                <div className="flex flex-col items-center justify-center space-y-8 py-10 text-center">
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 text-white mb-4">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">¡Misión Cumplida!</h3>
                                        <p className="text-slate-500 font-medium">Tu entrenamiento ha sido registrado con éxito.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tiempo Real</span>
                                            <p className="text-3xl font-black text-blue-600">
                                                {Math.round(completedSessionData.details?.durationSeconds / 60) || 0}
                                                <span className="text-xs ml-1 text-slate-400">min</span>
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Calorías Reales</span>
                                            <p className="text-3xl font-black text-emerald-600">
                                                {completedSessionData.actualCalories}
                                                <span className="text-xs ml-1 text-slate-400">kcal</span>
                                            </p>
                                        </div>
                                        <div className="col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-2">
                                                <span className="text-slate-400">Comparativa de Esfuerzo</span>
                                                <span className={completedSessionData.actualCalories >= completedSessionData.plannedCalories ? 'text-emerald-500' : 'text-amber-500'}>
                                                    {Math.round((completedSessionData.actualCalories / completedSessionData.plannedCalories) * 100)}% del objetivo
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500"
                                                    style={{ width: `${Math.min(100, (completedSessionData.actualCalories / completedSessionData.plannedCalories) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-left space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Resumen de la Sesión</span>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                            {completedSessionData.summary}
                                        </p>
                                    </div>

                                    <button
                                        onClick={onComplete}
                                        className="w-full max-w-md py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Finalizar y Salir
                                    </button>
                                </div>
                            ) : (
                                <WorkoutLiveSession
                                    exercises={selectedExercises}
                                    totalEstimatedCalories={totalCalories}
                                    onFinish={handleFinish}
                                    onCancel={() => setIsLiveMode(false)}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >

            {/* Modals outside main flow */}
            <AnimatePresence>
                {
                    activeTimerSeconds !== null && (
                        <RestTimer
                            seconds={activeTimerSeconds}
                            onClose={() => setActiveTimerSeconds(null)}
                        />
                    )
                }
                {
                    isAddingExercise && (
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
                    )
                }
            </AnimatePresence >
        </div >
    );
}
