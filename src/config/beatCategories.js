
let CATEGORY_CONFIG = [
  { name: 'Afrobeat', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/51d9c90923d14361c6394ae064ad6817.jpg', isVisible: true, isDefault: true, order: 1 },
  { name: 'Amapiano', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/4e547f8a78b36457d6bd7d1e482e7621.jpg', isVisible: true, isDefault: false, order: 2 },
  { name: 'Afro Gospel', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/19fde7d19d91d3a5f216f299d2e89e22.jpg', isVisible: true, isDefault: false, order: 3 },
  { name: 'Fuji Hip Hop', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/b5b3a9dd23b4c415d3be274a279a43f3.jpg', isVisible: true, isDefault: false, order: 4 },
  { name: 'Instrumentals', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/2b5af88730f8b0d49c75b709eabdcb15.jpg', isVisible: true, isDefault: false, order: 5 },
  { name: 'Trap/Drill', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/ee7b887aafe6d9d07e4bf89b4c271656.jpg', isVisible: true, isDefault: false, order: 6 },
  { name: 'Dancehall', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/cb0d06b62718cfebd9aaeb0fa8de95aa.jpg', isVisible: true, isDefault: false, order: 7 },
  { name: 'R&B', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/2f5f91b39e0f3190ff41a82d736d9b9c.jpg', isVisible: true, isDefault: false, order: 8 },
  { name: 'Hip Hop', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/a6d9a5f7d5254a9d0586c5bcef579a19.jpg', isVisible: true, isDefault: false, order: 9 },
  { name: 'Reggae', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/68bae2a03c7165278e6ab913657206c4.jpg', isVisible: true, isDefault: false, order: 10 },
  { name: 'Highlife', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', isVisible: true, isDefault: false, order: 11 },
  { name: 'Cinematic', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', isVisible: true, isDefault: false, order: 12 },
  { name: 'Soul', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/8463e21e200c274233cb0830353c2c1c.jpg', isVisible: true, isDefault: false, order: 13 },
  { name: 'Artist Submissions', imageUrl: 'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/79808e21b940cf303006169f5c5686bd.jpg', isVisible: true, isDefault: false, order: 14 }
];

export const getCategoryConfig = () => [...CATEGORY_CONFIG].sort((a, b) => a.order - b.order);

export const updateCategoryConfig = (newConfig) => {
  CATEGORY_CONFIG = newConfig;
};

// Proxies to auto-reflect current config where possible
export const getCategoriesList = () => CATEGORY_CONFIG.map(c => c.name);

export const getCategoryImagesMap = () => CATEGORY_CONFIG.reduce((acc, c) => {
  acc[c.name] = c.imageUrl;
  return acc;
}, {});

// Exported static bindings for simple imports
export const CATEGORIES = getCategoriesList();
export const CATEGORY_IMAGES = getCategoryImagesMap();

export default {
  getCategoryConfig,
  updateCategoryConfig,
  getCategoriesList,
  getCategoryImagesMap,
  CATEGORIES,
  CATEGORY_IMAGES
};
