import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { parseLocalDate } from '../../lib/utils';

import { UserProfile } from '../../hooks/useProfile';

interface WeightChartProps {
    data: FitnessEntry[];
    profile: UserProfile | null;
}

type TimeRange = '7D' | '1M' | '3M' | 'ALL';

export function WeightChart({ data, profile }: WeightChartProps) {
    const finalFatGoal = profile?.target_body_fat || 13;
    const interFatGoal = finalFatGoal + 5;
    const [range, setRange] = useState<TimeRange>('1M');

    // Sort data by date ascending
    const sortedData = useMemo(() =>
        [...data].sort((a, b) => a.Date.localeCompare(b.Date)),
        [data]
    );

    const filteredData = useMemo(() => {
        let cutoffDate: Date | null = null;
        const now = new Date();
        if (range === '7D') cutoffDate = startOfDay(subDays(now, 7));
        if (range === '1M') cutoffDate = startOfDay(subDays(now, 30));
        if (range === '3M') cutoffDate = startOfDay(subDays(now, 90));

        if (!cutoffDate) return sortedData;

        const todayStr = format(now, 'yyyy-MM-dd');
        return sortedData.filter(item => {
            const itemDate = parseLocalDate(item.Date);
            return isAfter(itemDate, cutoffDate!) || item.Date === todayStr;
        });
    }, [sortedData, range]);

    // Calculate moving average for weight (7 day)
    const dataWithTrend = useMemo(() => {
        return filteredData.map((day, index, arr) => {
            const windowSize = 7;
            const start = Math.max(0, index - windowSize + 1);
            const window = arr.slice(start, index + 1);
            const avg = window.reduce((sum, d) => sum + d.Weight, 0) / window.length;
            return { ...day, weightTrend: Number(avg.toFixed(2)) };
        });
    }, [filteredData]);

    return (
        <Card className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl md:text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Análisis de Peso</CardTitle>
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">Composición Corporal</p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl space-x-1 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
                        {[
                            { id: '7D', label: 'Diario' },
                            { id: '1M', label: 'Semanal' },
                            { id: '3M', label: 'Mensual' },
                            { id: 'ALL', label: 'Anual' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setRange(btn.id as TimeRange)}
                                className={`px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 whitespace-nowrap ${range === btn.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[320px] md:h-[400px] p-2 md:p-6 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dataWithTrend} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseLocalDate(date), 'dd MMM', { locale: es })}
                            stroke="currentColor"
                            className="text-slate-400 dark:text-slate-500"
                            fontSize={9}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={range === 'ALL' ? 50 : 30}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#3b82f6"
                            domain={['dataMin - 1', 'dataMax + 1']}
                            tickLine={false}
                            axisLine={false}
                            fontSize={9}
                            fontWeight="bold"
                            width={45}
                            tickFormatter={(val) => `${Math.round(val)}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#10b981"
                            domain={[10, 25]}
                            tickLine={false}
                            axisLine={false}
                            fontSize={9}
                            fontWeight="bold"
                            width={35}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                fontSize: '11px',
                                color: '#fff',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                            }}
                            itemStyle={{ padding: '2px 0' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', fontSize: '9px', marginBottom: '4px', letterSpacing: '0.1em' }}
                            labelFormatter={(label) => format(parseLocalDate(label as string), 'dd MMM, yyyy', { locale: es })}
                        />
                        <Legend
                            verticalAlign="top"
                            align="center"
                            height={60}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px' }}
                            payload={[
                                { value: 'Peso Actual', type: 'circle', id: 'ID00', color: '#60a5fa' },
                                { value: 'Tendencia', type: 'line', id: 'ID01', color: '#2563eb' },
                                { value: '% Grasa', type: 'line', id: 'ID02', color: '#10b981' },
                                { value: `Meta (${interFatGoal}%)`, type: 'rect', id: 'ID03', color: '#3b82f6' },
                                { value: `Meta (${finalFatGoal}%)`, type: 'rect', id: 'ID04', color: '#ef4444' }
                            ]}
                        />

                        {/* Goal Lines */}
                        <ReferenceLine
                            yAxisId="right"
                            y={finalFatGoal}
                            stroke="#ef4444"
                            strokeDasharray="4 4"
                            strokeWidth={2}
                            label={{ value: 'META ABS', position: 'insideBottomRight', fill: '#ef4444', fontSize: 7, fontWeight: '900', offset: 10 }}
                        />
                        <ReferenceLine
                            yAxisId="right"
                            y={interFatGoal}
                            stroke="#3b82f6"
                            strokeDasharray="4 4"
                            strokeWidth={2}
                            label={{ value: 'META INTER', position: 'insideTopRight', fill: '#3b82f6', fontSize: 7, fontWeight: '900', offset: 10 }}
                        />

                        {/* Daily Weight Area */}
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="Weight"
                            stroke="none"
                            fill="url(#colorWeight)"
                            legendType="none"
                            name="weight_area"
                            activeDot={false}
                        />

                        {/* Daily dots */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="Weight"
                            stroke="#60a5fa"
                            strokeWidth={0}
                            dot={{ r: 2.5, fill: "#60a5fa", strokeWidth: 0, fillOpacity: 0.6 }}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            name="Peso"
                            legendType="none"
                        />

                        {/* Moving Average Line */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="weightTrend"
                            stroke="#2563eb"
                            strokeWidth={4}
                            strokeLinecap="round"
                            dot={false}
                            name="Tendencia"
                            animationDuration={1500}
                        />

                        {/* Body Fat Line */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="BodyFat"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={false}
                            name="% Grasa"
                            animationDuration={2000}
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
