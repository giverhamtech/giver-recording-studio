import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Music, Video } from 'lucide-react';

const getProductionAudioPath = (prod) => prod?.audio_file ?? prod?.audioFile ?? null;
const getProductionCoverPath = (prod) => prod?.cover_image ?? prod?.coverImage ?? null;
const getDisplayOrder = (prod) => Number(prod?.display_order ?? prod?.displayOrder ?? 0);

const ProductionManager = () => {
  const [productions, setProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    featured: false,
    visibility: 'public',
    displayOrder: 0
  });

  const fetchProductions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('productions')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === 'PGRST205') {
          setProductions([]);
          toast.error('Productions table is missing. Run the Supabase migration first.');
          return;
        }
        throw error;
      }
      setProductions(data || []);
    } catch (error) {
      console.error('Productions fetch error:', error);
      toast.error('Failed to load productions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  const resetForm = () => {
    setEditingProduction(null);
    setAudioFile(null);
    setCoverImage(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      featured: false,
      visibility: 'public',
      displayOrder: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const uploadMediaIfNeeded = async () => {
    let audioPath = getProductionAudioPath(editingProduction);
    let coverPath = getProductionCoverPath(editingProduction);

    if (audioFile) {
      const ext = audioFile.name.split('.').pop() || 'mp3';
      audioPath = `productions/audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('song-files').upload(audioPath, audioFile, { upsert: false });
      if (error) throw new Error(error.message || 'Audio upload failed');
    }

    if (coverImage) {
      const ext = coverImage.name.split('.').pop() || 'jpg';
      coverPath = `productions/covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('cover-images').upload(coverPath, coverImage, { upsert: false });
      if (error) throw new Error(error.message || 'Cover upload failed');
    }

    return { audioPath, coverPath };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Production title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const { audioPath, coverPath } = await uploadMediaIfNeeded();

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        video_url: formData.videoUrl?.trim() || null,
        featured: Boolean(formData.featured),
        visibility: formData.visibility,
        display_order: Number(formData.displayOrder) || 0,
        audio_file: audioPath || null,
        cover_image: coverPath || null
      };

      if (editingProduction) {
        const { error } = await supabase.from('productions').update(payload).eq('id', editingProduction.id);
        if (error) throw error;
        toast.success('Production updated successfully');
      } else {
        const { error } = await supabase.from('productions').insert(payload);
        if (error) throw error;
        toast.success('Production created successfully');
      }

      resetForm();
      fetchProductions();
    } catch (error) {
      console.error('Production save error:', error);
      toast.error(error?.message || 'Failed to save production');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (prod) => {
    setEditingProduction(prod);
    setAudioFile(null);
    setCoverImage(null);
    setFormData({
      title: prod?.title || '',
      description: prod?.description || '',
      videoUrl: prod?.video_url || '',
      featured: Boolean(prod?.featured),
      visibility: prod?.visibility || 'public',
      displayOrder: getDisplayOrder(prod)
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this production permanently?')) return;
    try {
      const { error } = await supabase.from('productions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Production deleted successfully');
      setProductions((prev) => prev.filter((prod) => prod.id !== id));
      if (editingProduction?.id === id) resetForm();
    } catch (error) {
      console.error('Production delete error:', error);
      toast.error('Failed to delete production');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>{editingProduction ? 'Edit Production' : 'Create Production'}</CardTitle>
          <CardDescription>Manage public and private production releases.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                <Input id="videoUrl" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." className="bg-background" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value }))}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input id="displayOrder" name="displayOrder" type="number" value={formData.displayOrder} onChange={handleInputChange} className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File</Label>
                <Input id="audioFile" type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <Input id="coverImage" type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="bg-background" />
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
                <Label htmlFor="featured" className="cursor-pointer mb-0">Mark as Featured</Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingProduction ? <><Edit className="w-4 h-4 mr-2" /> Save Changes</> : <><Plus className="w-4 h-4 mr-2" /> Create Production</>}
              </Button>
              {editingProduction && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting} className="border-border hover:bg-secondary">
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Manage Productions</CardTitle>
          <CardDescription>All productions currently available in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : productions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No productions found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productions.map((prod) => (
                <div key={prod.id} className="p-4 border border-border rounded-xl bg-background/50">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border/50">
                      {getProductionCoverPath(prod) ? (
                        <img
                          src={getPublicStorageUrl({ bucket: 'cover-images', path: getProductionCoverPath(prod) })}
                          alt={prod.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground truncate">{prod.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={prod.visibility === 'public' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {prod.visibility || 'public'}
                        </Badge>
                        {prod.featured && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">Featured</Badge>}
                        {prod.video_url && <Badge variant="outline" className="text-[10px] px-1.5 py-0"><Video className="w-3 h-3 mr-1" />Video</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">Order: {getDisplayOrder(prod)}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(prod)} className="text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(prod.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {getProductionAudioPath(prod) && (
                    <audio
                      controls
                      className="w-full h-10 mt-3 [&::-webkit-media-controls-panel]:bg-background"
                      src={getPublicStorageUrl({ bucket: 'song-files', path: getProductionAudioPath(prod) })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionManager;
