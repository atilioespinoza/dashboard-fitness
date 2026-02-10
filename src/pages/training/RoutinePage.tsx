import { RoutineBuilder } from '../../components/training/RoutineBuilder';
import { SavedRoutinesList } from '../../components/training/SavedRoutinesList';
import { ExerciseHistory } from '../../components/training/ExerciseHistory';
import { FadeIn } from '../../components/ui/FadeIn';
import { UserProfile } from '../../hooks/useProfile';
import { useRoutines, Routine } from '../../hooks/useRoutines';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, TrendingUp, LayoutGrid, Award } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audioManager';
import { DEFAULT_ROUTINES } from '../../data/defaultRoutines';

interface RoutinePageProps {
    userId: string;
    profile: UserProfile | null;
    onUpdate: () => void;
}

export function RoutinePage({ userId, profile, onUpdate }: RoutinePageProps) {
    const navigate = useNavigate();
    const [isBuilding, setIsBuilding] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
    const [viewMode, setViewMode] = useState<'routines' | 'progress'>('routines');
    const { routines, loading, deleteRoutine } = useRoutines(userId);

    const handleSelectRoutine = (routine: Routine) => {
        audioManager.init();
        setSelectedRoutine(routine);
        setIsBuilding(true);
    };

    const handleStartNew = () => {
        audioManager.init();
        setSelectedRoutine(null);
        setIsBuilding(true);
    };

    return (
        <div className="max-w-4xl mx-auto py-4 md:py-8 space-y-8">
            <FadeIn>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-600 rounded-[1.5rem] shadow-xl shadow-emerald-600/20 text-white">
                            <Dumbbell size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                Zona de <span className="text-emerald-600 not-italic">Entrenamiento</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm">Gestiona tus rutinas y registra tus sesiones.</p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            <AnimatePresence mode="wait">
                {!isBuilding ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* View Toggle */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-200 dark:border-white/5">
                            <button
                                onClick={() => setViewMode('routines')}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'routines'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <LayoutGrid size={16} /> Rutinas
                            </button>
                            <button
                                onClick={() => setViewMode('progress')}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'progress'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <TrendingUp size={16} /> Progreso
                            </button>
                        </div>

                        {viewMode === 'routines' ? (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* New Workout Card */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button
                                        onClick={handleStartNew}
                                        className="md:col-span-1 flex flex-col items-center justify-center p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all group border-4 border-emerald-500/20"
                                    >
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:rotate-90 transition-all duration-500">
                                            <Plus size={32} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Plan Libre</h3>
                                        <p className="text-emerald-100 text-[10px] font-bold uppercase mt-1 opacity-80">Crear desde cero</p>
                                    </button>

                                    <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-center">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Bienvenido a la Zona de Guerra</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            Puedes diseñar una rutina nueva cada vez o cargar tus plantillas guardadas para empezar de inmediato con tus pesos y descansos ya configurados.
                                        </p>
                                    </div>
                                </div>

                                {/* Default Routines Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                                            <Award size={12} /> Rutinas de la Casa
                                        </h3>
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                    </div>
                                    <SavedRoutinesList
                                        routines={DEFAULT_ROUTINES}
                                        onSelect={handleSelectRoutine}
                                    />
                                </div>

                                {/* Saved Routines Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tus Plantillas Guardadas</h3>
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                    </div>

                                    {loading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 rounded-[2rem] animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <SavedRoutinesList
                                            routines={routines}
                                            onSelect={handleSelectRoutine}
                                            onDelete={deleteRoutine}
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ExerciseHistory userId={userId} />
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <RoutineBuilder
                            userId={userId}
                            profile={profile}
                            routineId={selectedRoutine?.id}
                            initialName={selectedRoutine?.name}
                            initialExercises={selectedRoutine?.exercises}
                            onComplete={() => {
                                setIsBuilding(false);
                                onUpdate();
                                navigate('/dashboard');
                            }}
                            onCancel={() => setIsBuilding(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
