import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    full_name: string;
    birth_date: string;
    height: number;
    gender: 'Masculino' | 'Femenino' | 'Otro';
}

export const useProfile = (userId?: string) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, birth_date, height, gender')
                    .eq('id', userId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        console.log("No profile found for user");
                    } else {
                        throw error;
                    }
                }

                if (data) {
                    setProfile({
                        id: data.id,
                        full_name: data.full_name || '',
                        birth_date: data.birth_date || '1990-01-01',
                        height: data.height || 170,
                        gender: data.gender || 'Masculino'
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!userId) return;
        try {
            const payload = {
                id: userId,
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(payload);

            if (error) throw error;

            // Actualizar el estado local inmediatamente
            setProfile(prev => ({
                ...(prev || {
                    id: userId,
                    full_name: '',
                    birth_date: '1990-01-01',
                    height: 170,
                    gender: 'Masculino'
                }),
                ...updates
            } as UserProfile));

        } catch (err: any) {
            setError(err.message);
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    return { profile, loading, error, updateProfile };
};
