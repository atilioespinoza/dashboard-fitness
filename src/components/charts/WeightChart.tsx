import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeightChartProps {
    data: FitnessEntry[];
}

export function WeightChart({ data }: WeightChartProps) {
    // Sort data by date ascending just in case
    const chartData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    // Calculate moving average for weight (7 day)
    const dataWithTrend = chartData.map((day, index, arr) => {
        if (index < 6) return { ...day, weightTrend: day.Weight }; // Not enough data
        const last7 = arr.slice(index - 6, index + 1);
        const avg = last7.reduce((sum, d) => sum + d.Weight, 0) / 7;
        return { ...day, weightTrend: Number(avg.toFixed(2)) };
    });

    return (
        <Card className="col-span-12 lg:col-span-8 bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-100">Tendencias de Peso y Grasa Corporal (Últimos 30 Días)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dataWithTrend} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: es })}
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#94a3b8"
                            domain={['dataMin - 2', 'dataMax + 2']}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                            unit="kg"
                            label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, offset: 0 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#10b981"
                            domain={[10, 25]}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                            unit="%"
                            label={{ value: '% Grasa', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 10, offset: 10 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}
                            labelFormatter={(label) => format(parseISO(label as string), 'dd MMM, yyyy', { locale: es })}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />

                        {/* Goal Lines */}
                        <ReferenceLine yAxisId="right" y={13} label={{ value: 'Meta Final (13%)', position: 'right', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                        <ReferenceLine yAxisId="right" y={18} label={{ value: 'Meta Intermedia (18%)', position: 'right', fill: '#3b82f6', fontSize: 10 }} stroke="#3b82f6" strokeDasharray="3 3" />

                        {/* Daily Weight Scatter Points */}
                        <Area yAxisId="left" type="monotone" dataKey="Weight" stroke="none" fill="url(#colorWeight)" />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="Weight"
                            stroke="#60a5fa"
                            strokeWidth={1}
                            dot={{ r: 2, fill: "#60a5fa", strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                            name="Peso Diario"
                            isAnimationActive={false}
                            opacity={0.5}
                        />

                        {/* Moving Average Line */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="weightTrend"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={false}
                            name="Tendencia Semanal"
                        />

                        {/* Body Fat Line */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="BodyFat"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="% Grasa Corporal"
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
