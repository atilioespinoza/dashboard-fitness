import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Target, Search, TrendingUp, AlertTriangle, Sparkles, Zap, Flame, Moon, Siren } from 'lucide-react';

interface FullReport {
    executiveSummary: string;
    blindSpots: string[];
    projections: {
        scenario: string;
        goals: Array<{
            name: string;
            estimatedDate: string;
            progress: number;
            probability: number;
            analysis: string;
        }>;
        overallProbability: number;
    };
    metabolicAnalysis: string;
    score: number;
    archetype: {
        name: string;
        emoji: string;
        description: string;
        traits: string[];
    };
    goldenFormula: {
        explanation: string;
        steps: number;
        calories: number;
        protein: number;
        sleep: number;
    };
    metabolicRedAlert?: {
        active: boolean;
        level: 'warning' | 'critical';
        title: string;
        explanation: string;
        recommendation: string;
    };
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: FullReport | null;
    loading: boolean;
}

export const ReportModal = ({ isOpen, onClose, report, loading }: ReportModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-6 md:p-10 no-scrollbar"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                    <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} />
                                </div>
                                <p className="text-slate-400 font-medium animate-pulse">Gemini 3.0 procesando auditoría profunda...</p>
                            </div>
                        ) : report ? (
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                        <Brain size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Reporte Estratégico AI</h2>
                                        <p className="text-slate-500 text-sm">Auditoría Metabólica y Proyecciones Avanzadas</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Consistencia</p>
                                            <p className="text-2xl font-black text-blue-400">{report.score}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metabolic Red-Alert */}
                                {report.metabolicRedAlert?.active && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className={`p-6 rounded-[2rem] border-2 flex flex-col md:flex-row gap-6 items-center overflow-hidden ${report.metabolicRedAlert.level === 'critical'
                                                ? 'bg-red-500/10 border-red-500/30'
                                                : 'bg-amber-500/10 border-amber-500/30'
                                            }`}
                                    >
                                        <div className={`p-4 rounded-full ${report.metabolicRedAlert.level === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
                                            } animate-pulse`}>
                                            <Siren size={32} />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${report.metabolicRedAlert.level === 'critical' ? 'text-red-500' : 'text-amber-500'
                                                }`}>
                                                {report.metabolicRedAlert.title}
                                            </h3>
                                            <p className="text-sm text-slate-300 mb-4 italic">
                                                "{report.metabolicRedAlert.explanation}"
                                            </p>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                                <Zap size={16} className="text-blue-400" />
                                                <p className="text-sm font-bold text-white">
                                                    Acción Sugerida: <span className="text-blue-400">{report.metabolicRedAlert.recommendation}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Archetype Section */}
                                <motion.section
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[2rem] border border-blue-500/20 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <span className="text-8xl">{report.archetype.emoji}</span>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-4xl">{report.archetype.emoji}</span>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Tu Perfil Genético-Conductual</p>
                                                <h3 className="text-2xl font-black text-white italic">{report.archetype.name}</h3>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-300 mb-4 max-w-2xl leading-relaxed">
                                            {report.archetype.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {report.archetype.traits.map((trait, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/5">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Golden Formula Section */}
                                <section className="p-6 bg-slate-800/20 rounded-[2rem] border border-amber-500/10 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 opacity-5">
                                        <Sparkles size={120} className="text-amber-500" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                                <Sparkles size={16} />
                                            </div>
                                            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">The Golden Formula: Tu Receta del Éxito</h3>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-xl">
                                            {report.goldenFormula.explanation}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                                                <Zap size={20} className="text-blue-400 mb-2" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Pasos Diarios</p>
                                                <p className="text-lg font-black text-white">{report.goldenFormula.steps.toLocaleString()}</p>
                                            </div>

                                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                                                <Flame size={20} className="text-orange-400 mb-2" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Calorías</p>
                                                <p className="text-lg font-black text-white">{report.goldenFormula.calories} kcal</p>
                                            </div>

                                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                                                <Brain size={20} className="text-emerald-400 mb-2" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Proteína</p>
                                                <p className="text-lg font-black text-white">{report.goldenFormula.protein}g</p>
                                            </div>

                                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                                                <Moon size={20} className="text-indigo-400 mb-2" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Sueño Ideal</p>
                                                <p className="text-lg font-black text-white">{report.goldenFormula.sleep}h</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Executive Summary */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-2 text-blue-400 text-sm font-black uppercase tracking-widest">
                                        <TrendingUp size={16} />
                                        Resumen Ejecutivo
                                    </div>
                                    <p className="text-slate-300 leading-relaxed text-lg italic">
                                        "{report.executiveSummary}"
                                    </p>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Projections */}
                                    <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 space-y-4">
                                        <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest">
                                            <Target size={16} />
                                            Simulador de Metas
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">Escenario Actual</p>
                                                <p className="text-slate-200 font-bold leading-tight">{report.projections.scenario}</p>
                                            </div>

                                            <div className="space-y-4">
                                                {report.projections.goals.map((goal, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-0.5">{goal.name}</p>
                                                                <p className="text-base font-black text-white">{goal.estimatedDate}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <span className={`text-xs font-black mb-1 p-1 rounded-md ${goal.probability > 80 ? 'text-green-400 bg-green-400/10' :
                                                                        goal.probability > 60 ? 'text-amber-400 bg-amber-400/10' :
                                                                            'text-red-400 bg-red-400/10'
                                                                        }`}>
                                                                        {goal.probability}% Prob.
                                                                    </span>
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Progreso: {goal.progress}%</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${goal.progress}%` }}
                                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                                            />
                                                        </div>

                                                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-2 rounded-lg border border-white/5 italic">
                                                            "{goal.analysis}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-700/30 mt-4">
                                                <p className="text-[10px] text-slate-500 uppercase font-black">Probabilidad Global de éxito</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <p className="text-lg font-black text-green-400">{report.projections.overallProbability}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metabolic Analysis */}
                                    <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 space-y-4">
                                        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
                                            <Brain size={16} />
                                            Análisis Metabólico
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {report.metabolicAnalysis}
                                        </p>
                                    </div>
                                </div>

                                {/* Blind Spots */}
                                <section className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 space-y-4">
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest">
                                        <Search size={16} />
                                        Puntos Ciegos y Fugas Cinéticas
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {report.blindSpots.map((spot, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                <AlertTriangle size={14} className="mt-1 text-red-500/50 flex-shrink-0" />
                                                {spot}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="pt-4 border-t border-slate-800 flex justify-center">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Generado por Gemini 3.0 Flash • Análisis de Alta Precisión</p>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
