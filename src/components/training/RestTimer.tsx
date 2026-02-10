import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, BellRing, Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
    seconds: number;
    onClose: () => void;
}

export function RestTimer({ seconds, onClose }: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isActive, setIsActive] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let timer: any = null;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isFinished) {
            setIsFinished(true);
            setIsActive(false);
            playAlarm();
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft, isFinished]);

    const playAlarm = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note

            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 1);
        } catch (e) {
            console.warn('Audio not supported or blocked');
        }
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / seconds) * 100;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 w-full max-w-sm shadow-2xl text-center space-y-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Tiempo de Descanso</h3>
                    <div className="flex items-center justify-center gap-2">
                        {isFinished ? (
                            <BellRing size={24} className="text-emerald-500 animate-bounce" />
                        ) : (
                            <Bell size={24} className="text-blue-500" />
                        )}
                        <span className={`text-6xl font-black tracking-tighter tabular-nums ${isFinished ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`absolute left-0 top-0 h-full ${isFinished ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        disabled={isFinished}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${isActive
                            ? 'bg-slate-100 dark:bg-white/5 text-slate-600'
                            : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {isActive ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Continuar</>}
                    </button>
                    <button
                        onClick={() => {
                            setTimeLeft(seconds);
                            setIsActive(true);
                            setIsFinished(false);
                        }}
                        className="p-4 bg-slate-100 dark:bg-white/5 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                {isFinished && (
                    <motion.button
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={onClose}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 animate-pulse"
                    >
                        ¡Siguiente Serie!
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
}
