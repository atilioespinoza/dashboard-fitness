import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Target, Search, TrendingUp, AlertTriangle } from 'lucide-react';

interface FullReport {
    executiveSummary: string;
    blindSpots: string[];
    projections: {
        scenario: string;
        estimatedDate: string;
        probability: number;
    };
    metabolicAnalysis: string;
    score: number;
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
                                <p className="text-slate-400 font-medium animate-pulse">Gemini 2.0 procesando auditoría profunda...</p>
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
                                                <p className="text-slate-200 font-bold">{report.projections.scenario}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Meta Estimada</p>
                                                    <p className="text-xl font-black text-white">{report.projections.estimatedDate}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Probabilidad</p>
                                                    <p className="text-xl font-black text-green-400">{report.projections.probability}%</p>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${report.projections.probability}%` }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-green-400"
                                                />
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
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Generado por Gemini 2.0 Flash • Análisis de Alta Precisión</p>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
