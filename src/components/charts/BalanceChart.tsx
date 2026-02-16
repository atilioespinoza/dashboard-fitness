import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseLocalDate } from '../../lib/utils';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

interface BalanceChartProps {
    data: FitnessEntry[];
}

export function BalanceChart({ data }: BalanceChartProps) {
    // Ultimos 7 dias
    const chartData = useMemo(() => data.slice(-7), [data]);

    // Calcular balance acumulado
    const weeklySummary = useMemo(() => {
        const totalCalories = chartData.reduce((acc, curr) => acc + curr.Calories, 0);
        const totalTDEE = chartData.reduce((acc, curr) => acc + curr.TDEE, 0);
        const balance = totalCalories - totalTDEE;
        const avgBalance = balance / (chartData.length || 1);

        return {
            total: balance,
            average: Math.round(avgBalance),
            isDeficit: balance < 0
        };
    }, [chartData]);

    return (
        <Card className="col-span-12 lg:col-span-6 overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-2 gap-4">
                <div>
                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                        Balance Energético
                    </CardTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Semana actual vs Gasto (TDEE)</p>
                </div>

                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${weeklySummary.isDeficit
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600'
                        : 'bg-orange-500/5 border-orange-500/10 text-orange-600'
                    }`}>
                    <div className={`p-1.5 rounded-lg ${weeklySummary.isDeficit ? 'bg-emerald-500/10' : 'bg-orange-500/10'
                        }`}>
                        {weeklySummary.isDeficit ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-wider leading-none">
                            {weeklySummary.isDeficit ? 'Déficit' : 'Superávit'} Semanal
                        </p>
                        <p className="text-lg font-black italic leading-none mt-1">
                            {Math.abs(weeklySummary.total)} <span className="text-[10px] uppercase not-italic">kcal</span>
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-2">
                <div className="h-[250px] md:h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.3} />
                            <XAxis
                                dataKey="Date"
                                tickFormatter={(date) => format(parseLocalDate(date), 'EEE', { locale: es })}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                                width={45}
                            />
                            <Tooltip
                                cursor={{ fill: '#e2e8f0', opacity: 0.2 }}
                                content={<CustomTooltip />}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '20px' }}
                            />

                            <Bar
                                dataKey="Calories"
                                name="Ingesta"
                                fill="#22c55e"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={35}
                                animationDuration={1000}
                            />
                            <Line
                                type="monotone"
                                dataKey="TDEE"
                                stroke="#f59e0b"
                                strokeWidth={4}
                                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Gasto TDEE"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <Info size={14} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                        Tu promedio diario es de <span className="font-bold text-slate-700 dark:text-slate-200">{weeklySummary.average} kcal</span> de {weeklySummary.isDeficit ? 'déficit' : 'superávit'}.
                        Sigue así para {weeklySummary.isDeficit ? 'perder grasa' : 'ganar masa'} de forma controlada.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const cal = payload.find((p: any) => p.dataKey === 'Calories')?.value || 0;
        const tdee = payload.find((p: any) => p.dataKey === 'TDEE')?.value || 0;
        const diff = cal - tdee;

        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[150px]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    {format(parseLocalDate(label), 'dd MMMM', { locale: es })}
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Ingesta</span>
                        <span className="text-sm font-black text-white">{cal} <span className="text-[9px] font-normal text-slate-400">kcal</span></span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-bold text-orange-400 uppercase">Gasto</span>
                        <span className="text-sm font-black text-white">{tdee} <span className="text-[9px] font-normal text-slate-400">kcal</span></span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Neto</span>
                        <span className={`text-sm font-black italic ${diff <= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                            {diff > 0 ? '+' : ''}{diff} <span className="text-[9px] not-italic text-slate-400 font-normal">kcal</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
