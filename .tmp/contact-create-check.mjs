import { createClient } from '@supabase/supabase-js';

const s = createClient('https://wxhdyqunjbpohthtbslu.supabase.co', 'sb_publishable_nRbtUU7koKPaIC1Zu5E43w_QERZAHqF');
const payload = { name: 'Runtime Contact', email: 'runtime-contact@example.com', subject: 'Runtime check', message: 'Contact system test', status: 'unread' };
const res = await s.from('contact_messages').insert(payload).select('*').single();
if (res.error) {
  console.log('CONTACT_CREATE_ERROR', res.error.code, res.error.message);
  process.exit(1);
}
console.log('CONTACT_CREATE_OK', res.data.id);
await s.from('contact_messages').delete().eq('id', res.data.id);
