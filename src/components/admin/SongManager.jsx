
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Music, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { SPOTLIGHT_SONGS_QUERY_KEY, SONGS_ADMIN_QUERY_KEY } from '@/lib/queryClient.js';
import { generateSlug } from '@/lib/utils.js';
import { toast } from 'sonner';
import BatchUploadModal from '@/components/admin/BatchUploadModal.jsx';

const getCategoryId = (song) => song?.category ?? song?.category_id ?? null;
const getAudioPath = (song) => song?.audioFile ?? song?.audio_file ?? song?.mp3_file ?? null;
const getCoverPath = (song) => song?.coverImage ?? song?.cover_image ?? null;
const getCreatedValue = (song) => song?.created_at ?? song?.created ?? null;
const getDisplayOrder = (cat) => Number(cat?.display_order ?? cat?.displayOrder ?? cat?.display_Order ?? 0);
const sortByCreatedDesc = (rows) =>
  [...rows].sort((a, b) => {
    const av = getCreatedValue(a);
    const bv = getCreatedValue(b);
    if (!av && !bv) return 0;
    if (!av) return 1;
    if (!bv) return -1;
    return new Date(bv).getTime() - new Date(av).getTime();
  });

const formatSupabaseError = (stage, error) => {
  if (!error) return `${stage}: Unknown error`;
  const code = error.code ? `code=${error.code}` : null;
  const message = error.message ? `message=${error.message}` : null;
  const details = error.details ? `details=${error.details}` : null;
  const hint = error.hint ? `hint=${error.hint}` : null;
  const status = error.status ? `status=${error.status}` : null;
  return [stage, code, status, message, details, hint].filter(Boolean).join(' | ');
};

const SongManager = () => {
  const queryClient = useQueryClient();
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    privacy: 'public',
    is_featured: false
  });
  
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [{ data: songsRes, error: songsErr }, { data: catsRes, error: catsErr }] = await Promise.all([
        supabase
          .from('songs')
          .select('*'),
        supabase
          .from('categories')
          .select('*')
      ]);

      if (songsErr) throw songsErr;
      if (catsErr) throw catsErr;

      const songsData = sortByCreatedDesc(songsRes || []);
      const categoriesData = [...(catsRes || [])].sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));
      setSongs(songsData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load songs or categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      let audioPath = null;
      let coverPath = null;

      if (audioFile) {
        const audioExt = audioFile.name.split('.').pop() || 'mp3';
        audioPath = `songs/audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${audioExt}`;
        const { error: audioErr } = await supabase.storage
          .from('song-files')
          .upload(audioPath, audioFile, { upsert: false });
        if (audioErr) throw new Error(formatSupabaseError('song-files upload failed', audioErr));
      }

      if (coverImage) {
        const coverExt = coverImage.name.split('.').pop() || 'jpg';
        coverPath = `songs/covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${coverExt}`;
        const { error: coverErr } = await supabase.storage
          .from('cover-images')
          .upload(coverPath, coverImage, { upsert: false });
        if (coverErr) throw new Error(formatSupabaseError('cover-images upload failed', coverErr));
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        category_id: formData.category || null,
        privacy: formData.privacy,
        is_featured: Boolean(formData.is_featured),
        slug: generateSlug(formData.title)
      };

      if (audioPath) payload.audio_file = audioPath;
      if (coverPath) payload.cover_image = coverPath;

      console.info('songs.insert payload', payload);

      const { data: insertData, error } = await supabase.from('songs').insert(payload).select('*').maybeSingle();
      if (error) throw new Error(formatSupabaseError('songs insert failed', error));

      console.log('Insert response:', insertData);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: SONGS_ADMIN_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SONGS_ADMIN_QUERY_KEY })
      ]);
      
      toast.success('Song uploaded and saved to database successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: categories.length > 0 ? categories[0].id : '',
        privacy: 'public',
        is_featured: false
      });
      setAudioFile(null);
      setCoverImage(null);
      
      // Refresh list
      await fetchData();
    } catch (error) {
      console.log('Error:', error);
      console.error('Upload error:', error);
      toast.error(error?.message || 'Song upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song permanently?')) return;
    
    try {
      const { data: deleteData, error } = await supabase.from('songs').delete().eq('id', id).select('*').maybeSingle();
      if (error) throw error;
      console.log('Delete response:', deleteData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: SONGS_ADMIN_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SONGS_ADMIN_QUERY_KEY })
      ]);
      toast.success('Song deleted successfully');
      await fetchData();
    } catch (error) {
      console.log('Error:', error);
      console.error('Delete error:', error);
      toast.error('Failed to delete song');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Batch Upload</CardTitle>
          <CardDescription>Upload multiple tracks in one flow with shared settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsBatchModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <UploadCloud className="w-4 h-4 mr-2" /> Open Batch Uploader
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Upload New Song</CardTitle>
          <CardDescription>Add a new track to the shared persistent database.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="E.g., Summer Vibes" required className="bg-background" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy Status *</Label>
                <select 
                  id="privacy" 
                  name="privacy" 
                  value={formData.privacy} 
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="public">Public (Visible on website)</option>
                  <option value="unlisted">Unlisted (Direct link only)</option>
                  <option value="private">Private (Admin only)</option>
                </select>
              </div>

              <div className="space-y-2 flex items-center gap-2 pt-8">
                <input 
                  type="checkbox" 
                  id="is_featured" 
                  name="is_featured" 
                  checked={formData.is_featured} 
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_featured" className="cursor-pointer mb-0">Show in Homepage Spotlight</Label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief details about the track..." className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File (MP3/WAV) *</Label>
                <Input id="audioFile" type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <Input id="coverImage" type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} className="bg-background" />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading to Database...</> : <><Plus className="w-4 h-4 mr-2" /> Upload Song</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Manage Database Songs</CardTitle>
          <CardDescription>View and manage all songs currently stored in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No songs found in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map(song => (
                <div key={song.id} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-background/50 hover:bg-secondary transition-colors">
                  <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border/50">
                    {getCoverPath(song) ? (
                      <img
                        src={getPublicStorageUrl({ bucket: 'cover-images', path: getCoverPath(song) })}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground truncate">{song.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {categories.find((cat) => cat.id === getCategoryId(song))?.name || 'Uncategorized'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={song.privacy === 'public' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {song.privacy}
                      </Badge>
                      {song.is_featured && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">Spotlight</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(song.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BatchUploadModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        categories={categories}
        onUploadComplete={fetchData}
      />
    </div>
  );
};

export default SongManager;
