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
        <Card className="col-span-12 lg:col-span-6">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-bold italic">Balance Energético</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'EEE', { locale: es })}
                            stroke="var(--chart-text)"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            dy={5}
                        />
                        <YAxis
                            stroke="var(--chart-text)"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }}
                            contentStyle={{
                                backgroundColor: 'var(--chart-tooltip-bg)',
                                borderColor: 'var(--chart-tooltip-border)',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: 'var(--chart-text)'
                            }}
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
