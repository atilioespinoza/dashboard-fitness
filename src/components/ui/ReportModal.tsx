import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Target, Search, TrendingUp, AlertTriangle, Sparkles, Zap, Flame, Moon, Siren, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
        level: 'warning' | 'critical' | 'healthy';
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
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        setIsDownloading(true);
        try {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: isDarkMode ? '#020617' : '#f8fafc',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Reporte_Fitness_AI_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 border-x-0 md:border border-slate-200 dark:border-slate-800 rounded-none md:rounded-[2.5rem] shadow-2xl no-scrollbar flex flex-col"
                    >
                        {/* Mobile Safe Area Spacer for iPhone 15 Pro Notch/Island */}
                        <div className="h-20 md:hidden flex-shrink-0" />

                        {/* Floating Buttons Bar */}
                        <div className="fixed md:absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-[110]">
                            {report && !loading && (
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    className="p-2.5 md:p-3 rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 px-4 md:px-6 active:scale-95"
                                >
                                    <Download size={18} className={isDownloading ? 'animate-bounce' : ''} />
                                    <span className="text-xs font-black uppercase tracking-tight">
                                        {isDownloading ? 'Generando...' : (
                                            <>
                                                <span className="hidden md:inline">Descargar </span>PDF
                                            </>
                                        )}
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2.5 md:p-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors border border-slate-200/50 dark:border-white/5 shadow-sm active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-8 bg-slate-50 dark:bg-slate-950">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 border-b-4 border-blue-500 rounded-full"
                                    />
                                    <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={36} />
                                </div>
                                <div className="text-center px-8">
                                    <h3 className="text-slate-900 dark:text-white font-black text-2xl mb-3 tracking-tight">Deep Bio-Audit</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[250px] mx-auto leading-relaxed">Gemini 3.0 procesando tu biometría de alto rendimiento...</p>
                                </div>
                            </div>
                        ) : report ? (
                            <div ref={reportRef} className="flex-1 space-y-6 md:space-y-8 p-6 md:p-10 bg-slate-50 dark:bg-slate-950">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-200 dark:border-slate-800/50 pb-8">
                                    <div className="flex flex-col sm:flex-row items-center gap-5 w-full">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="p-3 md:p-4 bg-blue-600/10 dark:bg-blue-500/10 rounded-2xl md:rounded-[1.5rem] text-blue-600 dark:text-blue-500 flex-shrink-0">
                                                <Brain size={28} className="md:w-9 md:h-9" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] md:text-[10px] font-black text-blue-600/60 dark:text-blue-500/60 uppercase tracking-[0.2em] mb-0.5">Estrategia Biométrica</p>
                                                <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Reporte AI</h2>
                                            </div>
                                            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 p-2 md:p-3 rounded-xl md:rounded-2xl text-center min-w-[70px] md:min-w-[80px]">
                                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1">Score</p>
                                                <p className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{report.score}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metabolic Health Monitor */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row gap-6 items-center overflow-hidden transition-all shadow-sm ${report.metabolicRedAlert?.active
                                        ? report.metabolicRedAlert.level === 'critical'
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-emerald-600/10 border-emerald-500/30 dark:bg-emerald-500/5 dark:border-emerald-500/20 shadow-emerald-500/5'
                                        }`}
                                >
                                    <div className={`p-5 rounded-full flex-shrink-0 ${report.metabolicRedAlert?.active
                                        ? report.metabolicRedAlert.level === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
                                        : 'bg-emerald-500 text-white'
                                        } ${report.metabolicRedAlert?.active ? 'animate-pulse' : 'shadow-lg shadow-emerald-500/20'}`}>
                                        {report.metabolicRedAlert?.active ? <Siren size={30} /> : <TrendingUp size={30} />}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col items-center md:items-start gap-2 mb-3">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                                <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight ${report.metabolicRedAlert?.active
                                                    ? report.metabolicRedAlert.level === 'critical' ? 'text-red-500' : 'text-amber-500'
                                                    : 'text-emerald-600 dark:text-emerald-500'
                                                    }`}>
                                                    {report.metabolicRedAlert?.active ? report.metabolicRedAlert.title : 'Flujo Metabólico Optimo'}
                                                </h3>
                                                {!report.metabolicRedAlert?.active && (
                                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] md:text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
                                                        Perfecto
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-400 mb-5 italic leading-relaxed font-serif">
                                            "{report.metabolicRedAlert?.explanation || 'Sin interferencias detectadas en la ruta metabólica. Los sustratos energéticos se están oxidando al ritmo proyectado.'}"
                                        </p>
                                        <div className="p-4 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                                <Zap size={18} />
                                            </div>
                                            <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                                                Coach Insight: <span className="text-blue-600 dark:text-blue-400 font-black">{report.metabolicRedAlert?.recommendation || 'Mantén el déficit actual; tu capacidad de recuperación es alta hoy.'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Archetype Section */}
                                <motion.section
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-8 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent dark:from-blue-600/20 dark:to-purple-600/20 dark:via-transparent rounded-[2.5rem] border border-blue-500/20 relative overflow-hidden active:scale-[0.99] transition-transform"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-10 pointer-events-none hidden md:block">
                                        <span className="text-[10rem]">{report.archetype.emoji}</span>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 mb-6">
                                            <div className="text-4xl md:text-5xl bg-white dark:bg-white/5 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl shadow-blue-500/10 border border-white/50 dark:border-white/5 flex-shrink-0">{report.archetype.emoji}</div>
                                            <div className="text-center md:text-left">
                                                <p className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Tendencia de Comportamiento</p>
                                                <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white italic leading-tight break-words">{report.archetype.name}</h3>
                                            </div>
                                        </div>

                                        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-6 max-w-2xl leading-relaxed">
                                            {report.archetype.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {report.archetype.traits.map((trait, i) => (
                                                <span key={i} className="px-4 py-1.5 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-full text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 shadow-sm">
                                                    #{trait.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Golden Formula Section */}
                                <section className="p-6 md:p-8 bg-slate-100/80 dark:bg-slate-900 rounded-[2.5rem] border border-amber-500/30 relative overflow-hidden shadow-sm">
                                    <div className="relative z-10 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-500 shadow-inner">
                                                <Sparkles size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-none">The Golden Formula</h3>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tighter">Tu Receta Empírica del Éxito</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl italic font-serif">
                                            "{report.goldenFormula.explanation}"
                                        </p>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm hover:border-blue-500/30 transition-colors">
                                                <div className="p-2 bg-blue-500/10 rounded-xl mb-3"><Zap size={22} className="text-blue-600 dark:text-blue-400" /></div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Pasos</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{report.goldenFormula.steps.toLocaleString()}</p>
                                            </div>

                                            <div className="p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm hover:border-orange-500/30 transition-colors">
                                                <div className="p-2 bg-orange-500/10 rounded-xl mb-3"><Flame size={22} className="text-orange-600 dark:text-orange-400" /></div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Calorías</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{report.goldenFormula.calories}</p>
                                            </div>

                                            <div className="p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm hover:border-emerald-500/30 transition-colors">
                                                <div className="p-2 bg-emerald-500/10 rounded-xl mb-3"><Brain size={22} className="text-emerald-600 dark:text-emerald-400" /></div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Proteína</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{report.goldenFormula.protein}g</p>
                                            </div>

                                            <div className="p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm hover:border-indigo-500/30 transition-colors">
                                                <div className="p-2 bg-indigo-500/10 rounded-xl mb-3"><Moon size={22} className="text-indigo-600 dark:text-indigo-400" /></div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Sueño</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{report.goldenFormula.sleep}h</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Executive Summary */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest px-1">
                                        <TrendingUp size={18} />
                                        Directivas Estratégicas
                                    </div>
                                    <div className="p-6 md:p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner">
                                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base md:text-lg font-medium italic">
                                            "{report.executiveSummary}"
                                        </p>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                    {/* Projections */}
                                    <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                                                <Target size={18} className="md:w-5 md:h-5" />
                                                Simulador Cuántico
                                            </div>
                                            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase rounded border border-blue-500/10">V1.2</div>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mb-2 px-1">Escenario Proyectado</p>
                                                <p className="text-slate-800 dark:text-slate-200 font-black leading-snug text-sm">{report.projections.scenario}</p>
                                            </div>

                                            <div className="space-y-4">
                                                {report.projections.goals.map((goal, idx) => (
                                                    <div key={idx} className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 group transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-blue-600 dark:text-blue-500 font-black tracking-widest mb-1">{goal.name.toUpperCase()}</p>
                                                                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{goal.estimatedDate}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`text-[10px] font-black mb-1.5 px-2 py-1 rounded-lg inline-block border ${goal.probability > 80 ? 'text-green-700 bg-green-500/10 border-green-500/20 dark:text-green-400' :
                                                                    goal.probability > 60 ? 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400' :
                                                                        'text-red-700 bg-red-500/10 border-red-500/20 dark:text-red-400'
                                                                    }`}>
                                                                    {goal.probability}% PROB.
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 p-[1px]">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${goal.progress}%` }}
                                                                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full"
                                                            />
                                                        </div>

                                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-white/5 italic font-serif">
                                                            "{goal.analysis}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black">Probabilidad Global de éxito</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
                                                    <p className="text-2xl font-black text-green-600 dark:text-green-400 leading-none">{report.projections.overallProbability}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metabolic Analysis */}
                                    <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                                            <Brain size={18} className="md:w-5 md:h-5" />
                                            Deep Bio-Analysis
                                        </div>
                                        <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border-l-4 border-amber-500/40 relative">
                                            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic font-serif">
                                                {report.metabolicAnalysis}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                            <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-tighter mb-1">Nota del Consultor</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-snug">Los datos sugieren una alta eficiencia en la movilización de ácidos grasos durante las horas de sueño.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Blind Spots */}
                                <section className="p-6 md:p-8 bg-red-600/5 dark:bg-red-500/5 rounded-[2.5rem] border border-red-500/20 space-y-6">
                                    <div className="flex items-center gap-3 text-red-600 dark:text-red-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-1">
                                        <Search size={18} className="opacity-50 md:w-5 md:h-5" />
                                        Fugas Críticas & Puntos Ciegos
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {report.blindSpots.map((spot, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-white/50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-red-500/10 text-xs md:text-sm text-slate-800 dark:text-slate-300 hover:border-red-500/30 transition-colors shadow-sm dark:shadow-none">
                                                <div className="mt-0.5 p-1.5 bg-red-500/10 rounded-lg shrink-0">
                                                    <AlertTriangle size={14} className="text-red-500" />
                                                </div>
                                                <p className="font-bold leading-relaxed">{spot}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="pt-8 pb-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
                                    <div className="flex flex-col items-center gap-1.5 opacity-40 dark:opacity-50">
                                        <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-[0.4em] text-center">Generado por Gemini 3.0 Flash • Ultra High Precision Analytics</p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-[1px] bg-slate-400 w-8 md:w-16 rounded-full" />
                                            <Brain size={12} className="text-slate-400" />
                                            <div className="h-[1px] bg-slate-400 w-8 md:w-16 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Spacer for iOS Home Indicator (Dynamic Island / Gesture area) */}
                                <div className="h-12 md:hidden flex-shrink-0" />
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
