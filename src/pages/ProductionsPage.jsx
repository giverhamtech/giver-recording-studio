
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Music, Loader2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EnhancedAudioCard from '@/components/EnhancedAudioCard.jsx';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { toast } from 'sonner';

const getAudioPath = (prod) => prod?.audio_file ?? prod?.audioFile ?? null;
const getCoverPath = (prod) => prod?.cover_image ?? prod?.coverImage ?? null;
const getVisibility = (prod) => String(prod?.visibility ?? prod?.privacy ?? 'public').toLowerCase();
const getDisplayOrder = (prod) => Number(prod?.display_order ?? prod?.displayOrder ?? 0);
const getCreatedValue = (prod) => prod?.created_at ?? prod?.created ?? null;

const sortProductions = (rows) =>
  [...rows].sort((a, b) => {
    const orderDiff = getDisplayOrder(a) - getDisplayOrder(b);
    if (orderDiff !== 0) return orderDiff;
    const av = getCreatedValue(a);
    const bv = getCreatedValue(b);
    if (!av && !bv) return 0;
    if (!av) return 1;
    if (!bv) return -1;
    return new Date(bv).getTime() - new Date(av).getTime();
  });

const ProductionsPage = () => {
  const [productions, setProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('productions')
          .select('*')
          .eq('visibility', 'public');

        if (fetchError) {
          if (fetchError.code === 'PGRST205') {
            setProductions([]);
            setError(null);
            return;
          }
          throw fetchError;
        }

        setProductions(sortProductions(data || []));
      } catch (err) {
        console.error('Error fetching productions:', err);
        setError('Failed to load productions right now. Please try again later.');
        toast.error('Failed to load productions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductions();
  }, []);

  const visibleProductions = productions.filter((p) => getVisibility(p) === 'public');
  const spotlightProductions = visibleProductions.slice(0, 3);
  const latest = visibleProductions.slice(3);

  const currentPlaylist = visibleProductions.filter((p) => getAudioPath(p)).map((p) => ({
    id: p.id,
    title: p.title,
    artist: 'Giver Recording Studio',
    category: 'Production',
    artwork: getCoverPath(p)
      ? getPublicStorageUrl({ bucket: 'cover-images', path: getCoverPath(p) })
      : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    url: getPublicStorageUrl({ bucket: 'song-files', path: getAudioPath(p) })
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
                {spotlightProductions.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4 flex items-center gap-3">
                      <span className="w-2 h-8 bg-accent rounded-full"></span>
                      Spotlight Projects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {spotlightProductions.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                          <EnhancedAudioCard 
                            title={item.title} 
                            artist="Giver Recording Studio"
                            genre="Production"
                            coverUrl={getCoverPath(item) ? getPublicStorageUrl({ bucket: 'cover-images', path: getCoverPath(item) }) : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'}
                            audioUrl={getAudioPath(item) ? getPublicStorageUrl({ bucket: 'song-files', path: getAudioPath(item) }) : null}
                            playlist={currentPlaylist} 
                            streamingLinks={{ youtube: item.video_url || null }}
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
                            artist="Giver Recording Studio"
                            genre="Production"
                            coverUrl={getCoverPath(item) ? getPublicStorageUrl({ bucket: 'cover-images', path: getCoverPath(item) }) : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'}
                            audioUrl={getAudioPath(item) ? getPublicStorageUrl({ bucket: 'song-files', path: getAudioPath(item) }) : null}
                            playlist={currentPlaylist} 
                            streamingLinks={{ youtube: item.video_url || null }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {visibleProductions.length === 0 && (
                  <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-border">
                    <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">No productions available yet</h3>
                    <p className="text-muted-foreground">Our latest public productions will appear here as soon as they are published.</p>
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
