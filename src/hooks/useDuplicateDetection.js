
import { useCallback } from 'react';
import pb from '@/lib/firebaseClient.js';

export const useDuplicateDetection = () => {
  const checkForDuplicate = useCallback(async (title, file = null) => {
    if (!title) return { isDuplicate: false, reason: null };

    // Clean title for searching (escape quotes)
    const searchTitle = title.replace(/"/g, '\\"').trim();

    try {
      // 1. Check Beats Collection
      const beats = await pb.collection('beats').getList(1, 1, {
        filter: `title ~ "${searchTitle}"`,
        $autoCancel: false
      });
      if (beats.items.length > 0) {
        return { isDuplicate: true, reason: 'Title already exists in Beats collection' };
      }

      // 2. Check Productions Collection
      const productions = await pb.collection('productions').getList(1, 1, {
        filter: `title ~ "${searchTitle}"`,
        $autoCancel: false
      });
      if (productions.items.length > 0) {
        return { isDuplicate: true, reason: 'Title already exists in Productions collection' };
      }

      // 3. Check Artist Submissions Collection
      const submissions = await pb.collection('artistSubmissions').getList(1, 1, {
        filter: `songTitle ~ "${searchTitle}"`,
        $autoCancel: false
      });
      if (submissions.items.length > 0) {
        return { isDuplicate: true, reason: 'Title already exists in Artist Submissions' };
      }

      // 4. File match simulation based on size + name combo
      if (file) {
        // Without complex audio fingerprinting libraries, 
        // we approximate by checking exact title match, which we already did above.
        // If a file size match query was needed, it would be added here if PB schema supported it.
      }

      return { isDuplicate: false, reason: null };
    } catch (err) {
      console.error('Duplicate detection error:', err);
      return { isDuplicate: false, reason: null }; // Default to allow on error
    }
  }, []);

  return { checkForDuplicate };
};

export default useDuplicateDetection;
