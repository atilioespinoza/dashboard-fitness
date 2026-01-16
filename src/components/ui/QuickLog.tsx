import { useState, useEffect, useCallback } from 'react';
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

    const fetchTodaySummary = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data: existing, error: fetchError } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing) {
                setSummary({
                    calories: existing.calories || 0,
                    protein: existing.protein || 0,
                    carbs: existing.carbs || 0,
                    fat: existing.fat || 0,
                    tdee: existing.tdee || 2000,
                    steps: existing.steps || 0
                });
            } else if (profile) {
                // Initial baseline if no log today
                const birthDate = new Date(profile.birth_date);
                const todayDate = new Date();
                let age = todayDate.getFullYear() - birthDate.getFullYear();
                if (todayDate.getMonth() < birthDate.getMonth() || (todayDate.getMonth() === birthDate.getMonth() && todayDate.getDate() < birthDate.getDate())) {
                    age--;
                }
                let bmr = (10 * 80) + (6.25 * profile.height) - (5 * age); // Fallback weight 80
                bmr += profile.gender === 'Masculino' ? 5 : -161;
                setSummary({
                    calories: 0, protein: 0, carbs: 0, fat: 0,
                    tdee: Math.round(bmr * 1.1),
                    steps: 0
                });
            }
        } catch (err) {
            console.error("Error fetching today's summary:", err);
        }
    }, [userId, profile]);

    useEffect(() => {
        fetchTodaySummary();
    }, [fetchTodaySummary]);

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

            // 1. Calculate cumulative data
            const currentWeight = aiData.weight ?? existing?.weight ?? 80;
            const totalSteps = aiData.steps_mode === 'set'
                ? (aiData.steps || 0)
                : (existing?.steps || 0) + (aiData.steps || 0);

            const getExistingExKcal = (notes: string = '') => {
                const match = notes.match(/\[ExKcal:\s*(\d+)\]/);
                return match ? parseInt(match[1]) : 0;
            };
            const totalExKcal = aiData.training_mode === 'set'
                ? (aiData.burned_calories || 0)
                : getExistingExKcal(existing?.notes) + (aiData.burned_calories || 0);

            // 2. Real Mifflin-St Jeor TDEE Calculation
            const calculateDynamicTDEE = (weight: number, steps: number, exKcal: number): number => {
                if (!profile) return 2000;

                const height = profile.height;
                const birthDate = new Date(profile.birth_date);
                const todayDate = new Date();
                let age = todayDate.getFullYear() - birthDate.getFullYear();
                const m = todayDate.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && todayDate.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Mifflin-St Jeor Equation (Base BMR)
                let bmr = (10 * weight) + (6.25 * height) - (5 * age);
                if (profile.gender === 'Masculino') {
                    bmr += 5;
                } else {
                    bmr -= 161;
                }

                const baseTdee = bmr * 1.1;
                const caloriePerStep = weight * 0.0005;
                const activityBonus = (steps * caloriePerStep) + exKcal;

                return Math.round(baseTdee + activityBonus);
            };

            const dayTDEE = calculateDynamicTDEE(currentWeight, totalSteps, totalExKcal);

            // 3. Construct payload
            const cleanNotes = (existing?.notes || '').replace(/\[ExKcal:\s*\d+\]/g, '').trim();
            const newNotes = `${cleanNotes}\n${input}\n[ExKcal: ${totalExKcal}]`.trim();

            const payload = {
                user_id: userId,
                date: today,
                weight: currentWeight,
                waist: aiData.waist ?? existing?.waist,
                body_fat: aiData.body_fat ?? existing?.body_fat,
                calories: aiData.nutrition_mode === 'set' ? (aiData.calories || 0) : (existing?.calories || 0) + (aiData.calories || 0),
                protein: aiData.nutrition_mode === 'set' ? (aiData.protein || 0) : (existing?.protein || 0) + (aiData.protein || 0),
                carbs: aiData.nutrition_mode === 'set' ? (aiData.carbs || 0) : (existing?.carbs || 0) + (aiData.carbs || 0),
                fat: aiData.nutrition_mode === 'set' ? (aiData.fat || 0) : (existing?.fat || 0) + (aiData.fat || 0),
                steps: totalSteps,
                sleep: aiData.sleep ?? existing?.sleep,
                training: aiData.training || existing?.training,
                tdee: dayTDEE,
                notes: newNotes,
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

            <div className="flex-1 space-y-4">
                {/* Always visible form */}
                <form
                    onSubmit={handleLog}
                    className="relative flex flex-col"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ej: 'Comí un tazón de avena con proteína'..."
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

                {/* Always visible or at least decoupled summary */}
                <AnimatePresence>
                    {summary && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Progreso del Día</h4>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                                    <MetricRow label="Calorías" value={summary.calories} goal={2000} unit="kcal" type="max" />
                                    <MetricRow label="Proteína" value={summary.protein} goal={140} unit="g" type="min" />
                                    <MetricRow label="Pasos" value={summary.steps} goal={12000} unit="pts" type="min" />
                                    <MetricRow label="Balance" value={summary.calories - summary.tdee} goal={0} unit="kcal" type="range" />
                                </div>

                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">TDEE: {summary.tdee} kcal | Ingerido: {summary.calories} kcal</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-black italic ${summary.calories <= summary.tdee ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {summary.calories - summary.tdee > 0 ? '+' : ''}{Math.round(summary.calories - summary.tdee)} kcal
                                            </p>
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
