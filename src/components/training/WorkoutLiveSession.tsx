import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Dumbbell, ChevronRight, SkipForward, Zap, Play, Pause, RotateCcw } from 'lucide-react';
import { Exercise } from '../../data/exerciseDB';
import { RestTimer } from './RestTimer';
import { audioManager } from '../../lib/audioManager';

interface WorkoutLiveSessionProps {
    exercises: {
        exercise: Exercise;
        sets: number;
        reps: number;
        weight: number;
        restTimeSeconds: number;
        durationMinutes?: number;
        repsPerSet?: number[];
    }[];
    onFinish: (burnedCalories: number, sessionDetails?: any) => void;
    onCancel: () => void;
    totalEstimatedCalories: number;
}

export function WorkoutLiveSession({ exercises, onFinish, onCancel, totalEstimatedCalories }: WorkoutLiveSessionProps) {
    const [startTime] = useState(() => new Date());
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [skippedExerciseIndices, setSkippedExerciseIndices] = useState<number[]>([]);
    const [performedReps, setPerformedReps] = useState<{ [key: string]: number }>(() => {
        const initial: { [key: string]: number } = {};
        exercises.forEach((ex, exIdx) => {
            for (let s = 1; s <= ex.sets; s++) {
                // Priority: repsPerSet[s-1] > ex.reps
                initial[`${exIdx}-${s}`] = ex.repsPerSet ? ex.repsPerSet[s - 1] : ex.reps;
            }
        });
        return initial;
    });

    const currentEx = exercises[currentExerciseIndex];

    // Cardio Timer State
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);

    useEffect(() => {
        if (currentEx.exercise.category === 'Cardio') {
            setTimerSeconds((currentEx.durationMinutes || 0) * 60);
            setIsTimerRunning(false);
            setTimerFinished(false);
        } else {
            setIsTimerRunning(false); // Ensure timer stops if switching to non-cardio (though usually sequential)
        }
    }, [currentExerciseIndex, currentEx.exercise.category, currentEx.durationMinutes]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev <= 1) {
                        audioManager.playAlarm();
                        setIsTimerRunning(false);
                        setTimerFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerSeconds]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalSetsInWorkout = exercises.reduce((acc, ex) => acc + ex.sets, 0);

    // Calculate progress based on sets completed
    const completedSetsInPastExercises = exercises.slice(0, currentExerciseIndex).reduce((acc, ex) => acc + ex.sets, 0);
    const progress = ((completedSetsInPastExercises + (currentSet - 1)) / totalSetsInWorkout) * 100;

    const handleCompleteSet = () => {
        audioManager.init();
        if (currentEx.restTimeSeconds > 0) {
            setIsResting(true);
        } else {
            moveToNext();
        }
    };

    const moveToNext = () => {
        if (currentSet < currentEx.sets && currentEx.exercise.category !== 'Cardio') {
            setCurrentSet(prev => prev + 1);
        } else {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
                setCurrentSet(1);
            } else {
                handleFinishSession();
            }
        }
    };

    const handleFinishSession = () => {
        const endTime = new Date();
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

        const sessionDetails = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationSeconds,
            exercises: exercises.map((ex, idx) => {
                const isSkipped = skippedExerciseIndices.includes(idx);
                const actualReps = [];
                if (!isSkipped && ex.exercise.category !== 'Cardio') {
                    for (let s = 1; s <= ex.sets; s++) {
                        actualReps.push(performedReps[`${idx}-${s}`]);
                    }
                }

                return {
                    name: ex.exercise.name,
                    category: ex.exercise.category,
                    plannedSets: ex.sets,
                    plannedReps: ex.repsPerSet || ex.reps,
                    actualReps: actualReps.length > 0 ? actualReps : undefined,
                    weight: ex.weight,
                    durationMinutes: ex.durationMinutes,
                    isSkipped
                };
            })
        };

        onFinish(calculateActualCalories(), sessionDetails);
    };

    const handleRestFinished = () => {
        setIsResting(false);
        moveToNext();
    };

    const calculateActualCalories = () => {
        // We need user profile for this. Since we don't have it here, we'll 
        // calculate a ratio compared to the initial estimate which already includes profile
        const plannedRepsTotal = exercises.reduce((acc, ex) => {
            if (ex.exercise.category === 'Cardio') return acc;
            const planned = ex.repsPerSet ? ex.repsPerSet.reduce((a, b) => a + b, 0) : ex.reps * ex.sets;
            return acc + planned;
        }, 0);

        const actualRepsTotal = Object.entries(performedReps).reduce((acc, [key, val]) => {
            const exIdx = parseInt(key.split('-')[0]);
            if (exercises[exIdx].exercise.category === 'Cardio') return acc;
            return acc + val;
        }, 0);

        if (plannedRepsTotal === 0) return totalEstimatedCalories;

        return Math.round(totalEstimatedCalories * (actualRepsTotal / plannedRepsTotal));
    };


    return (
        <div className="flex flex-col h-full space-y-8 pb-10">
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Progreso Total</span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                            {Math.round(progress)}%
                        </h2>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Ejercicio</span>
                        <p className="text-sm font-bold text-slate-500">{currentExerciseIndex + 1} de {exercises.length}</p>
                    </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Current Exercise Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${currentExerciseIndex}-${currentSet}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
                >
                    <div className="space-y-2">
                        <span className="px-4 py-1.5 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {currentEx.exercise.category}
                        </span>
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">
                            {currentEx.exercise.name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                        {currentEx.exercise.category === 'Cardio' ? (
                            <div className={`col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border ${timerFinished ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-100 dark:border-white/5'} space-y-4 transition-all duration-500`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Cronómetro en Vivo</span>
                                    {timerFinished && (
                                        <div className="flex items-center gap-1 text-emerald-500 animate-pulse">
                                            <CheckCircle2 size={14} className="stroke-[3]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Completado</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <p className={`text-7xl font-black tabular-nums tracking-tighter ${timerFinished ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                        {formatTime(timerSeconds)}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                if (!isTimerRunning) audioManager.init();
                                                setIsTimerRunning(!isTimerRunning);
                                            }}
                                            className={`w-16 h-16 flex items-center justify-center rounded-full transition-all ${isTimerRunning
                                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                                                }`}
                                        >
                                            {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setTimerSeconds((currentEx.durationMinutes || 0) * 60);
                                                setIsTimerRunning(false);
                                                setTimerFinished(false);
                                            }}
                                            className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                        >
                                            <RotateCcw size={20} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-center text-xs font-medium text-slate-400">
                                    Objetivo: {currentEx.durationMinutes} min
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serie</span>
                                    <p className="text-4xl font-black text-blue-600">{currentSet}<span className="text-lg text-slate-300">/{currentEx.sets}</span></p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reps Realizadas</span>
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                const key = `${currentExerciseIndex}-${currentSet}`;
                                                setPerformedReps(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 font-black hover:bg-slate-200"
                                        >-</button>
                                        <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                                            {performedReps[`${currentExerciseIndex}-${currentSet}`]}
                                        </p>
                                        <button
                                            onClick={() => {
                                                const key = `${currentExerciseIndex}-${currentSet}`;
                                                setPerformedReps(prev => ({ ...prev, [key]: prev[key] + 1 }));
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 font-black hover:bg-slate-200"
                                        >+</button>
                                    </div>
                                    <p className="text-[8px] font-black uppercase text-blue-500">Objetivo: {currentEx.repsPerSet ? currentEx.repsPerSet[currentSet - 1] : currentEx.reps}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {currentEx.weight > 0 && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                            <Zap size={18} className="text-amber-500 fill-amber-500" />
                            <span className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                Carga: {currentEx.weight} kg
                            </span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Main Action Button */}
            <div className="space-y-4">
                <button
                    onClick={handleCompleteSet}
                    className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] shadow-2xl shadow-blue-600/30 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 group"
                >
                    <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                    {currentEx.exercise.category === 'Cardio' ? 'Finalizar Bloque' : 'Completar Serie'}
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all"
                    >
                        Abandonar
                    </button>
                    <button
                        onClick={() => {
                            audioManager.init();
                            setSkippedExerciseIndices(prev => [...prev, currentExerciseIndex]);
                            if (currentExerciseIndex < exercises.length - 1) {
                                setCurrentExerciseIndex(prev => prev + 1);
                                setCurrentSet(1);
                            } else {
                                handleFinishSession();
                            }
                        }}
                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        {currentExerciseIndex < exercises.length - 1 ? 'Saltar Ejercicio' : 'Saltar y Terminar'} <SkipForward size={14} />
                    </button>
                </div>
            </div>

            {/* Rest Timer Modal (Automatic) */}
            <AnimatePresence>
                {isResting && (
                    <RestTimer
                        seconds={currentEx.restTimeSeconds}
                        onClose={handleRestFinished}
                    />
                )}
            </AnimatePresence>

            {/* Next Up Preview */}
            {currentSet === currentEx.sets && currentExerciseIndex < exercises.length - 1 && (
                <div className="p-4 bg-emerald-600/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-white rounded-lg">
                            <Dumbbell size={16} />
                        </div>
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Siguiente</span>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{exercises[currentExerciseIndex + 1].exercise.name}</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-emerald-500" />
                </div>
            )}
        </div>
    );
}
