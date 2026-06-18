
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header.jsx';
import AudioCard from '@/components/AudioCard.jsx';
import pb from '@/lib/firebaseClient.js';
import { toast } from 'sonner';
import { CATEGORIES } from '@/config/beatCategories.js';

const AdminUploadPage = () => {
  const [beats, setBeats] = useState([]);
  const [productions, setProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = async () => {
    try {
      const [beatsRes, prodRes] = await Promise.all([
        pb.collection('beats').getList(1, 50, { sort: '-created', $autoCancel: false }),
        pb.collection('productions').getList(1, 50, { sort: '-created', $autoCancel: false })
      ]);
      setBeats(beatsRes.items);
      setProductions(prodRes.items);
    } catch (error) {
      toast.error('Failed to load content');
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDelete = async (collection, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await pb.collection(collection).delete(id, { $autoCancel: false });
        toast.success('Item deleted successfully');
        fetchContent();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const BeatForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.target);
      try {
        await pb.collection('beats').create(formData, { $autoCancel: false });
        toast.success('Beat uploaded successfully');
        e.target.reset();
        fetchContent();
      } catch (error) {
        toast.error('Failed to upload beat');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select name="category" required>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea name="description" />
        </div>
        <div className="space-y-2">
          <Label>MP3 File</Label>
          <Input type="file" name="mp3_file" accept=".mp3" required />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading...' : 'Upload Beat'}
        </Button>
      </form>
    );
  };

  const ProductionForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.target);
      try {
        await pb.collection('productions').create(formData, { $autoCancel: false });
        toast.success('Production uploaded successfully');
        e.target.reset();
        fetchContent();
      } catch (error) {
        toast.error('Failed to upload production');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input name="title" required />
          </div>
          <div className="space-y-2">
            <Label>Artist</Label>
            <Input name="artist" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Genre</Label>
          <Input name="genre" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <Input type="file" name="coverImage" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label>Audio File</Label>
            <Input type="file" name="audioFile" accept=".mp3" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>YouTube URL</Label>
          <Input name="youtubeUrl" type="url" />
        </div>
        <div className="space-y-2">
          <Label>Spotify URL</Label>
          <Input name="spotifyUrl" type="url" />
        </div>
        <div className="space-y-2">
          <Label>Apple Music URL</Label>
          <Input name="appleMusicUrl" type="url" />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading...' : 'Upload Production'}
        </Button>
      </form>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin Upload - Giver Recording Studio</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Content Management</h1>
          
          <Tabs defaultValue="beats" className="space-y-8">
            <TabsList>
              <TabsTrigger value="beats">Beats</TabsTrigger>
              <TabsTrigger value="productions">Productions</TabsTrigger>
            </TabsList>

            <TabsContent value="beats" className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Upload New Beat</CardTitle></CardHeader>
                <CardContent><BeatForm /></CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {beats.map(beat => (
                  <div key={beat.id} className="relative group">
                    <AudioCard 
                      title={beat.title}
                      artist="Giver Recording Studio"
                      genre={beat.category}
                      audioUrl={beat.mp3_file ? pb.files.getURL(beat, beat.mp3_file) : null}
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete('beats', beat.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="productions" className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Upload New Production</CardTitle></CardHeader>
                <CardContent><ProductionForm /></CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productions.map(prod => (
                  <div key={prod.id} className="relative group">
                    <AudioCard 
                      title={prod.title}
                      artist={prod.artist}
                      genre={prod.genre}
                      coverUrl={prod.coverImage ? pb.files.getURL(prod, prod.coverImage) : null}
                      audioUrl={prod.audioFile ? pb.files.getURL(prod, prod.audioFile) : null}
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete('productions', prod.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminUploadPage;
