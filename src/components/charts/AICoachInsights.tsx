import { useAICoach, Insight } from '../../hooks/useAICoach';
import { FitnessEntry } from '../../data/mockData';
import { Bot, Sparkles, TrendingDown, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AICoachInsightsProps {
    data: FitnessEntry[];
}

const InsightCard = ({ insight, index }: { insight: Insight, index: number }) => {
    const icons = {
        positive: { icon: Sparkles, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    };

    const config = icons[insight.type as keyof typeof icons] || icons.info;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${config.bg} ${config.border} flex flex-col gap-2 min-w-[280px] md:min-w-0`}
        >
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-900 ${config.color}`}>
                    <Icon size={16} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none">{insight.title}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {insight.message}
            </p>
        </motion.div>
    );
};

export const AICoachInsights = ({ data }: AICoachInsightsProps) => {
    const { insights, loading, isAI } = useAICoach(data);

    if (!loading && insights.length === 0) return null;

    return (
        <div className="bg-slate-900 dark:bg-blue-600/5 rounded-3xl p-6 border border-slate-800 dark:border-blue-500/20 shadow-xl overflow-hidden relative group">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 animate-pulse rounded-full" />
                            <div className="relative p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                <Bot size={24} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                AI Fitness Coach
                                {isAI ? (
                                    <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-[10px] uppercase font-bold tracking-widest rounded-full border border-purple-500/30">
                                        Gemini 3 Powered
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest rounded-full border border-blue-500/30">
                                        Local Heuristics
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-slate-400">
                                {loading ? "Generando análisis inteligente..." : "Análisis inteligente de tus tendencias diarias"}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {insights.map((insight, idx) => (
                            <InsightCard key={idx} insight={insight} index={idx} />
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            <TrendingDown size={14} className="text-blue-500" />
                            {isAI ? "Análisis cognitivo profundo" : "Basado en reglas heurísticas"}
                        </div>
                        <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group/btn">
                            Ver análisis detallado
                            <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
