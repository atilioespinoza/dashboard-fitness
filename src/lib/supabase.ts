import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
    // Browsers (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    // Serverless (Node.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
        console.error('Missing Supabase environment variables in server environment');
    }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

