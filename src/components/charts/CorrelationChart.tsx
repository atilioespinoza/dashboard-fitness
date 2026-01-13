import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';

interface CorrelationChartProps {
    data: FitnessEntry[];
}

export function CorrelationChart({ data }: CorrelationChartProps) {
    const chartData = data.map(d => ({ x: d.Sleep, y: d.Steps }));

    return (
        <Card className="col-span-12 lg:col-span-8 bg-slate-900 border-slate-800 relative overflow-hidden">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-100">Sueño vs Actividad</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" dataKey="x" name="Sueño" unit="h" stroke="#94a3b8" fontSize={12} tickCount={5} domain={['dataMin - 1', 'dataMax + 1']} />
                        <YAxis type="number" dataKey="y" name="Pasos" unit="" stroke="#94a3b8" fontSize={12} tickCount={5} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Scatter name="Días" data={chartData} fill="#8884d8">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.x > 7.5 ? "#10b981" : "#6366f1"} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Insight Overlay */}
                <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur text-xs p-2 rounded border border-slate-700 max-w-[150px] shadow-lg">
                    <span className="font-bold text-slate-300">Observación:</span>
                    <p className="text-slate-400 mt-1">Días con &gt;7.5h de sueño muestran actividad más constante.</p>
                </div>
            </CardContent>
        </Card>
    );
}
