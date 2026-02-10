import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { EXERCISE_DATABASE, Exercise, ExerciseCategory } from '../../data/exerciseDB';
import { motion, AnimatePresence } from 'framer-motion';

interface ExercisePickerProps {
    onSelect: (exercise: Exercise) => void;
}

export function ExercisePicker({ onSelect }: ExercisePickerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'Todos'>('Todos');

    const categories: (ExerciseCategory | 'Todos')[] = ['Todos', 'Calistenia', 'Fuerza', 'Cardio', 'Flexibilidad'];

    const filteredExercises = EXERCISE_DATABASE.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Todos' || ex.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar ejercicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeCategory === cat
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-500/30'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredExercises.map(exercise => (
                        <motion.button
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={exercise.id}
                            onClick={() => onSelect(exercise)}
                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-blue-500/50 hover:shadow-lg transition-all group"
                        >
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                    {exercise.name}
                                </h4>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[8px] font-black uppercase tracking-tight text-slate-400">
                                        {exercise.category}
                                    </span>
                                    {exercise.muscleGroup?.map(m => (
                                        <span key={m} className="text-[8px] font-black uppercase tracking-tight text-blue-500/70">
                                            • {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Plus size={16} />
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {filteredExercises.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-xs font-bold uppercase tracking-widest">No se encontraron ejercicios</p>
                    </div>
                )}
            </div>
        </div>
    );
}
