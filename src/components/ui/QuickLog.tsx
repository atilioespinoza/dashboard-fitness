import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { parseFitnessEntry } from '../../lib/gemini';
import { Brain, Send, Loader2, CheckCircle2, XCircle, Mic, Zap, TrendingDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserProfile } from '../../hooks/useProfile';

interface DailySummary {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    tdee: number;
    steps: number;
}

export function QuickLog({ userId, onUpdate, profile }: { userId: string, onUpdate: () => void, profile: UserProfile | null }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const aiData = await parseFitnessEntry(input);
            if (!aiData) throw new Error("No pudimos procesar el registro. Intenta ser más específico.");

            const today = new Date().toISOString().split('T')[0];
            const { data: existing, error: fetchError } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .maybeSingle();

            if (fetchError) console.error("Error fetching existing log:", fetchError);

            // 1. Calculate weight and steps first
            const currentWeight = aiData.weight ?? existing?.weight ?? 80;
            const totalSteps = (existing?.steps || 0) + (aiData.steps || 0);

            // 2. Calculate TDEE using current weight + Step Bonus
            const calculateDynamicTDEE = (weight: number, steps: number): number => {
                if (!profile) return 2600;

                const height = profile.height;
                const age = new Date().getFullYear() - new Date(profile.birth_date).getFullYear();

                // Mifflin-St Jeor Equation
                let bmr = (10 * weight) + (6.25 * height) - (5 * age);
                bmr += profile.gender === 'Masculino' ? 5 : -161;

                const activityFactors: { [key: string]: number } = {
                    sedentary: 1.2,
                    lightly_active: 1.3,
                    moderately_active: 1.4,
                    very_active: 1.5,
                    extra_active: 1.6
                };

                const baseTdee = bmr * activityFactors[profile.activity_level];
                const stepBonus = steps * 0.045; // ~45 kcal per 1000 steps

                return Math.round(baseTdee + stepBonus);
            };

            const dayTDEE = calculateDynamicTDEE(currentWeight, totalSteps);

            // 3. Construct payload
            const payload = {
                user_id: userId,
                date: today,
                weight: currentWeight,
                waist: aiData.waist ?? existing?.waist,
                body_fat: aiData.body_fat ?? existing?.body_fat,
                calories: (existing?.calories || 0) + (aiData.calories || 0),
                protein: (existing?.protein || 0) + (aiData.protein || 0),
                carbs: (existing?.carbs || 0) + (aiData.carbs || 0),
                fat: (existing?.fat || 0) + (aiData.fat || 0),
                steps: totalSteps,
                sleep: aiData.sleep ?? existing?.sleep,
                training: aiData.training || existing?.training,
                tdee: dayTDEE,
                notes: existing?.notes ? `${existing.notes}\n${input}` : input,
            };

            const { error: insertError } = await supabase
                .from('fitness_logs')
                .upsert(payload, { onConflict: 'user_id, date' });

            if (insertError) throw insertError;

            setSummary({
                calories: payload.calories,
                protein: payload.protein,
                carbs: payload.carbs,
                fat: payload.fat,
                tdee: dayTDEE,
                steps: payload.steps || 0
            });

            setInput('');

            setTimeout(() => {
                onUpdate();
            }, 500);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group min-h-[260px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                    <Brain size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Registro Inteligente (IA)</h3>
            </div>

            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    {!summary ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleLog}
                            className="h-full flex flex-col"
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ej: 'Comí un tazón de avena con proteína'..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all flex-1 resize-none font-medium"
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
                        </motion.form>
                    ) : (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Resumen del Día</h4>
                                </div>
                                <button
                                    onClick={() => setSummary(null)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm"
                                >
                                    <X size={14} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-3 overflow-y-auto pr-1 scrollbar-hide">
                                <div className="grid grid-cols-2 gap-2">
                                    <MetricRow label="Calorías" value={summary.calories} goal={2000} unit="kcal" type="max" />
                                    <MetricRow label="Proteína" value={summary.protein} goal={140} unit="g" type="min" />
                                    <MetricRow label="Grasas" value={summary.fat} goal={75} unit="g" type="max" />
                                    <MetricRow label="Carbos" value={summary.carbs} goal={170} unit="g" type="range" />
                                </div>

                                <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={14} className="text-amber-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Balance Energético</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">TDEE: {summary.tdee} kcal</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">Ingerido: {summary.calories} kcal</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black italic ${summary.calories < summary.tdee ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {summary.calories - summary.tdee > 0 ? '+' : ''}{Math.round(summary.calories - summary.tdee)} kcal
                                            </p>
                                            <p className="text-[7px] font-black uppercase tracking-tighter text-slate-500">Estado Actual</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
            </div>
        </div>
    );
}

function MetricRow({ label, value, goal, unit, type }: { label: string, value: number, goal: number, unit: string, type: 'max' | 'min' | 'range' }) {
    const isOk = type === 'max' ? value <= goal : value >= goal;

    return (
        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                {isOk ? <CheckCircle2 size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-amber-500" />}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{Math.round(value)}</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase">{unit}</span>
            </div>
            <div className="mt-1">
                <span className="text-[7px] font-bold text-slate-400 uppercase italic">Meta: {goal}{unit}</span>
            </div>
        </div>
    );
}
