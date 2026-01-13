import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Footprints, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import Counter from '../ui/Counter';

interface StepsChartProps {
    data: FitnessEntry[];
}

export function StepsChart({ data }: StepsChartProps) {
    // Last 30 days
    const last30 = data.slice(-30);
    const STEP_GOAL = 12000;

    // Calculate Trend (Last 7 vs Previous 7)
    const last7 = data.slice(-7);
    const prev7 = data.slice(-14, -7);

    const avgLast7 = last7.length > 0 ? Math.round(last7.reduce((acc, d) => acc + d.Steps, 0) / last7.length) : 0;
    const avgPrev7 = prev7.length > 0 ? Math.round(prev7.reduce((acc, d) => acc + d.Steps, 0) / prev7.length) : 0;

    const diff = avgLast7 - avgPrev7;
    const trend = diff > 500 ? 'up' : diff < -500 ? 'down' : 'stable';

    return (
        <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Footprints className="text-green-500" size={24} />
                        Actividad Diaria (Pasos)
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Promedio 7D: <span className="text-slate-700 dark:text-slate-300"><Counter value={avgLast7} /></span></p>
                        <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                            trend === 'up' ? "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20" :
                                trend === 'down' ? "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20" :
                                    "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        )}>
                            {trend === 'up' && <TrendingUp size={12} />}
                            {trend === 'down' && <TrendingDown size={12} />}
                            {trend === 'stable' && <Minus size={12} />}
                            {trend === 'up' ? 'Subiendo' : trend === 'down' ? 'Bajando' : 'Estable'}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Meta Diaria</span>
                    <p className="text-xl font-black text-green-500"><Counter value={STEP_GOAL} /></p>
                </div>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: es })}
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
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
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
                            labelFormatter={(label) => format(parseISO(label as string), 'dd MMM, yyyy', { locale: es })}
                        />

                        <ReferenceLine
                            y={STEP_GOAL}
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: 'META', position: 'insideTopRight', fill: '#10b981', fontSize: 10, fontWeight: 'black' }}
                        />

                        <Bar dataKey="Steps" radius={[4, 4, 0, 0]}>
                            {last30.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.Steps >= STEP_GOAL ? "#10b981" : "#3b82f6"}
                                    fillOpacity={entry.Steps >= STEP_GOAL ? 0.8 : 0.4}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
