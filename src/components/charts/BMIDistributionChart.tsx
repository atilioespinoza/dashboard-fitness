import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { UserProfile } from '../../hooks/useProfile';
import { TrendingDown, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

interface BMIDistributionChartProps {
    data: FitnessEntry[];
    profile: UserProfile | null;
}

export const BMIDistributionChart: React.FC<BMIDistributionChartProps> = ({ data, profile }) => {
    const heightCm = profile?.height || 179;
    const heightM = heightCm / 100;

    const sortedData = [...data].sort((a, b) => a.Date.localeCompare(b.Date));
    const weights = data.map(d => d.Weight);
    const maxWeightEver = weights.length > 0 ? Math.max(...weights) : 94;
    const initialWeight = maxWeightEver > 90 ? maxWeightEver : 94;

    const currentWeight = sortedData[sortedData.length - 1]?.Weight || 81;
    const initialBMI = Number((initialWeight / (heightM * heightM)).toFixed(1));
    const currentBMI = Number((currentWeight / (heightM * heightM)).toFixed(1));

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-500', bg: 'bg-blue-500', status: 'warning' };
        if (bmi < 25) return { label: 'Saludable', color: 'text-emerald-500', bg: 'bg-emerald-500', status: 'success' };
        if (bmi < 30) return { label: 'Sobrepeso', color: 'text-orange-500', bg: 'bg-orange-500', status: 'warning' };
        return { label: 'Obesidad', color: 'text-red-500', bg: 'bg-red-500', status: 'danger' };
    };

    const currentCat = getBMICategory(currentBMI);
    const totalImprovement = (initialBMI - currentBMI).toFixed(1);

    // Calculate marker position percentage (from BMI 15 to 40)
    const minBMI = 15;
    const maxBMI = 40;
    const position = Math.min(Math.max(((currentBMI - minBMI) / (maxBMI - minBMI)) * 100, 0), 100);

    return (
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />

            <CardHeader className="pb-2 pt-8 px-8 relative z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                            Análisis IMC
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                            Indicador de Composición Corporal
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${currentCat.status === 'success'
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-orange-500/5 border-orange-500/10 text-orange-600'
                        }`}>
                        {currentCat.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span className="text-xs font-black uppercase tracking-widest">{currentCat.label}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 relative z-10">
                {/* IMC Principal */}
                <div className="flex flex-col md:flex-row items-end gap-6 mb-12">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-7xl font-black italic tracking-tighter ${currentCat.color}`}>
                            {currentBMI}
                        </span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Puntos</span>
                    </div>

                    <div className="flex-1 pb-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            Has mejorado <span className="text-blue-500 font-black">-{totalImprovement}</span> puntos desde tu inicio ({initialBMI}).
                            Tu peso ideal se encuentra entre 18.5 y 24.9.
                        </p>
                    </div>
                </div>

                {/* Health Scale Bar */}
                <div className="relative pt-8 pb-12 w-full">
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50 dark:border-white/5">
                        <div className="h-full bg-blue-400/40" style={{ width: '14%' }} /> {/* Underweight < 18.5 */}
                        <div className="h-full bg-emerald-400" style={{ width: '26%' }} /> {/* Normal 18.5-25 */}
                        <div className="h-full bg-orange-400" style={{ width: '20%' }} /> {/* Overweight 25-30 */}
                        <div className="h-full bg-red-400/40 flex-1" /> {/* Obesity > 30 */}
                    </div>

                    {/* Cursor / Marker */}
                    <div
                        className="absolute top-6 transition-all duration-1000 ease-out"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                        <div className="flex flex-col items-center">
                            <div className={`w-1 h-8 rounded-full shadow-lg ${currentCat.bg}`} />
                            <div className={`mt-2 px-3 py-1 rounded-lg text-[10px] font-black text-white shadow-xl ${currentCat.bg} transform hover:scale-110 transition-transform cursor-default whitespace-nowrap`}>
                                TU NIVEL: {currentBMI}
                            </div>
                        </div>
                    </div>

                    {/* Scale Labels */}
                    <div className="mt-8 flex justify-between px-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">15 (Bajo)</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">25 (Límite)</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">40 (Obeso)</span>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group/stat hover:bg-white dark:hover:bg-slate-900 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inicio</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white italic">{initialBMI}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group/stat hover:bg-white dark:hover:bg-slate-900 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mejora</p>
                        <div className="flex items-center gap-1">
                            <TrendingDown size={14} className="text-blue-500" />
                            <p className="text-xl font-black text-blue-500 italic">-{totalImprovement}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group/stat hover:bg-white dark:hover:bg-slate-900 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Meta</p>
                        <p className="text-xl font-black text-emerald-500 italic">22.5</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group/stat hover:bg-white dark:hover:bg-slate-900 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rendimiento</p>
                        <div className="flex items-center gap-1">
                            <Activity size={14} className="text-slate-400" />
                            <p className="text-base font-black text-slate-900 dark:text-white">TOP 10%</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
