import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, parseLocalDate } from '../../lib/utils';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConsistencyGridProps {
    data: FitnessEntry[];
}

export function ConsistencyGrid({ data }: ConsistencyGridProps) {
    // Last 7 days
    const last7 = data.slice(-7);

    // Logic for HIT vs MISS
    // Calorie Hit: Calories < TDEE
    const PROTEIN_GOAL = 140;

    return (
        <Card className="col-span-12 lg:col-span-6">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-bold italic">Consistencia Semanal</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-x-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                            <th className="text-left py-2 px-1">Métrica</th>
                            {last7.map((day, i) => (
                                <th key={i} className="text-center py-2 px-0.5">
                                    {format(parseLocalDate(day.Date), 'EEE', { locale: es }).slice(0, 2)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3 px-1">
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter block leading-none">Calorías</span>
                            </td>
                            {last7.map((day, i) => {
                                const hit = day.Calories <= day.TDEE;
                                return (
                                    <td key={i} className="text-center py-3">
                                        <div className="flex justify-center">
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileInView={{ scale: 1, opacity: 1 }}
                                                viewport={{ once: false }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.05 }}
                                                className={cn(
                                                    "w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center transition-all duration-300",
                                                    hit ? "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20"
                                                )}
                                            >
                                                {hit ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                                            </motion.div>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3 px-1">
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter block leading-none">Proteínas</span>
                            </td>
                            {last7.map((day, i) => {
                                const hit = day.Protein >= PROTEIN_GOAL;
                                return (
                                    <td key={i} className="text-center py-3">
                                        <div className="flex justify-center">
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileInView={{ scale: 1, opacity: 1 }}
                                                viewport={{ once: false }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.05 }}
                                                className={cn(
                                                    "w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center transition-all duration-300",
                                                    hit ? "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20"
                                                )}
                                            >
                                                {hit ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                                            </motion.div>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
