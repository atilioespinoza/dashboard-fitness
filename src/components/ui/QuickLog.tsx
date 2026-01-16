import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { parseFitnessEntry } from '../../lib/gemini';
import { Brain, Send, Loader2, CheckCircle2, XCircle, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QuickLog({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Get structured data from AI
            const aiData = await parseFitnessEntry(input);
            if (!aiData) throw new Error("No pudimos procesar el registro. Intenta ser más específico.");

            // 2. Prepare payload for Supabase
            const today = new Date().toISOString().split('T')[0];
            const { data: existing } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .single();

            const payload = {
                user_id: userId,
                date: today,
                weight: aiData.weight ?? existing?.weight,
                waist: aiData.waist ?? existing?.waist,
                body_fat: aiData.body_fat ?? existing?.body_fat,
                calories: (existing?.calories || 0) + (aiData.calories || 0),
                protein: (existing?.protein || 0) + (aiData.protein || 0),
                carbs: (existing?.carbs || 0) + (aiData.carbs || 0),
                fat: (existing?.fat || 0) + (aiData.fat || 0),
                steps: aiData.steps ?? existing?.steps,
                sleep: aiData.sleep ?? existing?.sleep,
                training: aiData.training || existing?.training,
                notes: existing?.notes ? `${existing.notes}\n${input}` : input,
            };

            const { error: insertError } = await supabase
                .from('fitness_logs')
                .upsert(payload, { onConflict: 'user_id, date' });

            if (insertError) throw insertError;

            setSuccess(true);
            setInput('');
            onUpdate();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                    <Brain size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Registro Inteligente (IA)</h3>
            </div>

            <form onSubmit={handleLog} className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ej: 'Hoy pesé 82kg y comí un salmón con ensalada'..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] resize-none font-medium"
                />

                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                        <Mic size={20} />
                    </button>

                    <button
                        disabled={loading || !input.trim()}
                        className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20"
                    >
                        <CheckCircle2 size={48} className="mb-2" />
                        <p className="font-black uppercase tracking-widest text-sm text-center">¡Entendido! Registro procesado con éxito.</p>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold flex items-center gap-2"
                    >
                        <XCircle size={14} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
