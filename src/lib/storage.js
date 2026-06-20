export const getPublicStorageUrl = ({ bucket, path }) => {
  if (!bucket || !path) return null;
  if (typeof path === 'string' && /^(https?:\/\/|data:|blob:)/i.test(path)) return path;
  const storageBase = import.meta.env.VITE_SUPABASE_URL || 'https://wxhdyqunjbpohthtbslu.supabase.co';
  const normalizedPath = String(path).replace(/^\/+/, '').replace(/\\/g, '/');
  // Public URLs for Supabase Storage: {supabaseUrl}/storage/v1/object/public/{bucket}/{path}
  return `${storageBase}/storage/v1/object/public/${bucket}/${normalizedPath}`;
};

