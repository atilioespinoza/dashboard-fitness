import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import Counter from '../ui/Counter';

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
        <Card className="col-span-12">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800/50 p-4 md:p-6 gap-2">
                <div>
                    <CardTitle className="text-lg md:text-xl font-bold tracking-tight">Análisis de Macros</CardTitle>
                    <p className="text-xs md:text-sm text-slate-500">Promedio General vs Semanal</p>
                </div>
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center bg-slate-100 dark:bg-slate-800/30 md:bg-transparent px-3 py-2 md:p-0 rounded-lg">
                    <p className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest md:mb-1">Promedio Cal</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                        <Counter value={avgCals} /> <span className="text-xs font-normal text-slate-500">kcal</span>
                    </p>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                    {/* General Average Donut */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Distribución General</h3>
                        <div className="h-[200px] md:h-[240px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overallChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {overallChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', borderRadius: '8px', border: '1px solid var(--chart-tooltip-border)', fontSize: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Summary */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                                    <Counter value={avgProt + avgCarb + avgFat} />g
                                </span>
                                <span className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Promedio Diario</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-1">
                            <div className="text-center bg-slate-50 dark:bg-slate-800/20 py-2 rounded-lg border border-slate-200 dark:border-slate-800/40 transition-colors">
                                <p className="text-[8px] md:text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Prot</p>
                                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight"><Counter value={avgProt} />g</p>
                            </div>
                            <div className="text-center bg-slate-50 dark:bg-slate-800/20 py-2 rounded-lg border border-slate-200 dark:border-slate-800/40 transition-colors">
                                <p className="text-[8px] md:text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Carbo</p>
                                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight"><Counter value={avgCarb} />g</p>
                            </div>
                            <div className="text-center bg-slate-50 dark:bg-slate-800/20 py-2 rounded-lg border border-slate-200 dark:border-slate-800/40 transition-colors">
                                <p className="text-[8px] md:text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Grasa</p>
                                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight"><Counter value={avgFat} />g</p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Trends Bar Chart */}
                    <div className="lg:col-span-8 space-y-4">
                        <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider text-center lg:text-left">Progresión Semanal</h3>
                        <div className="h-[220px] md:h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--chart-text)', fontSize: 10 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--chart-text)', fontSize: 10 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--chart-grid)', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', borderRadius: '8px', fontSize: '10px' }}
                                    />
                                    <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
                                    <Bar dataKey="Proteína" stackId="a" fill="#ef4444" barSize={30} />
                                    <Bar dataKey="Carbos" stackId="a" fill="#f59e0b" barSize={30} />
                                    <Bar dataKey="Grasa" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
