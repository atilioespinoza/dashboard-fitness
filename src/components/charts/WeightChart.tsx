import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
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

type TimeRange = '1M' | '3M' | '6M' | 'ALL';

type CompositionPoint = FitnessEntry & {
    weightValue: number | null;
    waistValue: number | null;
    bodyFatValue: number | null;
};

export function WeightChart({ data, profile }: WeightChartProps) {
    const [range, setRange] = useState<TimeRange>('3M');

    const sortedData = useMemo(() =>
        [...data].sort((a, b) => a.Date.localeCompare(b.Date)),
        [data]
    );

    const latestWeightEntry = useMemo(() => [...sortedData].reverse().find(d => d.Weight > 0), [sortedData]);
    const previousWeightEntry = useMemo(() => [...sortedData].reverse().filter(d => d.Weight > 0)[1], [sortedData]);
    const latestFatEntry = useMemo(() => [...sortedData].reverse().find(d => d.BodyFat > 0), [sortedData]);
    const latestWaistEntry = useMemo(() => [...sortedData].reverse().find(d => d.Waist > 0), [sortedData]);

    const measurementData = useMemo<CompositionPoint[]>(() => {
        const now = new Date();
        let cutoffDate: Date | null = null;
        if (range === '1M') cutoffDate = startOfDay(subDays(now, 30));
        if (range === '3M') cutoffDate = startOfDay(subDays(now, 90));
        if (range === '6M') cutoffDate = startOfDay(subDays(now, 180));

        return sortedData
            .filter(item => item.Weight > 0 || item.Waist > 0 || item.BodyFat > 0)
            .filter(item => !cutoffDate || isAfter(parseLocalDate(item.Date), cutoffDate) || item.Date === format(now, 'yyyy-MM-dd'))
            .map(item => ({
                ...item,
                weightValue: item.Weight > 0 ? item.Weight : null,
                waistValue: item.Waist > 0 ? item.Waist : null,
                bodyFatValue: item.BodyFat > 0 ? item.BodyFat : null
            }));
    }, [sortedData, range]);

    const initialFat = sortedData.find(d => d.BodyFat > 0)?.BodyFat || profile?.target_body_fat || 20;
    const finalFatGoal = profile?.target_body_fat || 13;
    const interFatGoal = initialFat > finalFatGoal
        ? Number((initialFat - ((initialFat - finalFatGoal) / 2)).toFixed(1))
        : finalFatGoal + 2;

    const latestWeight = latestWeightEntry?.Weight;
    const previousWeight = previousWeightEntry?.Weight;
    const weightDelta = latestWeight && previousWeight ? Number((latestWeight - previousWeight).toFixed(1)) : null;

    return (
        <Card className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-0">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="space-y-4">
                        <div>
                            <CardTitle className="text-xl md:text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Composición Corporal</CardTitle>
                            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1 mt-1">Mediciones reales semanales</p>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                            <MetricBadge label="Peso Actual" value={latestWeight} unit="kg" color="blue" date={latestWeightEntry?.Date} delta={weightDelta} />
                            <MetricBadge label="Cintura" value={latestWaistEntry?.Waist} unit="cm" color="violet" date={latestWaistEntry?.Date} />
                            <MetricBadge label="% Grasa" value={latestFatEntry?.BodyFat} unit="%" color="emerald" date={latestFatEntry?.Date} />
                        </div>
                    </div>

                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl space-x-1 self-stretch xl:self-auto overflow-x-auto no-scrollbar">
                        {[
                            { id: '1M', label: '1 Mes' },
                            { id: '3M', label: '3 Meses' },
                            { id: '6M', label: '6 Meses' },
                            { id: 'ALL', label: 'Todo' }
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

            <CardContent className="h-[340px] md:h-[430px] p-2 md:p-6 pt-6">
                {measurementData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                        <p className="text-sm font-black uppercase tracking-widest">Sin mediciones corporales</p>
                        <p className="text-xs font-medium">Registra peso, cintura o % de grasa una vez por semana para activar este análisis.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={measurementData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
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
                                domain={['dataMin - 1', 'dataMax + 1']}
                                tickLine={false}
                                axisLine={false}
                                fontSize={9}
                                fontWeight="bold"
                                width={35}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const filteredPayload = payload.filter((item: any) => item.value !== null && item.value !== undefined);
                                        if (filteredPayload.length === 0) return null;

                                        return (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-2xl min-w-[180px] backdrop-blur-md">
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-white/5 pb-2">
                                                    {format(parseLocalDate(label), 'dd MMM, yyyy', { locale: es })}
                                                </p>
                                                <div className="space-y-2">
                                                    {filteredPayload.map((item: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                                                    {item.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                                                                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                                                                <span className="text-[8px] ml-0.5 opacity-50 uppercase italic font-bold">
                                                                    {item.name === '% Grasa' ? '%' : item.name === 'Cintura' ? 'cm' : 'kg'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="center"
                                height={50}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px' }}
                            />

                            <ReferenceLine yAxisId="right" y={finalFatGoal} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'META GRASA', position: 'insideBottomRight', fill: '#ef4444', fontSize: 7, fontWeight: '900', offset: 10 }} />
                            <ReferenceLine yAxisId="right" y={interFatGoal} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'META INTER', position: 'insideTopRight', fill: '#3b82f6', fontSize: 7, fontWeight: '900', offset: 10 }} />

                            <Line yAxisId="left" type="monotone" dataKey="weightValue" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Peso" connectNulls={true} />
                            <Line yAxisId="left" type="monotone" dataKey="waistValue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Cintura" connectNulls={true} />
                            <Line yAxisId="right" type="monotone" dataKey="bodyFatValue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="% Grasa" connectNulls={true} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

function MetricBadge({ label, value, unit, color, date, delta }: { label: string; value?: number; unit: string; color: 'blue' | 'emerald' | 'violet'; date?: string; delta?: number | null }) {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400'
    };

    return (
        <div className={`flex flex-col px-4 py-3 rounded-2xl border ${colors[color]}`}>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tabular-nums">{value ? value.toFixed(1) : '--'}</span>
                <span className="text-[10px] font-black uppercase italic opacity-60">{unit}</span>
            </div>
            <div className="flex items-center gap-2 min-h-4">
                {date && <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">{format(parseLocalDate(date), 'd MMM', { locale: es })}</span>}
                {delta !== null && delta !== undefined && (
                    <span className={`text-[8px] font-black ${delta <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}kg
                    </span>
                )}
            </div>
        </div>
    );
}
