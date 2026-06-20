
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { toast } from 'sonner';

const FOUNDER_SENTINEL_STATUS = 'founder_profile';
const formatSupabaseError = (stage, error) => {
  if (!error) return `${stage}: Unknown error`;
  const code = error.code ? `code=${error.code}` : null;
  const message = error.message ? `message=${error.message}` : null;
  const details = error.details ? `details=${error.details}` : null;
  const hint = error.hint ? `hint=${error.hint}` : null;
  const status = error.status ? `status=${error.status}` : null;
  return [stage, code, status, message, details, hint].filter(Boolean).join(' | ');
};
const mapFounderRecord = (row, table) => {
  if (!row) return null;
  if (table === 'artist_uploads') {
    return {
      ...row,
      founderName: row.founderName ?? row.artist_name ?? 'Giver Recording Studio Founder',
      founderImage: row.founderImage ?? row.cover_image ?? null,
      __table: table
    };
  }

  return {
    ...row,
    founderName: row.founderName ?? row.founder_name ?? 'Giver Recording Studio Founder',
    founderImage: row.founderImage ?? row.founder_image ?? null,
    __table: table
  };
};

export const useFounderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const resolveFounderTable = useCallback(async () => {
    const candidates = ['founderProfile', 'founder_profile', 'artist_uploads'];

    for (const table of candidates) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) return table;
    }

    return null;
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const table = await resolveFounderTable();
      if (!table) {
        setIsAvailable(false);
        setProfile(null);
        return;
      }

      setIsAvailable(true);

      const query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(1);
      const { data, error } =
        table === 'artist_uploads'
          ? await query.eq('status', FOUNDER_SENTINEL_STATUS)
          : await query;
      if (error) throw error;

      const records = data || [];
      if (records.length > 0) {
        setProfile(mapFounderRecord(records[0], table));
      } else {
        const payload =
          table === 'artist_uploads'
            ? {
                artist_name: 'Giver Recording Studio Founder',
                title: 'Founder Profile',
                status: FOUNDER_SENTINEL_STATUS
              }
            : {
                founder_name: 'Giver Recording Studio Founder'
              };

        const { data: inserted, error: insertErr } = await supabase
          .from(table)
          .insert(payload)
          .select('*')
          .single();

        if (insertErr) throw insertErr;
        setProfile(mapFounderRecord(inserted, table));
      }
    } catch (error) {
      console.error("Error fetching or creating founder profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const uploadImage = async (file) => {
    try {
      setIsLoading(true);
      const table = profile?.__table || (await resolveFounderTable());
      if (!table) {
        setIsAvailable(false);
        return false;
      }

      setIsAvailable(true);

      let currentProfileId = profile?.id;
      if (!currentProfileId) {
        const query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(1);
        const { data: existing, error: existingErr } =
          table === 'artist_uploads'
            ? await query.eq('status', FOUNDER_SENTINEL_STATUS)
            : await query;
        if (existingErr) throw existingErr;

        if ((existing || []).length > 0) {
          currentProfileId = existing[0].id;
        } else {
          const payload =
            table === 'artist_uploads'
              ? {
                  artist_name: 'Giver Recording Studio Founder',
                  title: 'Founder Profile',
                  status: FOUNDER_SENTINEL_STATUS
                }
              : { founderName: 'Giver Recording Studio Founder' };

          if (table !== 'artist_uploads') {
            payload.founder_name = 'Giver Recording Studio Founder';
          }

          const { data: inserted, error: insertErr } = await supabase
            .from(table)
            .insert(payload)
            .select('*')
            .single();
          if (insertErr) throw insertErr;
          currentProfileId = inserted.id;
        }
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `founder/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: false });
      if (uploadErr) throw new Error(formatSupabaseError('avatars upload failed', uploadErr));

      const founderImageValue = filePath;

      if (table === 'founder_profile') {
        const { error: columnCheckErr } = await supabase.from('founder_profile').select('id, founder_image').limit(1);
        if (columnCheckErr) {
          throw new Error(formatSupabaseError('founder_profile column check failed', columnCheckErr));
        }
      }

      const updatePayload =
        table === 'artist_uploads'
          ? { cover_image: founderImageValue }
          : { founder_image: founderImageValue };

      const { data: updated, error: updateErr } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', currentProfileId)
        .select('*')
        .single();

      if (updateErr) throw new Error(formatSupabaseError(`${table} update failed`, updateErr));
      setProfile(mapFounderRecord(updated, table));
      toast.success('Image uploaded and saved permanently.');
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.message || 'Founder image update failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async () => {
    if (!profile?.id) return false;
    try {
      setIsLoading(true);
      const table = profile.__table || (await resolveFounderTable());
      if (!table) {
        setIsAvailable(false);
        return false;
      }

      const updatePayload = table === 'artist_uploads' ? { cover_image: null } : { founder_image: null };

      const { data: updated, error } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;
      setProfile(mapFounderRecord(updated, table));
      toast.success('Image removed successfully.');
      return true;
    } catch (error) {
      console.error("Remove error:", error);
      toast.error('Failed to remove image.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = () => {
    if (profile && profile.founderImage) {
      return getPublicStorageUrl({ bucket: 'avatars', path: profile.founderImage });
    }
    // Fallback if no image is present
    return 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
  };

  return { 
    profile, 
    isAvailable,
    isLoading, 
    uploadImage, 
    removeImage, 
    getImageUrl,
    refreshProfile: fetchProfile 
  };
};

export default useFounderProfile;
