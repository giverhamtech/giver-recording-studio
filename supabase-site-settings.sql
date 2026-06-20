-- Site Settings runtime configuration
-- Run this script in Supabase SQL Editor.

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Giver Recording Studio',
  tagline text,
  logo_url text,
  favicon_url text,
  footer_copyright text,
  footer_text text,
  contact_email text,
  phone_number text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  youtube_url text,
  tiktok_url text,
  whatsapp_url text,
  privacy_policy text,
  terms_of_service text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id)
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_site_settings_updated_at();

insert into public.site_settings (
  id,
  site_name,
  tagline,
  logo_url,
  favicon_url,
  footer_copyright,
  footer_text,
  contact_email,
  phone_number,
  facebook_url,
  instagram_url,
  twitter_url,
  youtube_url,
  tiktok_url,
  whatsapp_url,
  privacy_policy,
  terms_of_service
)
values (
  1,
  'Giver Recording Studio',
  'Professional music production',
  'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/68be90d9445bbceca2aa1bc3d0eb7e0a.jpg',
  '/vite.svg',
  'All Rights Reserved',
  'Professional music production, recording, and mixing services in Lagos, Nigeria.',
  'giverrecords@gmail.com',
  '+2348075388856',
  null,
  'https://instagram.com/giverrecords',
  'https://x.com/giverham',
  null,
  'https://tiktok.com/@giverham',
  'https://wa.me/2348075388856',
  'Last Updated: June 20, 2026

Welcome to Giver Recording Studio. We value your privacy and are committed to protecting your personal information.

1. Data Collection
We may collect your name, email address, phone number, booking details, and messages you submit through forms on this website.

2. Cookies
This website may use cookies and similar technologies to improve user experience, remember preferences, and analyze site traffic.

3. Contact Forms and Bookings
When you submit contact forms or booking requests, the information is stored securely to help us respond to your request and manage studio services.

4. Email Addresses
Email addresses you provide are used only for communication related to inquiries, bookings, submissions, and service updates.

5. Music Submissions
Files, metadata, and details submitted through our artist submission tools are processed for review and service delivery.

6. User Responsibilities
You are responsible for ensuring that all information and files you submit are accurate, lawful, and do not infringe third-party rights.

7. Copyright and Ownership
All website content, branding, and media remain the property of Giver Recording Studio or respective owners unless stated otherwise.

8. Limitation of Liability
While we strive to maintain secure and reliable services, Giver Recording Studio is not liable for indirect or consequential damages resulting from use of this website.

9. Contact Information
If you have privacy-related questions, contact us at giverrecords@gmail.com.

By continuing to use this website, you agree to this Privacy Policy.',
  'Last Updated: June 20, 2026

Welcome to Giver Recording Studio. By using this website, you agree to the following terms and conditions.

Acceptance of Terms

By accessing or using our website and services, you agree to comply with these Terms of Service.

Services

Giver Recording Studio provides music production, recording, mixing, mastering, beat licensing, and related creative services.

Intellectual Property

All music, beats, artwork, logos, and content displayed on this website are the property of Giver Recording Studio or their respective owners. Unauthorized copying, redistribution, or commercial use is prohibited without written permission.

User Submissions

Users who submit music, messages, or booking requests are responsible for the content they provide. Illegal, offensive, or copyrighted material belonging to others must not be submitted.

Payments and Bookings

Payments made for studio sessions and services are subject to the agreed terms between the client and Giver Recording Studio. Booking dates may be adjusted due to unforeseen circumstances.

External Links

Our website may contain links to third-party platforms such as YouTube, Instagram, TikTok, WhatsApp, and X (Twitter). We are not responsible for the content or policies of these external websites.

Limitation of Liability

Giver Recording Studio shall not be held liable for any direct or indirect damages arising from the use of this website or its services.

Changes to These Terms

We reserve the right to update these Terms of Service at any time. Changes become effective immediately after publication on this website.

Contact Information

For questions regarding these Terms of Service, please contact:

Giver Recording Studio

Email: giverrecords@gmail.com

Lagos, Nigeria

Thank you for choosing Giver Recording Studio.'
)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
on public.site_settings
for select
using (true);

drop policy if exists site_settings_admin_insert on public.site_settings;
create policy site_settings_admin_insert
on public.site_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
on public.site_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_settings_admin_delete on public.site_settings;
create policy site_settings_admin_delete
on public.site_settings
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists site_assets_public_read on storage.objects;
create policy site_assets_public_read
on storage.objects
for select
using (bucket_id = 'site-assets');

drop policy if exists site_assets_admin_insert on storage.objects;
create policy site_assets_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_assets_admin_update on storage.objects;
create policy site_assets_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
)
with check (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_assets_admin_delete on storage.objects;
create policy site_assets_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);
