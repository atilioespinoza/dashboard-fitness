import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    full_name: string;
    birth_date: string;
    height: number;
    gender: 'Masculino' | 'Femenino' | 'Otro';
    activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
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
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        // Profile doesn't exist yet, we might want to create a default one
                        // or just leave it null
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
                        gender: data.gender || 'Masculino',
                        activity_level: data.activity_level || 'moderately_active'
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
                    gender: 'Masculino',
                    activity_level: 'moderately_active'
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
