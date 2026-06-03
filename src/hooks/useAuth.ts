import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
            } else if (event === 'SIGNED_OUT') {
                setIsPasswordRecovery(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading, isPasswordRecovery, setIsPasswordRecovery };
};
