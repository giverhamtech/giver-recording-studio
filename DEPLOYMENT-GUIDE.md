# Security Hardening - Deployment Guide

## Overview
This document outlines the complete security hardening applied to the application and provides step-by-step deployment instructions.

## What Has Been Done

### ✓ Application-Level Security (Already Implemented)
1. **Route Protection**
   - `/admin` route protected by ProtectedAdminRoute component
   - Unauthenticated users automatically redirected to `/admin/login`
   - Session management with 30-minute inactivity timeout

2. **Admin Controls**
   - ProductionManager: Full CRUD for productions (create, edit, delete, featured toggle, visibility)
   - MessagesManager: View, mark read/unread, and delete contact messages
   - BookingsManager: Manage booking status (Pending→Confirmed→Completed) and delete
   - All managers within protected `/admin` route accessible only to authenticated admins

3. **Public Pages (Read-Only)**
   - ProductionsPage: Display productions with audio/video playback, no modification controls
   - ContactPage: Contact form submission only
   - BookingPage: Booking form submission only
   - Artist SubmissionPage: Form submission only
   - Public pages never expose edit/delete buttons or database modification controls

4. **Authentication**
   - Uses Supabase Auth with admin_users table verification
   - Admin access granted if user ID or email matches admin_users table
   - Login form restricts initial validation to admin email
   - Session tokens used for all admin operations

5. **Build Validation**
   - ✓ npm run build passes with no errors
   - ✓ No TypeScript compilation errors
   - ✓ No ESLint violations
   - ✓ All imports valid and components properly typed

### ⏳ Database-Level Security (REQUIRES MANUAL SQL EXECUTION)
The RLS (Row-Level Security) policies need to be updated to restrict write operations to authenticated users. Two SQL migration files are provided:

1. **supabase-productions-contact-bookings.sql** (already executed)
   - Created productions, contact_messages, and bookings tables
   - Created storage bucket policies
   - Applied initial RLS policies (permissive - allows all operations)

2. **supabase-security-hardening.sql** (NEEDS TO BE EXECUTED NOW)
   - Updates RLS policies to restrict writes to authenticated users only
   - Maintains public read access where needed
   - Restricts storage upload/download based on authentication

## Step-by-Step Deployment

### STEP 1: Update Database Security Policies (Required)

1. Open Supabase SQL Editor
   - Go to: https://app.supabase.com
   - Select project: wxhdyqunjbpohthtbslu
   - Navigate to SQL Editor tab

2. Create new query
   - Click "New Query"
   - Copy entire contents of `supabase-security-hardening.sql`
   - Paste into SQL Editor

3. Execute the migration
   - Click "Run" button
   - Wait for success message
   - Verify no errors in output

### STEP 2: Verify Database Changes

After executing the SQL:

1. Check RLS policies
   - Go to Authentication → Policies
   - Verify policies exist for:
     - productions table (read_public, insert_authenticated, update_authenticated, delete_authenticated)
     - contact_messages table (read_public, insert_public, update_authenticated, delete_authenticated)
     - bookings table (read_public, insert_public, update_authenticated, delete_authenticated)

2. Check storage policies
   - Go to Storage → Policies
   - Verify song-files bucket has read and write policies
   - Verify cover-images bucket has read and write policies

### STEP 3: Test Application Functionality

#### Test Admin Dashboard
1. Navigate to https://<your-vercel-domain>/admin
2. Login with admin credentials (if already logged in, skip to step 3)
3. Verify all tabs are accessible:
   - Overview (statistics)
   - Song Library (batch upload, featured toggle)
   - Categories (create/edit/delete)
   - Featured Area (toggle featured songs)
   - **Productions** (create/edit/delete)
   - Submissions (approve/reject artist submissions)
   - **Messages** (view/mark read/delete contact messages)
   - **Bookings** (manage status and delete bookings)
   - Diagnostics (system info)
   - Profile (founder image)

#### Test Productions System
1. Go to Productions tab
2. Create new production:
   - Title: "Test Production"
   - Description: "Testing"
   - Upload audio file from computer
   - Upload cover image from computer
   - Set visibility to "public"
   - Toggle featured if desired
   - Click Save
3. Verify production appears in list
4. Edit the production - change title and save
5. Delete the production - confirm it's removed from list

#### Test Contact Messages
1. Navigate to https://<your-vercel-domain>/contact
2. Fill contact form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Subject: "Test Message"
   - Message: "This is a test"
3. Submit form
4. Go to admin dashboard → Messages tab
5. Verify message appears in list with status "unread"
6. Click "Mark as Read" - verify status changes
7. Delete message - verify it's removed

#### Test Booking System
1. Navigate to https://<your-vercel-domain>/booking
2. Fill booking form:
   - Name: "Test Client"
   - Email: "client@example.com"
   - Phone: "+1234567890"
   - Service: Select from dropdown
   - Preferred Date: Pick a date
   - Message: "Test booking"
