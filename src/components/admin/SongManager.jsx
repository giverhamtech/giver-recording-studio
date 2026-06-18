
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Music, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const SongManager = () => {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    privacy: 'public',
    featured: false
  });
  
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [songsRes, catsRes] = await Promise.all([
        pb.collection('songs').getFullList({ expand: 'category', sort: '-created', $autoCancel: false }),
        pb.collection('categories').getFullList({ sort: 'displayOrder', $autoCancel: false })
      ]);
      setSongs(songsRes);
      setCategories(catsRes);
      if (catsRes.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catsRes[0].id }));
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
  }, []);

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
      
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('privacy', formData.privacy);
      payload.append('featured', formData.featured);
      
      if (audioFile) payload.append('audioFile', audioFile);
      if (coverImage) payload.append('coverImage', coverImage);

      await pb.collection('songs').create(payload, { $autoCancel: false });
      
      toast.success('Song uploaded and saved to database successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: categories.length > 0 ? categories[0].id : '',
        privacy: 'public',
        featured: false
      });
      setAudioFile(null);
      setCoverImage(null);
      
      // Refresh list
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload song. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song permanently?')) return;
    
    try {
      await pb.collection('songs').delete(id, { $autoCancel: false });
      toast.success('Song deleted successfully');
      setSongs(songs.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete song');
    }
  };

  return (
    <div className="space-y-8">
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
                  id="featured" 
                  name="featured" 
                  checked={formData.featured} 
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="featured" className="cursor-pointer mb-0">Mark as Featured Track</Label>
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
                    {song.coverImage ? (
                      <img src={pb.files.getURL(song, song.coverImage)} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground truncate">{song.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{song.expand?.category?.name || 'Uncategorized'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={song.privacy === 'public' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {song.privacy}
                      </Badge>
                      {song.featured && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">Featured</Badge>}
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
    </div>
  );
};

export default SongManager;
