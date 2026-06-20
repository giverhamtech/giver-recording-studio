import { createClient } from '@supabase/supabase-js';

const s = createClient('https://wxhdyqunjbpohthtbslu.supabase.co', 'sb_publishable_nRbtUU7koKPaIC1Zu5E43w_QERZAHqF');
const tables = ['productions', 'contact_messages', 'bookings'];

for (const t of tables) {
  const { error } = await s.from(t).select('*').limit(1);
  if (error) {
    console.log(t + ' ERROR ' + (error.code || '') + ' ' + error.message);
  } else {
    console.log(t + ' OK');
  }
}
