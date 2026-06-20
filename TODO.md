# Migration TODO (PocketBase/Firebase -> Supabase)

- [x] 1) Update `package.json`: remove `firebase` and `pocketbase`, add `@supabase/supabase-js`.
- [x] 2) Create `src/lib/supabase.js` with provided Supabase URL + anon key.

- [ ] 3) Remove PocketBase and Firebase files and imports (`src/lib/pocketbase*.js`, `src/lib/firebaseClient.js`).
- [x] 4) Fix authentication context to use Supabase (initial wiring).

- [ ] 4) Rewrite `src/contexts/AuthContext.jsx` to use Supabase Auth + admin role enforcement.
- [ ] 5) Rewrite `src/pages/PublicBeatsPage.jsx` to read categories/songs via Supabase.
- [ ] 6) Fix `src/contexts/PlaybackContext.jsx` to increment play counts via Supabase (and remove firebaseClient usage).
- [ ] 7) Fix audio player behavior if any remaining PocketBase URL generation is used.
- [ ] 8) Update admin pages/components to use Supabase CRUD and Storage for uploads.
- [ ] 9) Run `npm install` and `npm run build` until success with zero errors.
- [ ] 10) Produce final deliverables: modified file list, Supabase SQL, required storage buckets, remaining manual steps.

