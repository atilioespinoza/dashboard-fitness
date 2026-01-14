import { useAICoach, Insight } from '../../hooks/useAICoach';
import { FitnessEntry } from '../../data/mockData';
import { Bot, Sparkles, AlertCircle, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AICoachInsightsProps {
    data: FitnessEntry[];
}

const InsightCard = ({ insight }: { insight: Insight }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
            onClick={() => setIsExpanded(!isExpanded)}
            className={`cursor-pointer group relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 ${config.bg} ${config.border} hover:border-white/20`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${config.color}`}>
                        <Icon size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {insight.title}
                    </h4>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-slate-400 group-hover:text-white"
                >
                    <ChevronDown size={16} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                            {insight.message}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const AICoachInsights = ({ data }: AICoachInsightsProps) => {
    const { insights, loading, isAI } = useAICoach(data);

    if (!loading && insights.length === 0) return null;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden relative group transition-colors duration-500">
            {/* Background Aesthetic Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg">
                                <Bot size={28} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    AI Fitness Coach
                                </h2>
                                {isAI && (
                                    <div className="hidden xs:flex px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[9px] uppercase font-black tracking-tighter rounded-full border border-purple-500/20 backdrop-blur-md">
                                        Gemini 3 Pro
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {loading ? "Analizando tu progreso..." : "Briefing de inteligencia diaria"}
                            </p>
                        </div>
                    </div>

                    {/* Badge for Mobile (Dynamic positioning) */}
                    {isAI && (
                        <div className="xs:hidden self-start px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] uppercase font-black tracking-widest rounded-full border border-purple-500/20">
                            Powered by Gemini 3
                        </div>
                    )}
                </div>

                {/* Insights List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-slate-200/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 animate-pulse" />
                        ))
                    ) : (
                        insights.map((insight, idx) => (
                            <InsightCard key={idx} insight={insight} />
                        ))
                    )}
                </div>

                {/* Footer Info */}
                {!loading && (
                    <div className="pt-2 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">
                            {isAI ? "Análisis cognitivo activo" : "Motor heurístico local"}
                        </div>
                        <button className="w-full xs:w-auto px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-blue-400 transition-all flex items-center justify-center gap-2 group/btn">
                            Ver reporte completo
                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
