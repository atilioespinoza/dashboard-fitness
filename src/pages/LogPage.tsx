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

    const { events, refresh: refreshHistory } = useLogEvents(userId, today);

    const deleteEvent = async (event: any) => {
        try {
            // 1. Obtener el resumen actual de hoy
            const { data: summary } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', event.date)
                .maybeSingle();

            if (summary) {
                const p = event.parsed_data;
                const stepsRestantes = Math.max(0, (summary.steps || 0) - (p.steps || 0));

                // Extraer ExKcal de las notas (un poco hacky pero necesario por ahora)
                const getExKcal = (notes: string) => {
                    const match = notes.match(/\[ExKcal:\s*(\d+)\]/);
                    return match ? parseInt(match[1]) : 0;
                };

                const currentExKcal = getExKcal(summary.notes || '');
                const eventExKcal = p.burned_calories || 0;
                const newExKcal = Math.max(0, currentExKcal - eventExKcal);

                // Recalcular TDEE (usando la fórmula de QuickLog)
                const weight = summary.weight || 80;
                const h = profile?.height || 170;
                const birth = profile ? new Date(profile.birth_date) : new Date('1990-01-01');
                const now = new Date();
                let age = now.getFullYear() - birth.getFullYear();
                const g = profile?.gender || 'Masculino';
                let bmrValue = (10 * weight) + (6.25 * h) - (5 * age) + (g === 'Masculino' ? 5 : -161);

                const stepsBonus = stepsRestantes * (weight * 0.0005);
                const newTdee = Math.round((bmrValue * 1.1) + stepsBonus + newExKcal);

                // 2. Limpiar las notas: quitar la línea que corresponde a este registro
                const lines = (summary.notes || '').split('\n');
                const filteredLines = lines.filter((l: string) => !l.includes(event.raw_text) && !l.includes(`[ExKcal: ${currentExKcal}]`));
                const newNotes = filteredLines.join('\n') + (newExKcal > 0 ? `\n[ExKcal: ${newExKcal}]` : '');

                const updatedPayload: any = {
                    calories: Math.max(0, (summary.calories || 0) - (p.calories || 0)),
                    protein: Math.max(0, (summary.protein || 0) - (p.protein || 0)),
                    carbs: Math.max(0, (summary.carbs || 0) - (p.carbs || 0)),
                    fat: Math.max(0, (summary.fat || 0) - (p.fat || 0)),
                    steps: stepsRestantes,
                    tdee: newTdee,
                    notes: newNotes.trim()
                };

                // Si el evento que borramos tenía entrenamiento, lo limpiamos del resumen
                if (p.training || p.burned_calories > 0) {
                    updatedPayload.training = null;
                }

                await supabase.from('fitness_logs').update(updatedPayload).eq('user_id', userId).eq('date', event.date);
            }

            // 3. Borrar el evento físicamente
            const { error: deleteError } = await supabase.from('log_events').delete().eq('id', event.id);
            if (deleteError) throw deleteError;

            // 4. Refrescar datos
            onUpdate();
            refreshHistory();

        } catch (err) {
            console.error('Error al sincronizar borrado:', err);
            alert('Hubo un error al actualizar los totales del dashboard.');
        }
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
                                                        onClick={() => {
                                                            if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                                                                deleteEvent(event);
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                                    {event.raw_text}
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {(event.parsed_data?.calories > 0) && (
                                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-md uppercase">
                                                            {event.parsed_data.calories} kcal
                                                        </span>
                                                    )}
                                                    {(event.parsed_data?.protein > 0) && (
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md uppercase">
                                                            P: {event.parsed_data.protein}g
                                                        </span>
                                                    )}
                                                    {(event.parsed_data?.carbs > 0) && (
                                                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black rounded-md uppercase">
                                                            C: {event.parsed_data.carbs}g
                                                        </span>
                                                    )}
                                                    {(event.parsed_data?.fat > 0) && (
                                                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-md uppercase">
                                                            G: {event.parsed_data.fat}g
                                                        </span>
                                                    )}
                                                    {(event.parsed_data?.burned_calories > 0) && (
                                                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-md uppercase">
                                                            🔥 {event.parsed_data.burned_calories} kcal activas
                                                        </span>
                                                    )}
                                                    {(event.parsed_data?.steps > 0) && (
                                                        <>
                                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-md uppercase">
                                                                👣 +{event.parsed_data.steps} pasos
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 text-[10px] font-black rounded-md uppercase">
                                                                ~{Math.round(event.parsed_data.steps * 80 * 0.0005)} kcal
                                                            </span>
                                                        </>
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
