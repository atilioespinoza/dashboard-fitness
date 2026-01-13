import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Footprints } from 'lucide-react';

interface StepsChartProps {
    data: FitnessEntry[];
}

export function StepsChart({ data }: StepsChartProps) {
    // Last 30 days
    const last30 = data.slice(-30);
    const STEP_GOAL = 12000;

    return (
        <Card className="col-span-12 bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Footprints className="text-green-500" size={24} />
                        Actividad Diaria (Pasos)
                    </CardTitle>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Histórico de los últimos 30 días</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Meta Diaria</span>
                    <p className="text-xl font-black text-green-500">12,000</p>
                </div>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: es })}
                            stroke="#475569"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
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
