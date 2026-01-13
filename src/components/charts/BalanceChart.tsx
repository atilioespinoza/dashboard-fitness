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
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-slate-100 italic">Balance Energético</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'EEE', { locale: es })}
                            stroke="#475569"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            dy={5}
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                            labelFormatter={(label) => format(parseISO(label as string), 'dd MMM', { locale: es })}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                        />

                        <Bar dataKey="Calories" name="Calorías" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={30} />
                        <Line type="monotone" dataKey="TDEE" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} name="Gasto" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
