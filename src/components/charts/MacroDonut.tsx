import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';

interface MacroDonutProps {
    data: FitnessEntry[];
}

export function MacroDonut({ data }: MacroDonutProps) {
    if (data.length === 0) return null;

    // Overall Average
    const totalDays = data.length;
    const avgProt = data.reduce((s, d) => s + (d.Protein || 0), 0) / totalDays;
    const avgCarb = data.reduce((s, d) => s + (d.Carbs || 0), 0) / totalDays;
    const avgFat = data.reduce((s, d) => s + (d.Fat || 0), 0) / totalDays;
    const avgCals = data.reduce((s, d) => s + (d.Calories || 0), 0) / totalDays;

    const overallChartData = [
        { name: 'Proteína', value: Math.round(avgProt) },
        { name: 'Carbos', value: Math.round(avgCarb) },
        { name: 'Grasa', value: Math.round(avgFat) },
    ];

    const COLORS = ['#ef4444', '#f59e0b', '#3b82f6']; // Red, Yellow, Blue

    // Weekly Averages (Last 4 weeks)
    const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
        const startIdx = Math.max(0, sortedData.length - (i + 1) * 7);
        const endIdx = sortedData.length - i * 7;
        if (startIdx >= endIdx) break;

        const weekSlice = sortedData.slice(startIdx, endIdx);
        const wProt = weekSlice.reduce((s, d) => s + (d.Protein || 0), 0) / weekSlice.length;
        const wCarb = weekSlice.reduce((s, d) => s + (d.Carbs || 0), 0) / weekSlice.length;
        const wFat = weekSlice.reduce((s, d) => s + (d.Fat || 0), 0) / weekSlice.length;

        weeklyData.push({
            name: i === 0 ? 'Semana Actual' : `Hace ${i} sem`,
            Proteína: Math.round(wProt),
            Carbos: Math.round(wCarb),
            Grasa: Math.round(wFat),
        });
    }
    weeklyData.reverse();

    return (
        <Card className="col-span-12 bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-4">
                <div>
                    <CardTitle className="text-xl font-bold text-white">Análisis de Macros</CardTitle>
                    <p className="text-sm text-slate-400">Promedio General vs Tendencias Semanales</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promedio Calorías</p>
                    <p className="text-2xl font-bold text-blue-400">{Math.round(avgCals)} <span className="text-sm font-normal text-slate-500">kcal</span></p>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-12 gap-8">
                    {/* General Average Donut */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <h3 className="text-sm font-medium text-slate-300 text-center">Distribución General</h3>
                        <div className="h-[240px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overallChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {overallChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', border: '1px solid #334155' }}
                                        itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Summary */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-white">{Math.round(avgProt + avgCarb + avgFat)}g</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Total Promedio</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-2">
                            <div className="text-center">
                                <p className="text-[10px] text-red-400 font-bold uppercase">Prot</p>
                                <p className="text-lg font-bold text-white">{Math.round(avgProt)}g</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-amber-400 font-bold uppercase">Carbo</p>
                                <p className="text-lg font-bold text-white">{Math.round(avgCarb)}g</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-blue-400 font-bold uppercase">Grasa</p>
                                <p className="text-lg font-bold text-white">{Math.round(avgFat)}g</p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Trends Bar Chart */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">
                        <h3 className="text-sm font-medium text-slate-300 text-center lg:text-left">Progresión Semanal</h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
                                    <Bar dataKey="Proteína" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={40} />
                                    <Bar dataKey="Carbos" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={40} />
                                    <Bar dataKey="Grasa" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
