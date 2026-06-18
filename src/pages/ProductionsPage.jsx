
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Music, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EnhancedAudioCard from '@/components/EnhancedAudioCard.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const ProductionsPage = () => {
  const [productions, setProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        setIsLoading(true);
        // Querying productions collection directly from the shared persistent database
        const result = await pb.collection('productions').getList(1, 50, {
          sort: '-created',
          $autoCancel: false
        });
        setProductions(result.items);
      } catch (err) {
        console.error('Error fetching productions:', err);
        setError('Failed to load database productions. Please try again later.');
        toast.error('Failed to load productions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductions();
  }, []);

  const featured = productions.filter(p => p.isFeatured);
  const latest = productions.filter(p => !p.isFeatured);

  // Generate playlist array for audio context with correct db paths
  const currentPlaylist = productions.filter(p => p.audioFile).map(p => ({
    id: p.id,
    title: p.title,
    artist: p.artist || 'Giver Recording Studio',
    category: p.genre || 'Uncategorized',
    artwork: p.coverImage ? pb.files.getURL(p, p.coverImage) : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    url: pb.files.getURL(p, p.audioFile)
  }));

  return (
    <>
      <Helmet>
        <title>Our Productions - Giver Recording Studio</title>
        <meta name="description" content="Explore the latest music productions, mixes, and masters from Giver Recording Studio." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-20 bg-secondary/50 border-b border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
                OUR <span className="text-accent">PRODUCTIONS</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                Discover the sound of excellence. Here are some of our proudest full productions, highlighting our commitment to high-quality audio.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-xl text-destructive mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-24">
                {featured.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4 flex items-center gap-3">
                      <span className="w-2 h-8 bg-accent rounded-full"></span>
                      Featured Projects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {featured.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                          <EnhancedAudioCard 
                            title={item.title} 
                            artist={item.artist} 
                            genre={item.genre} 
                            coverUrl={item.coverImage ? pb.files.getURL(item, item.coverImage) : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'} 
                            audioUrl={item.audioFile ? pb.files.getURL(item, item.audioFile) : null} 
                            playlist={currentPlaylist} 
                            streamingLinks={{
                              spotify: item.spotifyUrl,
                              appleMusic: item.appleMusicUrl,
                              soundCloud: item.soundCloudUrl,
                              youtube: item.youtubeUrl
                            }} 
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {latest.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4 flex items-center gap-3">
                      <span className="w-2 h-8 bg-primary rounded-full"></span>
                      Latest Releases
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {latest.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                          <EnhancedAudioCard 
                            title={item.title} 
                            artist={item.artist} 
                            genre={item.genre} 
                            coverUrl={item.coverImage ? pb.files.getURL(item, item.coverImage) : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'} 
                            audioUrl={item.audioFile ? pb.files.getURL(item, item.audioFile) : null} 
                            playlist={currentPlaylist} 
                            streamingLinks={{
                              spotify: item.spotifyUrl,
                              appleMusic: item.appleMusicUrl,
                              soundCloud: item.soundCloudUrl,
                              youtube: item.youtubeUrl
                            }} 
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {productions.length === 0 && (
                  <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-border">
                    <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">No database productions found</h3>
                    <p className="text-muted-foreground">Check back later for new releases.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ProductionsPage;
