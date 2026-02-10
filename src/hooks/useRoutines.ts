import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Exercise } from '../data/exerciseDB';

export interface Routine {
    id: string;
    user_id: string;
    name: string;
    exercises: {
        exercise: Exercise;
        sets: number;
        reps: number;
        weight: number;
        restTimeSeconds: number;
    }[];
    created_at: string;
}

export const useRoutines = (userId?: string) => {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoutines = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error: sbError } = await supabase
                .from('workout_routines')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (sbError) throw sbError;
            setRoutines(data || []);
        } catch (err: any) {
            console.error('Error fetching routines:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutines();
    }, [userId]);

    const saveRoutine = async (name: string, exercises: any[]) => {
        if (!userId) return;
        try {
            const { data, error: sbError } = await supabase
                .from('workout_routines')
                .insert({
                    user_id: userId,
                    name,
                    exercises
                })
                .select()
                .single();

            if (sbError) throw sbError;
            setRoutines(prev => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error saving routine:', err);
            throw err;
        }
    };

    const deleteRoutine = async (id: string) => {
        try {
            const { error: sbError } = await supabase
                .from('workout_routines')
                .delete()
                .eq('id', id);

            if (sbError) throw sbError;
            setRoutines(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            console.error('Error deleting routine:', err);
            throw err;
        }
    };

    return { routines, loading, error, saveRoutine, deleteRoutine, refreshRoutines: fetchRoutines };
};
