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
    const initialWeight = sortedData[0]?.Weight || 94;
    const currentWeight = sortedData[sortedData.length - 1]?.Weight || 81;

    const initialBMI = Number((initialWeight / (heightM * heightM)).toFixed(1));
    const currentBMI = Number((currentWeight / (heightM * heightM)).toFixed(1));

    // Statistical Parameters (Encuesta Nacional de Salud Chile 2017 & Fitness Standards)
    const chileMean = 28.5;
    const chileSD = 5.0;
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
                chile: normalDistribution(x, chileMean, chileSD) * 100, // scaled for visibility
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
                    <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                            Fuente: ENS Chile 2017
                        </span>
                    </div>
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
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Índice de Masa Corporal (IMC)', position: 'insideBottom', offset: -10, className: "text-[10px] font-bold fill-slate-500" }}
                            />
                            <YAxis hide />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg ring-1 ring-black/5">
                                                <p className="text-xs font-black text-slate-900 dark:text-white mb-1">IMC: {payload[0].payload.bmi}</p>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-blue-500">Prob. Población: {(payload[0].value as number).toFixed(2)}%</p>
                                                    <p className="text-[10px] font-bold text-slate-400">Prob. Elite: {(payload[1].value as number).toFixed(2)}%</p>
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
                            <ReferenceLine x={initialBMI} stroke="#64748b" strokeWidth={2} strokeDasharray="3 3">
                                <Label
                                    value={`Inicio: ${initialBMI}`}
                                    position="top"
                                    fill="#64748b"
                                    fontSize={10}
                                    fontWeight="bold"
                                    offset={10}
                                />
                            </ReferenceLine>

                            {/* Current Position Marker */}
                            <ReferenceLine x={currentBMI} stroke="#06b6d4" strokeWidth={4}>
                                <Label
                                    value={`Hoy: ${currentBMI}`}
                                    position="top"
                                    fill="#06b6d4"
                                    fontSize={12}
                                    fontWeight="black"
                                    offset={15}
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
                            "Has superado la media nacional ({chileMean}) y te diriges hacia el percentil de alto rendimiento."
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
