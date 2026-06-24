
import { useState, useEffect } from 'react';

export default function useLastCategory() {
  const [lastCategory, setLastCategoryState] = useState('');

  useEffect(() => {
    setLastCategoryState('');
  }, []);

  const setLastCategory = (category) => {
    if (!category) return;
    setLastCategoryState(category);
  };

  const getLastCategory = () => {
    return lastCategory;
  };

  return { lastCategory, setLastCategory, getLastCategory };
}
