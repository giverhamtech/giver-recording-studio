
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useFounderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const records = await pb.collection('founderProfile').getFullList({ $autoCancel: false });
      
      if (records.length > 0) {
        setProfile(records[0]);
      } else {
        // Create a default record so updates won't fail
        const newRecord = await pb.collection('founderProfile').create({
          founderName: 'Giver Recording Studio Founder'
        }, { $autoCancel: false });
        setProfile(newRecord);
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
      
      // Ensure we have a profile to update
      let currentProfileId = profile?.id;
      if (!currentProfileId) {
        const records = await pb.collection('founderProfile').getFullList({ $autoCancel: false });
        if (records.length > 0) {
          currentProfileId = records[0].id;
        } else {
          const newRecord = await pb.collection('founderProfile').create({
            founderName: 'Giver Recording Studio Founder'
          }, { $autoCancel: false });
          currentProfileId = newRecord.id;
        }
      }

      const formData = new FormData();
      formData.append('founderImage', file);
      
      const updated = await pb.collection('founderProfile').update(currentProfileId, formData, { $autoCancel: false });
      setProfile(updated);
      toast.success('Image uploaded and saved permanently.');
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to update image.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async () => {
    if (!profile?.id) return false;
    try {
      setIsLoading(true);
      const updated = await pb.collection('founderProfile').update(profile.id, { founderImage: null }, { $autoCancel: false });
      setProfile(updated);
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
      return pb.files.getURL(profile, profile.founderImage);
    }
    // Fallback if no image is present
    return 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
  };

  return { 
    profile, 
    isLoading, 
    uploadImage, 
    removeImage, 
    getImageUrl,
    refreshProfile: fetchProfile 
  };
};

export default useFounderProfile;
