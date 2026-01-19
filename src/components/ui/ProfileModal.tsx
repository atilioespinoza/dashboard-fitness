import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Ruler, Calendar, Activity, Save, Target, Footprints, Bell } from 'lucide-react';
import { requestNotificationPermission } from '../../lib/notifications';
import { UserProfile } from '../../hooks/useProfile';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile | null;
    onUpdate: (updates: Partial<UserProfile>) => Promise<void>;
}

export function ProfileModal({ isOpen, onClose, profile, onUpdate }: ProfileModalProps) {
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        height: profile?.height || 170,
        gender: profile?.gender || 'Masculino',
        birth_date: profile?.birth_date || '1990-01-01',
        target_weight: profile?.target_weight || 85,
        target_waist: profile?.target_waist || 83,
        target_body_fat: profile?.target_body_fat || 13,
        target_steps: profile?.target_steps || 8000,
        notifications_enabled: profile?.notifications_enabled || false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                height: profile.height || 170,
                gender: profile.gender || 'Masculino',
                birth_date: profile.birth_date || '1990-01-01',
                target_weight: profile.target_weight || 85,
                target_waist: profile.target_waist || 83,
                target_body_fat: profile.target_body_fat || 13,
                target_steps: profile.target_steps || 8000,
                notifications_enabled: profile.notifications_enabled || false
            });
        }
    }, [profile, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert('Error al guardar: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">
                                        Perfil <span className="text-blue-600">Fitness</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajustes Biométricos</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                placeholder="Tu nombre completo"
                                            />
                                        </div>
                                    </div>

                                    {/* Height */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estatura (cm)</label>
                                        <div className="relative">
                                            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="number"
                                                value={formData.height}
                                                onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sexo Biológico</label>
                                        <select
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    {/* Birth Date */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha de Nacimiento</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Goals Section */}
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 block">Objetivos y Metas</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Peso Meta</label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.target_weight}
                                                    onChange={e => setFormData({ ...formData, target_weight: parseFloat(e.target.value) })}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Cintura Meta</label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                                <input
                                                    type="number"
                                                    value={formData.target_waist}
                                                    onChange={e => setFormData({ ...formData, target_waist: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Grasa Meta %</label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                                <input
                                                    type="number"
                                                    value={formData.target_body_fat}
                                                    onChange={e => setFormData({ ...formData, target_body_fat: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pasos Meta</label>
                                            <div className="relative">
                                                <Footprints className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                                <input
                                                    type="number"
                                                    step="500"
                                                    value={formData.target_steps}
                                                    onChange={e => setFormData({ ...formData, target_steps: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications Toggle */}
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                                                <Bell size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Recordatorios Inteligentes</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Proteína y Metas Diarias</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const newVal = !formData.notifications_enabled;
                                                if (newVal) {
                                                    const granted = await requestNotificationPermission();
                                                    if (!granted) {
                                                        alert("No se otorgaron permisos para notificaciones.");
                                                        return;
                                                    }
                                                }
                                                setFormData({ ...formData, notifications_enabled: newVal });
                                            }}
                                            className={`w-12 h-6 rounded-full transition-all relative ${formData.notifications_enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notifications_enabled ? 'left-7 shadow-lg shadow-indigo-600/50' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Activity className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Guardar Perfil
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
