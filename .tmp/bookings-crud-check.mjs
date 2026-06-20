import { createClient } from '@supabase/supabase-js';

const s = createClient('https://wxhdyqunjbpohthtbslu.supabase.co', 'sb_publishable_nRbtUU7koKPaIC1Zu5E43w_QERZAHqF');

const createPayload = {
  client_name: 'Runtime Test',
  email: 'runtime-test@example.com',
  phone: '+23400000000',
  preferred_date: '2026-06-25',
  service_type: 'Recording Session',
  message: 'Automated CRUD check',
  status: 'pending'
};

const createRes = await s.from('bookings').insert(createPayload).select('*').single();
if (createRes.error) {
  console.log('BOOKINGS_CREATE_ERROR', createRes.error.code, createRes.error.message);
  process.exit(1);
}

const id = createRes.data.id;
console.log('BOOKINGS_CREATE_OK', id);

const updateRes = await s.from('bookings').update({ status: 'confirmed' }).eq('id', id).select('*').single();
if (updateRes.error) {
  console.log('BOOKINGS_UPDATE_ERROR', updateRes.error.code, updateRes.error.message);
  process.exit(1);
}
console.log('BOOKINGS_UPDATE_OK', updateRes.data.status);

const deleteRes = await s.from('bookings').delete().eq('id', id);
if (deleteRes.error) {
  console.log('BOOKINGS_DELETE_ERROR', deleteRes.error.code, deleteRes.error.message);
  process.exit(1);
}
console.log('BOOKINGS_DELETE_OK', id);
