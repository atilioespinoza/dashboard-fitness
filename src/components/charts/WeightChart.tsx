import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, subDays, isAfter, startOfDay, addDays } from 'date-fns';
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
    const sortedForStart = [...data].sort((a, b) => a.Date.localeCompare(b.Date));
    const fatEntries = sortedForStart.filter(d => d.BodyFat > 0);
    const initialFat = fatEntries.length > 0 ? fatEntries[0].BodyFat : (fatEntries[0]?.BodyFat || 25);

    const finalFatGoal = profile?.target_body_fat || 13;
    const interFatGoal = initialFat > finalFatGoal
        ? Number((initialFat - ((initialFat - finalFatGoal) / 2)).toFixed(1))
        : finalFatGoal + 2;
    const [range, setRange] = useState<TimeRange>('1M');

    // Sort data by date ascending
    const sortedData = useMemo(() =>
        [...data].sort((a, b) => a.Date.localeCompare(b.Date)),
        [data]
    );

    const latestEntry = useMemo(() => sortedData[sortedData.length - 1], [sortedData]);
    const latestWeight = latestEntry?.Weight;
    const latestFat = useMemo(() => {
        const withFat = sortedData.filter(d => d.BodyFat > 0);
        return withFat.length > 0 ? withFat[withFat.length - 1].BodyFat : null;
    }, [sortedData]);

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
        if (filteredData.length === 0) return [];

        // 1. Identify date range
        const dates = filteredData.map(d => parseLocalDate(d.Date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.min(Math.max(...dates), new Date().getTime()); // Cap at today

        // 2. Create normalized map of existing data
        const dataMap = new Map(filteredData.map(d => [d.Date, d]));

        // 3. Fill gaps
        const normalized: (FitnessEntry & { weightTrend?: number | null })[] = [];
        let currentDate = startOfDay(new Date(minDate));
        const endDate = startOfDay(new Date(maxDate));

        while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const existing = dataMap.get(dateStr);

            if (existing) {
                normalized.push({ ...existing });
            } else {
                // Create a placeholder with nulls (types allow this or we handle in chart)
                normalized.push({
                    Date: dateStr,
                    Weight: 0, // We'll treat 0 as "missing" in the trend calc
                    BodyFat: 0,
                    Waist: 0,
                    Calories: 0,
                    Protein: 0,
                    Carbs: 0,
                    Fat: 0,
                    Steps: 0,
                    TDEE: 0,
                    Sleep: 0,
                    Notes: ''
                } as FitnessEntry);
            }
            currentDate = addDays(currentDate, 1);
        }

        // 4. Calculate trend ignoring 0s
        return normalized.map((day, index, arr) => {
            const windowSize = 7;
            const start = Math.max(0, index - windowSize + 1);
            const window = arr.slice(start, index + 1);
            const validWeights = window.filter(d => d.Weight > 0).map(d => d.Weight);

            if (validWeights.length === 0) return { ...day, weightTrend: null };

            const avg = validWeights.reduce((sum, w) => sum + w, 0) / validWeights.length;
            return { ...day, weightTrend: Number(avg.toFixed(2)) };
        });
    }, [filteredData]);

    return (
        <Card className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl md:text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Análisis de Peso</CardTitle>
                            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">Composición Corporal</p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                                <span className="text-[8px] font-black text-blue-500/70 dark:text-blue-400/70 uppercase tracking-[0.2em]">Peso Actual</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                        {latestWeight?.toFixed(1) || '--'}
                                    </span>
                                    <span className="text-[10px] font-black text-blue-500/50 uppercase italic">kg</span>
                                </div>
                            </div>
                            <div className="flex flex-col px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                <span className="text-[8px] font-black text-emerald-500/70 dark:text-emerald-400/70 uppercase tracking-[0.2em]">% Grasa</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        {latestFat?.toFixed(1) || '--'}
                                    </span>
                                    <span className="text-[10px] font-black text-emerald-500/50 uppercase italic">%</span>
                                </div>
                            </div>
                        </div>
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
                                className={`px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 whitespace-nowrap ${range === btn.id
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
                            dataKey={(d) => d.Weight > 0 ? d.Weight : null}
                            stroke="none"
                            fill="url(#colorWeight)"
                            legendType="none"
                            name="weight_area"
                            activeDot={false}
                            connectNulls={true}
                        />

                        {/* Daily dots */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey={(d) => d.Weight > 0 ? d.Weight : null}
                            stroke="#60a5fa"
                            strokeWidth={0}
                            dot={{ r: 2.5, fill: "#60a5fa", strokeWidth: 0, fillOpacity: 0.6 }}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            name="Peso"
                            legendType="none"
                            connectNulls={true}
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
                            connectNulls={true}
                        />

                        {/* Body Fat Line */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey={(d) => d.BodyFat > 0 ? d.BodyFat : null}
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={false}
                            name="% Grasa"
                            animationDuration={2000}
                            connectNulls={true}
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
