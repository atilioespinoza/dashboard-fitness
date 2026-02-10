import { Routine } from '../../hooks/useRoutines';
import { Trash2, Dumbbell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavedRoutinesListProps {
    routines: Routine[];
    onSelect: (routine: Routine) => void;
    onDelete?: (id: string) => void;
}

export function SavedRoutinesList({ routines, onSelect, onDelete }: SavedRoutinesListProps) {
    if (routines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[2.5rem] text-center px-6">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Dumbbell className="text-slate-300" size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">No tienes rutinas guardadas</h4>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">Diseña una y guárdala como plantilla</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map((routine) => (
                <motion.div
                    key={routine.id}
                    layout
                    whileHover={{ scale: 1.02 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => onSelect(routine)}
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                    {routine.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                                        {routine.exercises.length} Ejercicios
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">•</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {new Date(routine.created_at).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            </div>
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('¿Eliminar esta rutina?')) onDelete(routine.id);
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {routine.exercises.slice(0, 3).map((ex, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[8px] font-bold rounded-md uppercase tracking-tighter">
                                    {ex.exercise.name}
                                </span>
                            ))}
                            {routine.exercises.length > 3 && (
                                <span className="px-2 py-0.5 text-slate-300 text-[8px] font-bold">
                                    +{routine.exercises.length - 3} más
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {routine.exercises.slice(0, 4).map((ex, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-black overflow-hidden italic shadow-sm">
                                    {ex.exercise.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                            Cargar <ChevronRight size={14} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