3. Submit form
4. Go to admin dashboard → Bookings tab
5. Verify booking appears with status "pending"
6. Change status to "confirmed" - verify it persists
7. Delete booking - verify it's removed

#### Test Public Pages (Read-Only)
1. Navigate to https://<your-vercel-domain>/productions
   - Verify productions display (if any created)
   - Verify no edit/delete buttons visible
   - Play audio - should work
   - View cover images - should load
2. Navigate to https://<your-vercel-domain>/ (Home)
   - Verify featured productions display
   - Verify no admin controls visible
3. Navigate to https://<your-vercel-domain>/beats
   - Verify songs display
   - Verify no edit/delete buttons visible

#### Test Access Control
1. Open private browser window (incognito mode)
2. Navigate to https://<your-vercel-domain>/admin
   - Should redirect to /admin/login
   - Cannot access dashboard without authentication
3. Try accessing public pages
   - All public pages should work normally
4. Try submitting forms (contact, booking)
   - Forms should submit successfully
   - Messages should appear in admin dashboard

### STEP 4: Validate Security

After all tests pass:

1. **Check Database Logs**
   - Supabase → Database → Logs
   - Verify no unauthorized access attempts
   - Verify insert/update/delete operations only by authenticated users

2. **Check Storage Access**
   - Supabase → Storage → Files
   - Verify files exist in correct paths:
     - productions/audio/[timestamp]-[random].[ext]
     - productions/covers/[timestamp]-[random].[ext]

3. **Browser Console**
   - Open DevTools (F12)
   - Check Console tab - should have no errors
   - Check Network tab - all API calls should be successful

### STEP 5: Prepare for Production Deployment

1. Verify all tests passed ✓
2. Verify build succeeds:
   ```bash
   npm run build
   ```
   Should complete with no errors

3. Commit changes:
   ```bash
   git add .
   git commit -m "feat: security hardening - restrict write ops to authenticated users"
   ```

4. Push to repository:
   ```bash
   git push origin main
   ```

5. Deploy to Vercel
   - Vercel automatically deploys on push to main
   - Wait for deployment to complete
   - Test at production URL

## Security Policy Summary

### Admin-Only Operations (requires /admin access + auth)
- ✓ Create production
- ✓ Edit production (title, description, featured, visibility)
- ✓ Delete production
- ✓ Upload audio files to song-files bucket
- ✓ Upload cover images to cover-images bucket
- ✓ Create/edit/delete songs
- ✓ Create/edit/delete categories
- ✓ Toggle featured status
- ✓ Mark contact messages as read/unread
- ✓ Delete contact messages
- ✓ Change booking status
- ✓ Delete bookings
- ✓ Approve/reject artist submissions

### Public-Only Operations (no authentication required)
- ✓ View productions (visibility='public')
- ✓ View songs
- ✓ Play audio
- ✓ View cover images
- ✓ Watch embedded videos
- ✓ Search and filter content
- ✓ Submit contact messages (inserts to contact_messages)
- ✓ Submit booking requests (inserts to bookings)
- ✓ Submit artist tracks (inserts to artistSubmissions)
- ✗ Cannot modify any metadata
- ✗ Cannot access admin routes
- ✗ Cannot see admin controls

### Data Access Rules

**Productions Table**
- Anyone can read public productions
- Only authenticated users can insert/update/delete
- RLS enforces at database level

**Contact Messages Table**
- Anyone can insert (public form submission)
- Only authenticated users can update/delete (admin moderation)
- RLS enforces at database level

**Bookings Table**
- Anyone can insert (public form submission)
- Only authenticated users can update/delete (admin management)
- RLS enforces at database level

**Storage Buckets**
- Anyone can read (needed for playback)
- Only authenticated users can write (admin uploads)
- RLS policies restrict based on bucket_id

## Troubleshooting

### Issue: Admin dashboard not loading
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "Productions table is missing" error
**Solution**: Run the supabase-productions-contact-bookings.sql migration first, then security-hardening.sql

### Issue: Cannot create production
**Solution**: Verify you're logged in to admin dashboard. Check browser console for errors. Verify admin_users table has your user.

### Issue: Public pages show "No content available"
**Solution**: Create content in admin dashboard with visibility='public'. Check database by querying table directly.

### Issue: File upload fails
**Solution**: Verify Supabase storage buckets exist. Check RLS policies allow authenticated access. Check file size not exceeded.

### Issue: Contact form submission fails
**Solution**: Verify contact_messages table exists. Check console for PGRST errors. Ensure privacy settings allow submissions.

## Performance Notes

- ProductionsPage uses infinite scroll pattern for large datasets
- Admin managers load data on component mount
- File uploads are chunked (handled by Supabase SDK)
- Session timeout prevents long-lived tokens from being compromised

## Next Steps

1. Execute `supabase-security-hardening.sql` in Supabase SQL Editor
2. Complete all tests in "STEP 3: Test Application Functionality"
3. Deploy to production via Git push to main branch
4. Monitor admin logs for any anomalies
5. Monitor storage usage and content consumption
