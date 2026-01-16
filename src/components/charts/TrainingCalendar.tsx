import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import {
    Dumbbell, HeartPulse, Footprints, Zap, ArrowUpCircle, Target,
    ChevronLeft, ChevronRight, Info, Calendar as CalendarIcon
} from 'lucide-react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, parseLocalDate } from '../../lib/utils';

interface TrainingCalendarProps {
    data: FitnessEntry[];
}

export function TrainingCalendar({ data }: TrainingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    const getTrainingForDay = (day: Date) => {
        return data.find(d => isSameDay(parseLocalDate(d.Date), day));
    };

    const getWorkoutIcon = (training: string, size = 16) => {
        const text = training.toLowerCase();
        if (text.includes('cuerda') || text.includes('salto') || text.includes('bici') || text.includes('cardio'))
            return <HeartPulse className="text-red-500" size={size} />;
        if (text.includes('calistenia') || text.includes('funcional'))
            return <Zap className="text-yellow-500" size={size} />;
        if (text.includes('pierna') || text.includes('legs'))
            return <Footprints className="text-orange-500" size={size} />;
        if (text.includes('pecho') || text.includes('push'))
            return <ArrowUpCircle className="text-blue-500" size={size} />;
        if (text.includes('espalda') || text.includes('pull'))
            return <Target className="text-emerald-500" size={size} />;
        return <Dumbbell className="text-indigo-500" size={size} />;
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const [selectedDay, setSelectedDay] = useState<FitnessEntry | null>(null);

    return (
        <Card className="col-span-12">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800/50 pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-500 shrink-0">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <CardTitle className="text-lg md:text-xl font-bold capitalize leading-tight">
                            Calendario de Entrenamiento
                        </CardTitle>
                        <p className="text-xs md:text-sm text-slate-500">Vista mensual de actividad y sesiones</p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors w-full sm:w-auto">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[100px] text-center capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(day => (
                        <div key={day} className="py-2 text-center text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 overflow-hidden rounded-b-xl border-t border-slate-200 dark:border-slate-800">
                    {calendarDays.map((day, idx) => {
                        const training = getTrainingForDay(day);
                        const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "min-h-[80px] md:min-h-[110px] bg-white dark:bg-slate-900 p-2 transition-all duration-300 relative group",
                                    !isCurrentMonth && "bg-slate-50 dark:bg-slate-900/40 opacity-40 dark:opacity-30",
                                    isToday(day) && "bg-blue-500/5"
                                )}
                                onClick={() => training?.Training && setSelectedDay(training)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                        "text-xs font-mono",
                                        isToday(day) ? "bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : "text-slate-400 dark:text-slate-500"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {training?.Steps && training.Steps >= 12000 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Meta de Pasos Lograda" />
                                    )}
                                </div>

                                {training?.Training && (
                                    <div className="mt-1 flex flex-col items-center justify-center gap-1 cursor-pointer">
                                        <div className="p-1.5 md:p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-700 group-hover:scale-110 transition-all shadow-sm">
                                            {getWorkoutIcon(training.Training, 20)}
                                        </div>
                                        <span className="text-[9px] md:text-[10px] text-slate-400 font-medium hidden md:block text-center line-clamp-1">
                                            {training.Training}
                                        </span>
                                    </div>
                                )}

                                {isToday(day) && (
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-600" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            {/* Popover / Overlay Detail */}
            {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm transition-all" onClick={() => setSelectedDay(null)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    {getWorkoutIcon(selectedDay.Training || "", 24)}
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">Sesión de Entrenamiento</h4>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs font-mono mt-0.5">{format(parseLocalDate(selectedDay.Date), 'dd MMMM, yyyy', { locale: es })}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                                {selectedDay.Training}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded-lg text-center transition-colors">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Resumen</p>
                                <p className="text-xs text-slate-900 dark:text-white mt-1 font-medium">{selectedDay.Protein}g Prot</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded-lg text-center transition-colors">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Sueño</p>
                                <p className="text-xs text-slate-900 dark:text-white mt-1 font-medium">{selectedDay.Sleep}h</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded-lg text-center transition-colors">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Pasos</p>
                                <p className={cn("text-xs mt-1 font-medium", selectedDay.Steps >= 12000 ? "text-green-600 dark:text-green-400 font-bold" : "text-slate-900 dark:text-white")}>
                                    {selectedDay.Steps}
                                </p>
                            </div>
                        </div>

                        {selectedDay.Notes && (
                            <div className="flex items-start gap-3 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 italic text-[11px] text-slate-400">
                                <Info size={14} className="shrink-0 text-blue-500" />
                                <span>{selectedDay.Notes}</span>
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedDay(null)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors"
                        >
                            Cerrar Detalles
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
}

// Helper to avoid import error if needed, but I'll use simple icons here
function X({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
