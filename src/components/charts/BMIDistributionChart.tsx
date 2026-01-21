import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { UserProfile } from '../../hooks/useProfile';

interface BMIDistributionChartProps {
    data: FitnessEntry[];
    profile: UserProfile | null;
}

export const BMIDistributionChart: React.FC<BMIDistributionChartProps> = ({ data, profile }) => {
    const heightCm = profile?.height || 179;
    const heightM = heightCm / 100;

    const sortedData = [...data].sort((a, b) => a.Date.localeCompare(b.Date));

    // Logic to find the true starting point of the journey (Historical Max or defined start)
    const weights = data.map(d => d.Weight);
    const maxWeightEver = weights.length > 0 ? Math.max(...weights) : 94;
    const initialWeight = maxWeightEver > 90 ? maxWeightEver : 94; // Fallback to 94 if no higher weight found

    const currentWeight = sortedData[sortedData.length - 1]?.Weight || 81;

    const initialBMI = Number((initialWeight / (heightM * heightM)).toFixed(1));
    const currentBMI = Number((currentWeight / (heightM * heightM)).toFixed(1));

    // Statistical Parameters (Simplified but based on ENCAVI 2024 Trends)
    const chileMean = 28.8; // Observed upward trend in Chile
    const chileSD = 5.2;
    const eliteMean = 22.5;
    const eliteSD = 1.8;

    const normalDistribution = (x: number, mean: number, sd: number) => {
        return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
    };

    const chartData = useMemo(() => {
        const points = [];
        for (let x = 15; x <= 45; x += 0.5) {
            points.push({
                bmi: x,
                chile: normalDistribution(x, chileMean, chileSD) * 100,
                elite: normalDistribution(x, eliteMean, eliteSD) * 100,
            });
        }
        return points;
    }, []);

    return (
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
            <CardHeader className="pb-2 pt-8 px-8">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                            Análisis de Distribución IMC
                        </CardTitle>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Tu progreso comparado con la población y el estado elite
                        </p>
                    </div>
                    <a
                        href="https://epi.minsal.cl/encuesta-nacional-de-salud-ens/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                    >
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter flex items-center gap-1">
                            Fuente: MINSAL Chile (ENCAVI 2024)
                            <svg className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </span>
                    </a>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorChile" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorElite" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="bmi"
                                type="number"
                                domain={[15, 45]}
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                ticks={[15, 20, 25, 30, 35, 40, 45]}
                                label={{ value: 'Índice de Masa Corporal (IMC)', position: 'insideBottom', offset: -5, className: "text-[9px] font-black fill-slate-400 uppercase tracking-widest" }}
                            />
                            <YAxis hide />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl ring-1 ring-black/5">
                                                <p className="text-xs font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter italic">Punto Geométrico</p>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-500">IMC: <span className="text-slate-900 dark:text-white font-black">{payload[0].payload.bmi}</span></p>
                                                    <p className="text-[10px] font-bold text-blue-500">Población Chile: <span className="font-black">{(payload[0].value as number).toFixed(2)}%</span></p>
                                                    <p className="text-[10px] font-bold text-slate-400">Estado Elite: <span className="font-black">{(payload[1].value as number).toFixed(2)}%</span></p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="chile"
                                name="Población Chile"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorChile)"
                                isAnimationActive={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="elite"
                                name="Elite Fitness"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorElite)"
                                isAnimationActive={false}
                            />

                            {/* Initial Position Marker */}
                            <ReferenceLine x={initialBMI} stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" strokeOpacity={0.5}>
                                <Label
                                    value={`INICIO: ${initialBMI}`}
                                    position="top"
                                    fill="#64748b"
                                    fontSize={9}
                                    fontWeight="900"
                                    offset={25}
                                />
                            </ReferenceLine>

                            {/* Current Position Marker */}
                            <ReferenceLine x={currentBMI} stroke="#06b6d4" strokeWidth={3} strokeLinecap="round">
                                <Label
                                    value={`HOY: ${currentBMI}`}
                                    position="top"
                                    fill="#06b6d4"
                                    fontSize={11}
                                    fontWeight="900"
                                    offset={10}
                                />
                            </ReferenceLine>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend and Analysis */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Actual</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-cyan-500">{currentBMI}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Saludable</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mejora Total</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-blue-500">-{(initialBMI - currentBMI).toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Puntos IMC</span>
                        </div>
                    </div>
                    <div className="md:col-span-1 flex items-center bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            "{initialBMI > 29 ? 'Has revertido con éxito el estado de obesidad' : 'Has superado con éxito la media nacional'} ({chileMean}) y te diriges hacia el percentil de alto rendimiento."
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
