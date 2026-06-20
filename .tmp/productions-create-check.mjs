import { createClient } from '@supabase/supabase-js';

const s = createClient('https://wxhdyqunjbpohthtbslu.supabase.co', 'sb_publishable_nRbtUU7koKPaIC1Zu5E43w_QERZAHqF');
const payload = {
  title: 'Runtime Production',
  description: 'Runtime test',
  featured: false,
  visibility: 'public',
  display_order: 0
};
const res = await s.from('productions').insert(payload).select('*').single();
if (res.error) {
  console.log('PRODUCTIONS_CREATE_ERROR', res.error.code, res.error.message);
  process.exit(1);
}
console.log('PRODUCTIONS_CREATE_OK', res.data.id);
await s.from('productions').delete().eq('id', res.data.id);
