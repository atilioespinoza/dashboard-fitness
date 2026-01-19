import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseLocalDate } from '../../lib/utils';
import { Moon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import Counter from '../ui/Counter';

interface SleepChartProps {
    data: FitnessEntry[];
}

export function SleepChart({ data }: SleepChartProps) {
    // Last 14 days for a clearer view of the last two weeks
    const last14 = data.slice(-14);
    const SLEEP_GOAL = 7.5;

    // Calculate Trend (Last 7 vs Previous 7)
    const last7 = data.slice(-7);
    const prev7 = data.slice(-14, -7);

    const avgLast7 = last7.length > 0 ? Number((last7.reduce((acc, d) => acc + (d.Sleep || 0), 0) / last7.length).toFixed(1)) : 0;
    const avgPrev7 = prev7.length > 0 ? Number((prev7.reduce((acc, d) => acc + (d.Sleep || 0), 0) / prev7.length).toFixed(1)) : 0;

    const diff = avgLast7 - avgPrev7;
    const trend = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable';

    return (
        <Card className="col-span-12 lg:col-span-8 overflow-hidden border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Moon className="text-indigo-500" size={24} />
                        Análisis del Descanso
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Promedio Semanal: <span className="text-slate-700 dark:text-slate-300">{avgLast7}h</span></p>
                        <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                            trend === 'up' ? "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20" :
                                trend === 'down' ? "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20" :
                                    "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        )}>
                            {trend === 'up' && <TrendingUp size={12} />}
                            {trend === 'down' && <TrendingDown size={12} />}
                            {trend === 'stable' && <Minus size={12} />}
                            {trend === 'up' ? 'Mejorando' : trend === 'down' ? 'Bajando' : 'Estable'}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Meta Ideal</span>
                    <p className="text-xl font-black text-indigo-500"><Counter value={SLEEP_GOAL} />h</p>
                </div>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last14} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.2} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseLocalDate(date), 'dd MMM', { locale: es })}
                            stroke="var(--chart-text)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--chart-text)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 10]}
                            tickCount={6}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }}
                            contentStyle={{
                                backgroundColor: 'var(--chart-tooltip-bg)',
                                borderColor: 'var(--chart-tooltip-border)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: 'var(--chart-text)'
                            }}
                            labelFormatter={(label) => format(parseLocalDate(label as string), 'dd MMM, yyyy', { locale: es })}
                        />

                        <ReferenceLine
                            y={SLEEP_GOAL}
                            stroke="#6366f1"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: 'OPTIMAL', position: 'insideTopRight', fill: '#6366f1', fontSize: 10, fontWeight: 'black' }}
                        />

                        <Bar dataKey="Sleep" radius={[4, 4, 0, 0]}>
                            {last14.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.Sleep >= SLEEP_GOAL ? "#6366f1" : "#94a3b8"}
                                    fillOpacity={entry.Sleep >= SLEEP_GOAL ? 0.8 : 0.4}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
