
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/firebaseClient.js';
import FeaturedBeatCard from './FeaturedBeatCard.jsx';

const FeaturedBeatsSection = () => {
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        // Querying featured songs up to 50 records as requested
        const records = await pb.collection('songs').getList(1, 50, {
          filter: 'featured=true && privacy="public"',
          sort: '-created',
          expand: 'category',
          $autoCancel: false
        });
        
        const formatted = records.items.map(song => {
          let coverUrl = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
          
          // Verify category image URLs are generated correctly using expanded relation
          if (song.coverImage) {
            coverUrl = pb.files.getURL(song, song.coverImage);
          } else if (song.expand?.category?.categoryImage) {
            coverUrl = pb.files.getURL(song.expand.category, song.expand.category.categoryImage);
          }

          // Verify audio file URLs are generated correctly
          const audioFileUrl = song.audioFile ? pb.files.getURL(song, song.audioFile) : null;

          return {
            id: song.id,
            title: song.title,
            artist: song.artist || 'Giver Recording Studio',
            category: song.expand?.category?.name || 'Uncategorized',
            artwork: coverUrl,
            url: audioFileUrl,
            slug: song.slug,
            audioFile: song.audioFile // passed for download button logic
          };
        });

        setFeaturedSongs(formatted);
      } catch (error) {
        console.error('Error fetching featured tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              FEATURED <span className="text-primary">TRACKS</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our handpicked, premium selections across multiple genres. High-quality instrumentals ready for your vocals.
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-16">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
                <Skeleton className="w-full h-[180px] rounded-none" />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredSongs.length === 0 ? (
          <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl mb-16">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Featured Tracks Currently</h3>
            <p className="text-muted-foreground">Check out the full catalog to find what you need.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-16">
            {featuredSongs.map((song, index) => (
              <motion.div 
                key={song.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <FeaturedBeatCard beat={song} playlist={featuredSongs} />
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
