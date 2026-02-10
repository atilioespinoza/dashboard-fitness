import { Exercise } from '../../data/exerciseDB';
import { Trash2, Clock, Hash, Weight, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoutineExerciseItemProps {
    exercise: Exercise;
    sets: number;
    reps: number;
    weight: number;
    rpe: number;
    restTimeSeconds: number;
    onUpdate: (updates: any) => void;
    onRemove: () => void;
    onStartRest: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    repsPerSet?: number[];
}

export function RoutineExerciseItem({
    exercise,
    sets,
    reps,
    weight,
    rpe,
    restTimeSeconds,
    durationMinutes,
    repsPerSet,
    onUpdate,
    onRemove,
    onStartRest,
    onMoveUp,
    onMoveDown
}: RoutineExerciseItemProps & { durationMinutes?: number }) {
    const isCardio = exercise.category === 'Cardio';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-4"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                        {exercise.name}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                        {exercise.category}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {onMoveUp && (
                        <button
                            onClick={onMoveUp}
                            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Mover arriba"
                        >
                            <ChevronUp size={18} />
                        </button>
                    )}
                    {onMoveDown && (
                        <button
                            onClick={onMoveDown}
                            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Mover abajo"
                        >
                            <ChevronDown size={18} />
                        </button>
                    )}
                    <button
                        onClick={onRemove}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all ml-1"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isCardio ? (
                    <>
                        {/* Duration */}
                        <div className="space-y-1.5 col-span-2">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Clock size={10} /> Duración (minutos)
                            </label>
                            <input
                                type="number"
                                value={durationMinutes || 0}
                                onChange={(e) => onUpdate({ durationMinutes: Math.max(1, parseInt(e.target.value) || 0) })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        {/* Intensity (Optional but we have RPE below) */}
                        <div className="space-y-1.5 col-span-2">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Weight size={10} /> Resistencia / Nivel
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => onUpdate({ weight: Math.max(0, parseFloat(e.target.value) || 0) })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Nivel/Carga..."
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Sets */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Hash size={10} /> Series
                            </label>
                            <input
                                type="number"
                                value={sets}
                                onChange={(e) => onUpdate({ sets: Math.max(1, parseInt(e.target.value) || 0) })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Reps */}
                        <div className="space-y-1.5 flex flex-col">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    <Hash size={10} /> {repsPerSet ? 'Reps p/Serie' : 'Reps'}
                                </label>
                                <button
                                    onClick={() => {
                                        if (repsPerSet) {
                                            onUpdate({ repsPerSet: undefined });
                                        } else {
                                            onUpdate({ repsPerSet: Array(sets).fill(reps) });
                                        }
                                    }}
                                    className={`text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${repsPerSet ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                                >
                                    {repsPerSet ? 'Fijo' : 'Variable'}
                                </button>
                            </div>
                            {repsPerSet ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {repsPerSet.map((r, i) => (
                                        <input
                                            key={i}
                                            type="number"
                                            value={r}
                                            onChange={(e) => {
                                                const newReps = [...repsPerSet];
                                                newReps[i] = Math.max(0, parseInt(e.target.value) || 0);
                                                onUpdate({ repsPerSet: newReps });
                                            }}
                                            className="w-10 px-1 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            title={`Serie ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <input
                                    type="number"
                                    value={reps}
                                    onChange={(e) => onUpdate({ reps: Math.max(0, parseInt(e.target.value) || 0) })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            )}
                        </div>

                        {/* Weight / Intensity */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Weight size={10} /> Peso (kg)
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => onUpdate({ weight: Math.max(0, parseFloat(e.target.value) || 0) })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Rest Time */}
                        <div className="space-y-1.5 border-l border-slate-100 dark:border-white/5 pl-4 flex flex-col justify-end">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Clock size={10} /> Descanso (s)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={restTimeSeconds}
                                    onChange={(e) => onUpdate({ restTimeSeconds: Math.max(0, parseInt(e.target.value) || 0) })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    onClick={onStartRest}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center group"
                                    title="Iniciar Cronómetro"
                                >
                                    <Clock size={16} className="group-hover:animate-pulse" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* RPE Slider */}
            <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <Star size={10} /> Esfuerzo (RPE: {rpe})
                    </label>
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                        {rpe <= 4 ? 'Ligero' : rpe <= 7 ? 'Moderado' : rpe <= 9 ? 'Intenso' : 'Al Límite'}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={rpe}
                    onChange={(e) => onUpdate({ rpe: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between px-1 mt-1 text-[8px] font-bold text-slate-400">
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                </div>
            </div>
        </motion.div>
    );
}
