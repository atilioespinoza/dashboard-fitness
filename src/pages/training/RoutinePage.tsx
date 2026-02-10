import { RoutineBuilder } from '../../components/training/RoutineBuilder';
import { FadeIn } from '../../components/ui/FadeIn';
import { UserProfile } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, History, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoutinePageProps {
    userId: string;
    profile: UserProfile | null;
    onUpdate: () => void;
}

export function RoutinePage({ userId, profile, onUpdate }: RoutinePageProps) {
    const navigate = useNavigate();
    const [isBuilding, setIsBuilding] = useState(false);

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
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* New Workout Card */}
                        <button
                            onClick={() => setIsBuilding(true)}
                            className="flex flex-col items-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all group"
                        >
                            <div className="w-20 h-20 bg-emerald-600/10 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Nueva Sesión</h3>
                            <p className="text-slate-500 text-sm font-medium">Empieza un entrenamiento desde cero y registra tus series en tiempo real.</p>
                        </button>

                        {/* Templates Card (Coming Soon) */}
                        <div className="relative group overflow-hidden">
                            <div className="flex flex-col items-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] shadow-xl opacity-60">
                                <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                    <History size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Mis Rutinas</h3>
                                <p className="text-slate-500 text-sm font-medium">Usa tus plantillas guardadas para entrenar más rápido.</p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] -rotate-12 shadow-2xl backdrop-blur-sm border border-white/20">
                                    Próximamente
                                </div>
                            </div>
                        </div>
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

