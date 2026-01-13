import { User, Ruler, Calendar } from 'lucide-react';
import { Card, CardContent } from './card';
import Counter from './Counter';

interface PersonalInfoProps {
    age: number;
    height: number;
    sex: 'Masculino' | 'Femenino' | 'Otro';
}

export function PersonalInfo({ age, height, sex }: PersonalInfoProps) {
    return (
        <Card className="col-span-12 border-none bg-slate-100/50 dark:bg-slate-900/30 backdrop-blur-none shadow-none">
            <CardContent className="p-3 md:p-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-blue-500/50">
                        <User size={16} className="text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Perfil:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">Atilio Espinoza</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Edad:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white"><Counter value={age} /> años</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Ruler size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Estatura:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white"><Counter value={height} /> cm</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <User size={16} className={sex === 'Masculino' ? 'text-blue-400' : 'text-pink-400'} />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Sexo:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{sex}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
