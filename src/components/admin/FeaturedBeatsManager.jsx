
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase.js';
import { SPOTLIGHT_SONGS_QUERY_KEY, SONGS_ADMIN_QUERY_KEY } from '@/lib/queryClient.js';
import { toast } from 'sonner';

const getCategoryId = (song) => song?.category ?? song?.category_id ?? null;
const getCreatedValue = (song) => song?.created_at ?? song?.created ?? null;

const FeaturedBeatsManager = () => {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);

  const { data: songs = [], isLoading } = useQuery({
    queryKey: SONGS_ADMIN_QUERY_KEY,
    queryFn: async () => {
      const [{ data: songsRes, error: songsErr }, { data: categoriesRes, error: categoriesErr }] = await Promise.all([
        supabase
          .from('songs')
          .select('*'),
        supabase.from('categories').select('id, name')
      ]);

      if (songsErr) throw songsErr;
      if (categoriesErr) throw categoriesErr;

      const sortedSongs = [...(songsRes || [])].sort((a, b) => {
        const av = getCreatedValue(a);
        const bv = getCreatedValue(b);
        if (!av && !bv) return 0;
        if (!av) return 1;
        if (!bv) return -1;
        return new Date(bv).getTime() - new Date(av).getTime();
      });

      const categoriesById = new Map((categoriesRes || []).map((c) => [c.id, c.name]));
      return sortedSongs.map((song) => ({
        ...song,
        categoryName: categoriesById.get(getCategoryId(song)) || 'Uncategorized'
      }));
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, nextStatus }) => {
      const updatePayload = nextStatus ? { is_featured: true } : { is_featured: false };
      const { data: updatedSong, error } = await supabase
        .from('songs')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!updatedSong) {
        throw new Error('No song row was updated');
      }

      return updatedSong;
    }
  });

  const toggleFeatured = async (id, currentStatus) => {
    try {
      setUpdatingId(id);
      const nextStatus = !currentStatus;
      const updatedSong = await toggleFeaturedMutation.mutateAsync({ id, nextStatus });

      console.log('Update response:', updatedSong);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: SONGS_ADMIN_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SONGS_ADMIN_QUERY_KEY })
      ]);
      toast.success(`Song ${nextStatus ? 'added to' : 'removed from'} homepage spotlight.`);
    } catch (error) {
      console.log('Error:', error);
      console.error('Update error:', error);
      toast.error('Failed to update spotlight status in database');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Manage Homepage Spotlight
        </CardTitle>
        <CardDescription>
          Select which tracks appear in the homepage spotlight section. Changes here persist to the database and update the live website immediately.
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
                  song.is_featured ? 'bg-primary/5 border-primary/50' : 'bg-background/50 border-border hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 pr-4">
                    <h4 className="font-bold text-foreground truncate" title={song.title}>{song.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {song.categoryName} • <span className={song.privacy === 'public' ? 'text-teal-500' : 'text-amber-500'}>{song.privacy}</span>
                    </p>
                  </div>
                  {song.is_featured && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                </div>
                
                <Button 
                  variant={song.is_featured ? 'outline' : 'secondary'} 
                  className={`w-full mt-auto ${song.is_featured ? 'border-primary/50 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive' : 'text-secondary-foreground hover:bg-primary hover:text-primary-foreground'}`}
                  disabled={updatingId === song.id}
                  onClick={() => toggleFeatured(song.id, song.is_featured)}
                >
                  {updatingId === song.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : song.is_featured ? (
                    'Remove from Spotlight'
                  ) : (
                    'Set as Spotlight'
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
