
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useFeatureBeat = () => {
  const [featuredBeats, setFeaturedBeats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFeaturedBeats = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await pb.collection('productions').getList(1, 50, {
        filter: 'isFeatured = true',
        sort: '-created',
        $autoCancel: false
      });
      setFeaturedBeats(result.items || []);
      return result.items || [];
    } catch (error) {
      console.error('Error fetching featured beats:', error);
      toast.error('Failed to load featured beats');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFeaturedStatus = async (beatId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const updated = await pb.collection('productions').update(beatId, { 
        isFeatured: newStatus
      }, { $autoCancel: false });
      
      toast.success(`Beat ${newStatus ? 'marked as featured' : 'removed from featured'}`);
      return updated;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
      throw error;
    }
  };

  const watchFeaturedBeats = useCallback((callback) => {
    pb.collection('productions').subscribe('*', (e) => {
      if (e.action === 'create' || e.action === 'update' || e.action === 'delete') {
        callback(e);
      }
    });

    return () => {
      pb.collection('productions').unsubscribe('*');
    };
  }, []);

  return {
    featuredBeats,
    isLoading,
    getFeaturedBeats,
    toggleFeaturedStatus,
    watchFeaturedBeats
  };
};

export default useFeatureBeat;
