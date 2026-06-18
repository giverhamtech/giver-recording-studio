
import React, { useState, useEffect } from 'react';
import { Loader2, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const FeaturedBeatsManager = () => {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const res = await pb.collection('songs').getFullList({ 
        sort: '-created', 
        expand: 'category',
        $autoCancel: false 
      });
      setSongs(res);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const toggleFeatured = async (id, currentStatus) => {
    try {
      setUpdatingId(id);
      // Persist the change permanently to the shared database
      await pb.collection('songs').update(id, { featured: !currentStatus }, { $autoCancel: false });
      
      toast.success(`Song ${!currentStatus ? 'marked as' : 'removed from'} featured tracks!`);
      
      // Update local state to reflect DB change instantly
      setSongs(songs.map(s => s.id === id ? { ...s, featured: !currentStatus } : s));
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update featured status in database');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Manage Featured Tracks
        </CardTitle>
        <CardDescription>
          Select which tracks appear prominently in the Featured Beats section on the homepage. Changes here persist to the database and update the live website immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
            No tracks found in the database to feature.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map(song => (
              <div 
                key={song.id} 
                className={`flex flex-col p-4 border rounded-xl transition-all ${
                  song.featured ? 'bg-primary/5 border-primary/50' : 'bg-background/50 border-border hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 pr-4">
                    <h4 className="font-bold text-foreground truncate" title={song.title}>{song.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {song.expand?.category?.name || 'Uncategorized'} • <span className={song.privacy === 'public' ? 'text-teal-500' : 'text-amber-500'}>{song.privacy}</span>
                    </p>
                  </div>
                  {song.featured && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                </div>
                
                <Button 
                  variant={song.featured ? 'outline' : 'secondary'} 
                  className={`w-full mt-auto ${song.featured ? 'border-primary/50 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive' : 'text-secondary-foreground hover:bg-primary hover:text-primary-foreground'}`}
                  disabled={updatingId === song.id}
                  onClick={() => toggleFeatured(song.id, song.featured)}
                >
                  {updatingId === song.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : song.featured ? (
                    'Remove from Featured'
                  ) : (
                    'Set as Featured'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeaturedBeatsManager;
