import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Dumbbell, ChevronRight, Play, SkipForward, Flame, Zap } from 'lucide-react';
import { Exercise } from '../../data/exerciseDB';
import { RestTimer } from './RestTimer';

interface WorkoutLiveSessionProps {
    exercises: {
        exercise: Exercise;
        sets: number;
        reps: number;
        weight: number;
        restTimeSeconds: number;
    }[];
    onFinish: (burnedCalories: number) => void;
    onCancel: () => void;
    totalEstimatedCalories: number;
}

export function WorkoutLiveSession({ exercises, onFinish, onCancel, totalEstimatedCalories }: WorkoutLiveSessionProps) {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);

    const currentEx = exercises[currentExerciseIndex];
    const totalSetsInWorkout = exercises.reduce((acc, ex) => acc + ex.sets, 0);

    // Calculate progress based on sets completed
    const completedSetsInPastExercises = exercises.slice(0, currentExerciseIndex).reduce((acc, ex) => acc + ex.sets, 0);
    const progress = ((completedSetsInPastExercises + (currentSet - 1)) / totalSetsInWorkout) * 100;

    const handleCompleteSet = () => {
        setIsResting(true);
    };

    const handleRestFinished = () => {
        setIsResting(false);
        if (currentSet < currentEx.sets) {
            setCurrentSet(prev => prev + 1);
        } else {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
                setCurrentSet(1);
            } else {
                // Workout Finished!
                onFinish(totalEstimatedCalories);
            }
        }
    };

    const skipRest = () => {
        handleRestFinished();
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
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serie</span>
                            <p className="text-4xl font-black text-blue-600">{currentSet}<span className="text-lg text-slate-300">/{currentEx.sets}</span></p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objetivo</span>
                            <p className="text-4xl font-black text-slate-900 dark:text-white">
                                {currentEx.reps}
                                <span className="text-sm uppercase tracking-widest ml-1 text-slate-400">reps</span>
                            </p>
                        </div>
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
                    Completar Serie
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all"
                    >
                        Abandonar
                    </button>
                    {currentExerciseIndex < exercises.length - 1 && (
                        <button
                            onClick={() => {
                                setCurrentExerciseIndex(prev => prev + 1);
                                setCurrentSet(1);
                            }}
                            className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            Saltar Ejercicio <SkipForward size={14} />
                        </button>
                    )}
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
