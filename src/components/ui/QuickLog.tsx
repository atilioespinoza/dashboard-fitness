import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { parseFitnessEntry } from '../../lib/gemini';
import { Brain, Send, Loader2, XCircle, Mic, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

import { UserProfile } from '../../hooks/useProfile';

interface DailySummary {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    tdee: number;
    steps: number;
    bmr: number;
    activeKcal: number;
}

export function QuickLog({ userId, onUpdate, profile }: { userId: string, onUpdate: () => void, profile: UserProfile | null }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<DailySummary>({
        calories: 0, protein: 0, carbs: 0, fat: 0,
        tdee: 2000, steps: 0, bmr: 1600, activeKcal: 400
    });
    const [error, setError] = useState<string | null>(null);

    const { isListening, startListening, stopListening } = useSpeechRecognition((text) => {
        setInput(prev => prev ? `${prev} ${text}` : text);
    });

    const getLocalToday = useCallback(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const getDailyMetrics = useCallback((weight: number, steps: number, exKcal: number) => {
        const caloriePerStep = weight * 0.0005;
        const stepsBonus = steps * caloriePerStep;

        // Better defaults if no profile (using the weighted formulas but with standard height/age)
        const h = profile?.height || 170;
        const a = profile ? (() => {
            const birth = new Date(profile.birth_date);
            const now = new Date();
            let age = now.getFullYear() - birth.getFullYear();
            if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
            return age;
        })() : 35;
        const g = profile?.gender || 'Masculino';

        let bmrValue = (10 * weight) + (6.25 * h) - (5 * a);
        bmrValue += g === 'Masculino' ? 5 : -161;

        const baseTdee = bmrValue * 1.1;
        const totalActive = (baseTdee - bmrValue) + stepsBonus + exKcal;
        const finalTdee = bmrValue + totalActive;

        return {
            bmr: Math.round(bmrValue),
            activeKcal: Math.round(totalActive),
            tdee: Math.round(finalTdee)
        };
    }, [profile]);

    const fetchTodaySummary = useCallback(async () => {
        try {
            const today = getLocalToday();
            const { data: existing, error: fetchError } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .maybeSingle();

            console.log(`Supabase fetch for userId: ${userId}, date: ${today}. Found existing: ${!!existing}`);
            if (fetchError) throw fetchError;

            const getExistingExKcal = (notes: string | null) => {
                const match = (notes || '').match(/\[ExKcal:\s*(\d+)\]/);
                return match ? parseInt(match[1]) : 0;
            };

            if (existing) {
                console.log("Found existing record for today:", existing);
                const metrics = getDailyMetrics(existing.weight || 80, existing.steps || 0, getExistingExKcal(existing.notes));
                setSummary({
                    calories: existing.calories || 0,
                    protein: existing.protein || 0,
                    carbs: existing.carbs || 0,
                    fat: existing.fat || 0,
                    tdee: existing.tdee || metrics.tdee,
                    steps: existing.steps || 0,
                    bmr: metrics.bmr,
                    activeKcal: metrics.activeKcal
                });
            } else {
                const metrics = getDailyMetrics(80, 0, 0);
                setSummary({
                    calories: 0, protein: 0, carbs: 0, fat: 0,
                    tdee: metrics.tdee,
                    steps: 0,
                    bmr: metrics.bmr,
                    activeKcal: metrics.activeKcal
                });
            }
        } catch (err: any) {
            console.error("Error fetching today's summary:", err);
            if (err.message?.includes('401') || err.code === '401') {
                setError("Tu sesión ha expirado. Por favor, sal y vuelve a entrar.");
            }
        }
    }, [userId, profile, getDailyMetrics, getLocalToday]);

    useEffect(() => {
        fetchTodaySummary();
    }, [fetchTodaySummary]);

    // Add Realtime subscription to update Progress card when external changes (like Siri) occur
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel('quick-log-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'fitness_logs',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('[QuickLog] Cambio detectado en DB:', payload);
                    fetchTodaySummary();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchTodaySummary]);

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const aiData = await parseFitnessEntry(input);
            if (!aiData) throw new Error("No pudimos procesar el registro.");

            const today = getLocalToday();
            const { data: existing, error: fetchError } = await supabase
                .from('fitness_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .maybeSingle();

            if (fetchError) console.error("Error fetching existing log:", fetchError);

            const currentWeight = aiData.weight ?? existing?.weight ?? 80;
            const totalSteps = (existing?.steps || 0) + (aiData.steps || 0);

            const getExistingExKcal = (notes: string | null) => {
                const match = (notes || '').match(/\[ExKcal:\s*(\d+)\]/);
                return match ? parseInt(match[1]) : 0;
            };
            const totalExKcal = getExistingExKcal(existing?.notes) + (aiData.burned_calories || 0);

            const metrics = getDailyMetrics(currentWeight, totalSteps, totalExKcal);

            const cleanNotes = (existing?.notes || '').replace(/\[ExKcal:\s*\d+\]/g, '').trim();
            const newNotes = `${cleanNotes}\n${input}\n[ExKcal: ${totalExKcal}]`.trim();

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
                tdee: metrics.tdee,
                notes: newNotes,
            };

            const { error: insertError } = await supabase
                .from('fitness_logs')
                .upsert(payload, { onConflict: 'user_id, date' });

            if (insertError) throw insertError;

            // 4. Save individual event for history
            await supabase.from('log_events').insert({
                user_id: userId,
                date: today,
                raw_text: input,
                parsed_data: aiData,
                type: 'text'
            });

            setSummary({
                calories: payload.calories,
                protein: payload.protein,
                carbs: payload.carbs,
                fat: payload.fat,
                tdee: metrics.tdee,
                steps: payload.steps || 0,
                bmr: metrics.bmr,
                activeKcal: metrics.activeKcal
            });

            setInput('');
            setTimeout(() => onUpdate(), 500);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group min-h-[300px] flex flex-col transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                    <Brain size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Registro Inteligente (IA)</h3>
            </div>

            <div className="flex-1 space-y-4">
                <form onSubmit={handleLog} className="relative flex flex-col">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ej: 'Comí un tazón de avena con proteína'..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px] resize-none font-medium"
                    />

                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                isListening
                                    ? "bg-red-500/10 text-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/20"
                                    : "text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                            title={isListening ? "Detener micrófono" : "Grabar voz"}
                        >
                            <Mic size={20} className={isListening ? "scale-110" : ""} />
                        </button>

                        <button
                            disabled={loading || !input.trim()}
                            className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </form>

                <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Progreso del Día</h4>
                            <button
                                onClick={(e) => { e.preventDefault(); fetchTodaySummary(); }}
                                className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                title="Actualizar datos"
                            >
                                <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize">
                            {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 mb-3">
                        <MetricRow label="Calorías" value={summary.calories} goal={summary.tdee} unit="kcal" type="max" />
                        <MetricRow label="Proteína" value={summary.protein} goal={140} unit="g" type="min" />
                        <MetricRow label="Pasos" value={summary.steps} goal={profile?.target_steps || 8000} unit="pts" type="min" />
                        <MetricRow label="Grasas" value={summary.fat} goal={75} unit="g" type="max" />
                        <MetricRow label="Carbos" value={summary.carbs} goal={170} unit="g" type="max" />
                        <MetricRow label="Gasto Act." value={summary.activeKcal} unit="kcal" />
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <span>BMR: {summary.bmr}</span>
                                    <span>+</span>
                                    <span className="text-blue-500">ACT: {summary.activeKcal}</span>
                                    <span>=</span>
                                    <span className="text-slate-600 dark:text-slate-200">TDEE: {summary.tdee}</span>
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                                    Ingerido: <span className="text-slate-700 dark:text-white">{summary.calories} kcal</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-base font-black italic tracking-tighter leading-none ${summary.calories <= summary.tdee ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {summary.calories - summary.tdee > 0 ? '+' : ''}{Math.round(summary.calories - summary.tdee)}
                                    <span className="text-[10px] ml-0.5 font-black not-italic uppercase opacity-70">kcal</span>
                                </p>
                                <p className="text-[7px] font-black uppercase tracking-tighter text-slate-400">Balance Neto</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
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

function MetricRow({ label, value, goal, unit }: { label: string, value: number, goal?: number, unit: string, type?: 'max' | 'min' | 'range' }) {
    const isOk = goal ? (value <= goal) : true;

    return (
        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-0.5">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                {goal && (isOk ? <div className="w-1 h-1 rounded-full bg-emerald-500" /> : <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />)}
            </div>
            <div className="flex items-baseline gap-0.5">
                <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none whitespace-nowrap">{Math.round(value)}</span>
                <span className="text-[6px] font-bold text-slate-400 uppercase">{unit}</span>
            </div>
        </div>
    );
}
