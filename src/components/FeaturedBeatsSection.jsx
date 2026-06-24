
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { SPOTLIGHT_SONGS_QUERY_KEY } from '@/lib/queryClient.js';
import FeaturedBeatCard from './FeaturedBeatCard.jsx';

const getCategoryId = (song) => song?.category ?? song?.category_id ?? null;
const getAudioPath = (song) => song?.audioFile ?? song?.audio_file ?? song?.mp3_file ?? null;
const getCoverPath = (song) => song?.coverImage ?? song?.cover_image ?? null;
const getCategoryImagePath = (category) =>
  category?.categoryImage ?? category?.category_image ?? category?.category_Image ?? null;
const getIsPublic = (song) => {
  if (typeof song?.privacy !== 'string') return true;
  return song.privacy.toLowerCase() === 'public';
};

const FeaturedBeatsSection = () => {
  const { data: spotlightSongs = [], isLoading } = useQuery({
    queryKey: SPOTLIGHT_SONGS_QUERY_KEY,
    queryFn: async () => {
      const [{ data: songsRes, error: songsErr }, { data: categoriesRes, error: categoriesErr }] = await Promise.all([
        supabase
          .from('songs')
          .select('*')
          .eq('is_featured', true)
          .eq('privacy', 'public')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('categories')
          .select('*')
      ]);

      if (songsErr) throw songsErr;
      if (categoriesErr) throw categoriesErr;

      const categoriesById = new Map((categoriesRes || []).map((cat) => [cat.id, cat]));

      return (songsRes || [])
        .filter((song) => getIsPublic(song))
        .map((song) => {
          let coverUrl = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
          const categoryObj = categoriesById.get(getCategoryId(song));
          const coverPath = getCoverPath(song);

          if (coverPath) {
            coverUrl = getPublicStorageUrl({ bucket: 'cover-images', path: coverPath }) || coverUrl;
          } else {
            const categoryImage = getCategoryImagePath(categoryObj);
            if (categoryImage) {
              coverUrl = getPublicStorageUrl({ bucket: 'cover-images', path: categoryImage }) || coverUrl;
            }
          }

          const audioPath = getAudioPath(song);
          const audioFileUrl = audioPath
            ? getPublicStorageUrl({ bucket: 'song-files', path: audioPath })
            : null;

          return {
            id: song.id,
            title: song.title,
            artist: song.artist || 'Giver Recording Studio',
            category: categoryObj?.name || 'Uncategorized',
            artwork: coverUrl,
            url: audioFileUrl,
            slug: song.slug || song.id,
            audioFile: audioPath
          };
        });
    }
  });

  return (
    <section className="py-16 md:py-24 bg-background border-t border-border/70 section-shell">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest rounded-full border border-primary/20 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Showcase
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              SPOTLIGHT <span className="text-primary">TRACKS</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our handpicked, premium selections across multiple genres. High-quality instrumentals ready for your vocals.
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5 mb-12 md:mb-14">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
                <Skeleton className="w-full h-[160px] rounded-none" />
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : spotlightSongs.length === 0 ? (
          <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl mb-14">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Spotlight Tracks Currently</h3>
            <p className="text-muted-foreground">Check out the full catalog to find what you need.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5 mb-12 md:mb-14">
            {spotlightSongs.map((song, index) => (
              <motion.div 
                key={song.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
                className="h-full"
              >
                <FeaturedBeatCard beat={song} playlist={spotlightSongs} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/beats">
            <Button size="lg" className="px-8 md:px-10 h-12 md:h-14 text-base md:text-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-all hover:-translate-y-1 shadow-sm">
              Explore Full Catalog
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBeatsSection;
