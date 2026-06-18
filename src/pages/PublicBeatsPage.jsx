
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Music, Disc3, SlidersHorizontal, Play, Pause, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import pb from '@/lib/firebaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BeatDownloadButton from '@/components/BeatDownloadButton.jsx';
import BeatShareButton from '@/components/BeatShareButton.jsx';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';

const PAGE_SIZE = 50;

const PublicBeatsPage = () => {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Tracks' }]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  
  const playback = usePlayback();

  // Unified database query for public visibility
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Strict filter: MUST be 'public' to appear on published website.
        let filterStr = "privacy='public'";
        if (selectedCategory !== 'all') {
          filterStr += ` && category='${selectedCategory}'`;
        }

        const [songsRes, catRes] = await Promise.all([
          pb.collection('songs').getList(1, PAGE_SIZE, {
            filter: filterStr,
            sort: '-created',
            expand: 'category',
            $autoCancel: false // Disable auto-cancel to ensure reliable fetch
          }),
          pb.collection('categories').getFullList({
            sort: 'displayOrder',
            $autoCancel: false
          })
        ]);

        setSongs(songsRes.items);
        setHasMore(songsRes.page < songsRes.totalPages);
        setCategories([{ id: 'all', name: 'All Tracks' }, ...catRes]);
        setPage(1);

      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError('Failed to load database catalog. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedCategory]);

  const loadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    
    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      
      let filterStr = "privacy='public'";
      if (selectedCategory !== 'all') {
        filterStr += ` && category='${selectedCategory}'`;
      }

      const res = await pb.collection('songs').getList(nextPage, PAGE_SIZE, {
        filter: filterStr,
        sort: '-created',
        expand: 'category',
        $autoCancel: false
      });

      setSongs(prev => [...prev, ...res.items]);
      setHasMore(res.page < res.totalPages);
      setPage(nextPage);
    } catch (err) {
      console.error('Error fetching more records:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return songs;
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  const handlePlayToggle = useCallback((e, song) => {
    e.preventDefault();
    e.stopPropagation();
    
    const audioUrl = song.audioFile ? pb.files.getURL(song, song.audioFile) : null;
    if (!audioUrl) return;

    const isPlaying = playback.currentSong?.id === song.id && playback.playbackStatus === 'playing';

    if (isPlaying) {
      playback.pause();
    } else {
      // Build playlist context
      const playlist = filteredSongs.filter(s => s.audioFile).map(s => {
        let cov = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
        if (s.coverImage) cov = pb.files.getURL(s, s.coverImage);
        else if (s.expand?.category?.categoryImage) cov = pb.files.getURL(s.expand.category, s.expand.category.categoryImage);
        
        return {
          id: s.id,
          title: s.title,
          artist: 'Giver Recording Studio',
          category: s.expand?.category?.name,
          artwork: cov,
          url: pb.files.getURL(s, s.audioFile)
        };
      });

      let coverUrl = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
      if (song.coverImage) coverUrl = pb.files.getURL(song, song.coverImage);
      else if (song.expand?.category?.categoryImage) coverUrl = pb.files.getURL(song.expand.category, song.expand.category.categoryImage);

      playback.play({
        id: song.id,
        title: song.title,
        artist: 'Giver Recording Studio',
        category: song.expand?.category?.name,
        artwork: coverUrl,
        url: audioUrl,
        duration: 0
      }, playlist);
    }
  }, [filteredSongs, playback]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 bg-noise z-0"></div>
      <Header className="relative z-10" />

      <section className="relative z-10 pt-32 pb-16 md:pt-40 md:pb-24 border-b border-border overflow-hidden bg-card/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Discover <span className="text-primary">Premium Audio</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
            >
              Browse our exclusive collection of high-quality instrumentals and productions. Directly loaded from our verified database.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-2xl mx-auto flex items-center bg-input/50 backdrop-blur-sm border border-border rounded-full p-1.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-lg"
            >
              <div className="pl-4 pr-2 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search catalog by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground py-3 text-base h-auto rounded-full w-full min-w-0"
              />
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 shrink-0 h-10">
                Search
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-1 relative z-10 py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-8 custom-scrollbar scroll-smooth">
            <div className="flex items-center gap-2 pr-4 border-r border-border shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Filters</span>
            </div>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                    : 'bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-secondary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {error ? (
             <div className="text-center py-20 bg-destructive/5 border border-destructive/20 rounded-2xl">
               <p className="text-destructive font-medium mb-4">{error}</p>
               <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
             </div>
          ) : (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <Skeleton className="w-full aspect-square rounded-2xl" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="text-center py-32 bg-card/30 border border-dashed border-border rounded-3xl">
                  <Disc3 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Tracks Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any content matching your current filters. Ensure beats are uploaded and marked 'public' in the dashboard.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-border hover:bg-secondary text-foreground"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSongs.map((song) => {
                      let coverUrl = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
                      if (song.coverImage) coverUrl = pb.files.getURL(song, song.coverImage);
                      else if (song.expand?.category?.categoryImage) coverUrl = pb.files.getURL(song.expand.category, song.expand.category.categoryImage);
                      
                      const audioUrl = song.audioFile ? pb.files.getURL(song, song.audioFile) : null;
                      const isPlaying = playback.currentSong?.id === song.id && playback.playbackStatus === 'playing';
                      const catName = song.expand?.category?.name || 'Uncategorized';

                      const beatFormat = {
                        ...song,
                        genre: catName,
                        artist: 'Giver Recording Studio',
                        categoryImage: coverUrl
                      };

                      return (
                        <motion.div
                          key={song.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative"
                        >
                          <Link to={`/beat/${song.slug}`} className="absolute inset-0 z-0" aria-label={`View ${song.title}`}></Link>
                          
                          <div className="relative aspect-square overflow-hidden bg-muted shrink-0 pointer-events-none">
                            <img 
                              src={coverUrl} 
                              alt={song.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            <div className={`absolute inset-0 bg-background/50 flex items-center justify-center transition-all duration-300 pointer-events-auto ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <Button 
                                size="icon"
                                onClick={(e) => handlePlayToggle(e, song)}
                                disabled={!audioUrl}
                                className={`w-14 h-14 rounded-full bg-primary text-primary-foreground transition-transform duration-300 disabled:opacity-50 shadow-[0_0_20px_hsl(var(--primary)/0.5)] relative z-10 ${isPlaying ? 'scale-100' : 'scale-75 group-hover:scale-100'}`}
                              >
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
                              </Button>
                            </div>

                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-wider rounded border border-primary/20 pointer-events-none">
                              {catName}
                            </div>
                          </div>
                          
                          <div className="p-5 flex flex-col flex-1 pointer-events-none">
                            <div className="flex-1 min-w-0 mb-4">
                              <h3 className="font-bold text-lg text-card-foreground truncate group-hover:text-primary transition-colors">
                                {song.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Music className="w-3.5 h-3.5" /> Giver Recording Studio
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto pointer-events-auto relative z-10">
                              <div className="flex items-center gap-2 w-full">
                                <BeatDownloadButton beat={beatFormat} variant="secondary" size="sm" className="h-9 flex-1 text-xs bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors" />
                                <BeatShareButton beat={beatFormat} variant="outline" size="icon" className="h-9 w-9 border-border text-foreground hover:bg-secondary shrink-0" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {hasMore && !searchQuery && (
                    <div className="text-center mt-12">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={loadMore} 
                        disabled={isFetchingMore}
                        className="px-8 border-border hover:bg-secondary text-foreground"
                      >
                        {isFetchingMore ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                        ) : 'Load More Tracks'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer className="relative z-10" />
    </div>
  );
};

export default PublicBeatsPage;
