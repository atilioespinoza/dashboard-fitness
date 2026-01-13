import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';

interface CorrelationChartProps {
    data: FitnessEntry[];
}

export function CorrelationChart({ data }: CorrelationChartProps) {
    const chartData = data.map(d => ({ x: d.Sleep, y: d.Steps }));

    return (
        <Card className="col-span-12 lg:col-span-8 bg-slate-900 border-slate-800 relative overflow-hidden">
            <CardHeader className="pb-0">
                <CardTitle className="text-lg font-bold text-slate-100">Sueño vs Actividad</CardTitle>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Correlación Pasos y Descanso</p>
            </CardHeader>
            <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                        <XAxis type="number" dataKey="x" name="Sueño" unit="h" stroke="#475569" fontSize={10} tickCount={5} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                        <YAxis type="number" dataKey="y" name="Pasos" unit="" stroke="#475569" fontSize={10} tickCount={5} domain={[0, 'dataMax + 2000']} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        />

                        {/* Steps Goal Line */}
                        <ReferenceLine y={12000} stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Meta 12k', position: 'insideTopRight', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />

                        <Scatter name="Días" data={chartData} fill="#8884d8">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.y >= 12000 ? "#10b981" : "#6366f1"} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Insight Overlay */}
                <div className="absolute top-2 right-4 md:bottom-4 md:top-auto bg-slate-800/90 backdrop-blur text-[10px] p-2.5 rounded-xl border border-slate-700 max-w-[160px] shadow-2xl">
                    <span className="font-black text-blue-400 uppercase tracking-tighter">Observación:</span>
                    <p className="text-slate-300 mt-1 leading-tight">Los días con <strong>&gt;7.5h de sueño</strong> facilitan alcanzar la meta de <strong>12,000 pasos</strong>.</p>
                </div>
            </CardContent>
        </Card>
    );
}
