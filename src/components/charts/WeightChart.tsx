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
        <Card className="col-span-12 lg:col-span-8">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-bold italic">Tendencias de Peso y Grasa</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] md:h-[350px] p-2 md:p-6 text-slate-500">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dataWithTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: es })}
                            stroke="var(--chart-text)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={5}
                            minTickGap={20}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#3b82f6"
                            domain={['dataMin - 1', 'dataMax + 1']}
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            width={35}
                            tickFormatter={(val) => Math.round(val).toString()}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#10b981"
                            domain={[10, 25]}
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            width={25}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--chart-tooltip-bg)',
                                borderColor: 'var(--chart-tooltip-border)',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: 'var(--chart-text)'
                            }}
                            labelStyle={{ color: 'var(--chart-text)', fontWeight: 'bold' }}
                            labelFormatter={(label) => format(parseISO(label as string), 'dd MMM, yyyy', { locale: es })}
                        />
                        <Legend
                            verticalAlign="top"
                            align="center"
                            height={30}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', paddingTop: '0px' }}
                            payload={[
                                { value: 'Peso', type: 'circle', id: 'ID00', color: '#60a5fa' },
                                { value: 'Tendencia', type: 'line', id: 'ID01', color: '#2563eb' },
                                { value: '% Grasa', type: 'line', id: 'ID02', color: '#10b981' }
                            ]}
                        />

                        {/* Goal Lines */}
                        <ReferenceLine yAxisId="right" y={13} label={{ value: '13%', position: 'insideRight', fill: '#ef4444', fontSize: 8 }} stroke="#ef4444" strokeDasharray="3 3" />
                        <ReferenceLine yAxisId="right" y={18} label={{ value: '18%', position: 'insideRight', fill: '#3b82f6', fontSize: 8 }} stroke="#3b82f6" strokeDasharray="3 3" />

                        {/* Daily Weight Area - Hidden from legend */}
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="Weight"
                            stroke="none"
                            fill="url(#colorWeight)"
                            legendType="none"
                            name="weight_area"
                        />

                        {/* Daily dots - Visible as 'Peso' in legend via payload */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="Weight"
                            stroke="#60a5fa"
                            strokeWidth={0}
                            dot={{ r: 2, fill: "#60a5fa", strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                            name="Peso"
                            legendType="none"
                        />

                        {/* Moving Average Line */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="weightTrend"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={false}
                            name="Tendencia"
                        />

                        {/* Body Fat Line */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="BodyFat"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="% Grasa"
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
