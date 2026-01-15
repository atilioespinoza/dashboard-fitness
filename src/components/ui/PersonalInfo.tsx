import { User, Ruler, Calendar } from 'lucide-react';
import Counter from './Counter';

interface PersonalInfoProps {
    age: number;
    height: number;
    sex: 'Masculino' | 'Femenino' | 'Otro';
}

export function PersonalInfo({ age, height, sex }: PersonalInfoProps) {
    return (
        <div className="w-full px-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <User size={14} className="text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Perfil</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Atilio Espinoza</span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                        <Calendar size={14} className="text-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Edad</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight"><Counter value={age} /> años</span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <Ruler size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Estatura</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight"><Counter value={height} /> cm</span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <User size={14} className={sex === 'Masculino' ? 'text-blue-400' : 'text-pink-400'} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Sexo</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{sex}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
