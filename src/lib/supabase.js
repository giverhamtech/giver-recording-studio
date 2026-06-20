import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxhdyqunjbpohthtbslu.supabase.co';
const supabaseAnonKey = 'sb_publishable_nRbtUU7koKPaIC1Zu5E43w_QERZAHqF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;

