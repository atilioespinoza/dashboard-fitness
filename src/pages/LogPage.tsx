import { QuickLog } from '../components/ui/QuickLog';
import { FadeIn } from '../components/ui/FadeIn';
import { useLogEvents } from '../hooks/useLogEvents';
import { UserProfile } from '../hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Utensils, Footprints, Dumbbell, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LogPageProps {
    userId: string;
    profile: UserProfile | null;
    onUpdate: () => void;
}

export function LogPage({ userId, profile, onUpdate }: LogPageProps) {
    const today = new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());

    const { events } = useLogEvents(userId, today);

    const deleteEvent = async (id: string) => {
        // Here we would ideally also revert the daily summary, 
        // but for now let's just delete the history event.
        // Reverting the summary is complex because we merge data.
        const { error } = await supabase.from('log_events').delete().eq('id', id);
        if (error) console.error('Error deleting event:', error);
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            <FadeIn className="col-span-12 lg:col-span-5">
                <QuickLog userId={userId} profile={profile} onUpdate={onUpdate} />
            </FadeIn>

            <FadeIn className="col-span-12 lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                                <Clock size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Historial de Hoy</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {events.length} entradas
                        </span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {events.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-white/5">
                                        <Clock className="text-slate-300" size={24} />
                                    </div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No hay registros aún</p>
                                </motion.div>
                            ) : (
                                events.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="group relative bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 rounded-2xl p-4 hover:border-blue-500/30 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {event.parsed_data?.calories ? (
                                                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                                        <Utensils size={14} />
                                                    </div>
                                                ) : event.parsed_data?.steps ? (
                                                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                                        <Footprints size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                        <Dumbbell size={14} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {new Date(event.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteEvent(event.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                                    {event.raw_text}
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {event.parsed_data?.calories && (
                                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-md uppercase">
                                                            {event.parsed_data.calories} kcal
                                                        </span>
                                                    )}
                                                    {event.parsed_data?.protein && (
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md uppercase">
                                                            {event.parsed_data.protein}g prot
                                                        </span>
                                                    )}
                                                    {event.parsed_data?.steps && (
                                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-md uppercase">
                                                            +{event.parsed_data.steps} pasos
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
