
import { useState, useEffect } from 'react';

export default function useLastCategory() {
  const [lastCategory, setLastCategoryState] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadCategory');
    if (saved) {
      setLastCategoryState(saved);
    }
  }, []);

  const setLastCategory = (category) => {
    if (!category) return;
    localStorage.setItem('lastUploadCategory', category);
    setLastCategoryState(category);
  };

  const getLastCategory = () => {
    return localStorage.getItem('lastUploadCategory');
  };

  return { lastCategory, setLastCategory, getLastCategory };
}
