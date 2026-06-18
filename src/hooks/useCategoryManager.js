
import { useState, useCallback } from 'react';
import pb from '@/lib/firebaseClient.js';
import { toast } from 'sonner';
import { getCategoryConfig, updateCategoryConfig } from '@/config/beatCategories.js';

export const useCategoryManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState(getCategoryConfig());

  const refreshLocalState = useCallback(() => {
    setCategories(getCategoryConfig());
  }, []);

  const updateRecords = async (collection, filterField, oldName, newName = null, newImage = null) => {
    try {
      const records = await pb.collection(collection).getFullList({
        filter: `${filterField}="${oldName}"`,
        $autoCancel: false
      });

      let updatedCount = 0;
      for (const record of records) {
        const data = {};
        if (newName) data[filterField] = newName;
        if (newImage) data.categoryImage = newImage;

        try {
          await pb.collection(collection).update(record.id, data, { $autoCancel: false });
          updatedCount++;
        } catch (e) {
          console.warn(`Failed to update ${collection} record ${record.id}:`, e);
        }
      }
      return updatedCount;
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      return 0;
    }
  };

  const useUpdateCategoryImage = () => {
    return async (categoryName, imageUrl) => {
      setIsLoading(true);
      try {
        const currentConfig = getCategoryConfig();
        const updatedConfig = currentConfig.map(c => 
          c.name === categoryName ? { ...c, imageUrl } : c
        );
        updateCategoryConfig(updatedConfig);
        refreshLocalState();

        const beatsUpdated = await updateRecords('beats', 'category', categoryName, null, imageUrl);
        const prodsUpdated = await updateRecords('productions', 'genre', categoryName, null, imageUrl);

        return true;
      } catch (error) {
        toast.error('Failed to update category image globally.');
        return false;
      } finally {
        setIsLoading(false);
      }
    };
  };

  const useRenameCategory = () => {
    return async (oldName, newName) => {
      setIsLoading(true);
      try {
        const currentConfig = getCategoryConfig();
        if (currentConfig.some(c => c.name.toLowerCase() === newName.toLowerCase())) {
          toast.error('A category with this name already exists.');
          return false;
        }

        const updatedConfig = currentConfig.map(c => 
          c.name === oldName ? { ...c, name: newName } : c
        );
        updateCategoryConfig(updatedConfig);
        refreshLocalState();

        const beatsUpdated = await updateRecords('beats', 'category', oldName, newName);
        const prodsUpdated = await updateRecords('productions', 'genre', oldName, newName);
        
        toast.success(`Renamed to ${newName}. Synced ${beatsUpdated} beats & ${prodsUpdated} productions.`);
        return true;
      } catch (error) {
        toast.error('Failed to rename category.');
        return false;
      } finally {
        setIsLoading(false);
      }
    };
  };

  const useCreateCategory = () => {
    return async (name, imageUrl, isDefault) => {
      setIsLoading(true);
      try {
        const currentConfig = getCategoryConfig();
        if (currentConfig.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          toast.error('Category already exists.');
          return false;
        }

        let updatedConfig = [...currentConfig];
        if (isDefault) {
          updatedConfig = updatedConfig.map(c => ({ ...c, isDefault: false }));
        }

        updatedConfig.push({
          name,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
          isVisible: true,
          isDefault: isDefault || false,
          order: updatedConfig.length + 1
        });

        updateCategoryConfig(updatedConfig);
        refreshLocalState();
        toast.success(`Category "${name}" created successfully.`);
        return true;
      } catch (error) {
        toast.error('Failed to create category.');
        return false;
      } finally {
        setIsLoading(false);
      }
    };
  };

  const useDeleteCategory = () => {
    return async (categoryName, targetCategory = null) => {
      setIsLoading(true);
      try {
        const currentConfig = getCategoryConfig();
        
        if (targetCategory) {
          await updateRecords('beats', 'category', categoryName, targetCategory);
          await updateRecords('productions', 'genre', categoryName, targetCategory);
        } else {
          const beats = await pb.collection('beats').getFullList({ filter: `category="${categoryName}"`, $autoCancel: false });
          for (const b of beats) await pb.collection('beats').delete(b.id, { $autoCancel: false });
          
          const prods = await pb.collection('productions').getFullList({ filter: `genre="${categoryName}"`, $autoCancel: false });
          for (const p of prods) await pb.collection('productions').delete(p.id, { $autoCancel: false });
        }

        const updatedConfig = currentConfig.filter(c => c.name !== categoryName);
        updateCategoryConfig(updatedConfig);
        refreshLocalState();
        
        toast.success(`Category "${categoryName}" deleted.`);
        return true;
      } catch (error) {
        toast.error('Failed to delete category.');
        return false;
      } finally {
        setIsLoading(false);
      }
    };
  };

  return {
    categories,
    isLoading,
    useUpdateCategoryImage,
    useRenameCategory,
    useCreateCategory,
    useDeleteCategory,
    refreshLocalState
  };
};

export default useCategoryManager;
