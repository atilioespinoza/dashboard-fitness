import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface BalanceChartProps {
    data: FitnessEntry[];
}

export function BalanceChart({ data }: BalanceChartProps) {
    // Last 7 days only
    const chartData = data.slice(-7);

    return (
        <Card className="col-span-12 lg:col-span-6 bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-100">Balance Energético Diario (Últimos 7 Días)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'EEE', { locale: es })}
                            stroke="#94a3b8"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                            labelFormatter={(label) => format(parseISO(label as string), 'dd MMM', { locale: es })}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />

                        <Bar dataKey="Calories" name="Calorías Ingeridas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="TDEE" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="TDEE (Gasto)" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
