
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, Disc, Calendar, User, Music, Play, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MetaHead from '@/components/MetaHead.jsx';
import BeatPlayer from '@/components/BeatPlayer.jsx';
import BeatDownloadButton from '@/components/BeatDownloadButton.jsx';
import BeatShareButton from '@/components/BeatShareButton.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const getCategoryId = (song) => song?.category ?? song?.category_id ?? null;
const getAudioPath = (song) => song?.audioFile ?? song?.audio_file ?? song?.mp3_file ?? null;
const getCoverPath = (song) => song?.coverImage ?? song?.cover_image ?? null;
const getCategoryImagePath = (category) =>
  category?.categoryImage ?? category?.category_image ?? category?.category_Image ?? null;
const getIsPublic = (song) => {
  if (typeof song?.privacy !== 'string') return true;
  return song.privacy.toLowerCase() === 'public';
};

const formatDurationLabel = (seconds) => {
  const num = Number(seconds);
  if (!Number.isFinite(num) || num <= 0) return null;
  const min = Math.floor(num / 60);
  const sec = Math.floor(num % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
};

const SongPreviewPage = () => {
  const { slug } = useParams();
  const [song, setSong] = useState(null);
  const [songCategory, setSongCategory] = useState(null);
  const [categoriesById, setCategoriesById] = useState({});
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!slug) return;

        const [{ data: fetchedSong, error }, { data: categories, error: categoriesErr }] = await Promise.all([
          supabase
          .from('songs')
          .select('*'),
          supabase.from('categories').select('*')
        ]);

        if (error) throw error;
        if (categoriesErr) throw categoriesErr;
        const songs = fetchedSong || [];
        const selectedSong = songs.find((s) => s.slug === slug && getIsPublic(s)) || songs.find((s) => String(s.id) === String(slug) && getIsPublic(s));
        if (!selectedSong) throw new Error('Not found');

        const categoriesMap = (categories || []).reduce((acc, c) => {
          acc[c.id] = c;
          return acc;
        }, {});

        setCategoriesById(categoriesMap);
        const selectedCategoryId = getCategoryId(selectedSong);
        setSongCategory(categoriesMap[selectedCategoryId] || null);

        setSong(selectedSong);

        const related = songs
          .filter((s) => getIsPublic(s))
          .filter((s) => getCategoryId(s) === selectedCategoryId)
          .filter((s) => s.id !== selectedSong.id)
          .sort((a, b) => new Date(b?.created_at || b?.created || 0).getTime() - new Date(a?.created_at || a?.created || 0).getTime())
          .slice(0, 4);
        setRelatedSongs(related);
      } catch (err) {
        console.error('Error fetching song:', err);
        setError('Song not found or is not public.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-80 aspect-square rounded-2xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Disc className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Track Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/beats">
            <Button className="bg-primary text-primary-foreground">Browse Store</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = songCategory?.name || 'Uncategorized';
  let coverImage = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
  const songCoverPath = getCoverPath(song);
  if (songCoverPath) {
    coverImage = getPublicStorageUrl({ bucket: 'cover-images', path: songCoverPath }) || coverImage;
  } else {
    const categoryImage = getCategoryImagePath(songCategory);
    if (categoryImage) {
      coverImage = getPublicStorageUrl({ bucket: 'cover-images', path: categoryImage }) || coverImage;
    }
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const durationLabel = formatDurationLabel(song?.duration);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": song.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": "Giver Recording Studio"
    },
    "genre": categoryName,
    "image": coverImage,
    "description": song.description || `${categoryName} track produced by Giver Recording Studio`,
    "url": currentUrl
  };

  if (durationLabel) {
    schemaData.duration = `PT${Math.floor(Number(song.duration) / 60)}M${Math.floor(Number(song.duration) % 60)}S`;
  }

  // Format beat object for BeatPlayer and Buttons compatibility
  const playerBeatFormat = {
    ...song,
    id: song.id,
    title: song.title,
    artist: 'Giver Recording Studio',
    genre: categoryName,
    categoryImage: coverImage,
    audioFile: getAudioPath(song),
    url: getAudioPath(song) ? (getPublicStorageUrl({ bucket: 'song-files', path: getAudioPath(song) }) || null) : null
  };

  return (
    <>
      <MetaHead 
        title={`${song.title} | Giver Recording Studio`}
        description={song.description || `Download ${song.title}, a premium ${categoryName} track by Giver Recording Studio.`}
        image={coverImage}
        url={currentUrl}
        type="music.song"
        schemaData={schemaData}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="bg-card/30 border-b border-border pt-10 pb-16 relative overflow-hidden">
            {/* Subtle background glow from artwork */}
            <div 
              className="absolute inset-0 opacity-[0.03] blur-3xl pointer-events-none"
              style={{ backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Link to="/beats" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
              </Link>

              <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
                
                <div className="w-full md:w-80 shrink-0">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 border border-border relative bg-secondary group">
                    <img 
                      src={coverImage} 
                      alt={song.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-80" />
                  </div>
                </div>

                <div className="flex-1 w-full min-w-0 flex flex-col justify-center py-2">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                      {categoryName}
                    </span>
                    {song.is_featured && (
                      <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                        Spotlight
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight leading-tight" style={{letterSpacing: '-0.02em'}}>
                    {song.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 bg-secondary/30 p-3 rounded-lg border border-border w-fit">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">Giver Recording Studio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(song.created_at || song.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>{song.playCount || 0} plays</span>
                    </div>
                    {durationLabel && (
                      <div className="flex items-center gap-2">
                        <Disc className="w-4 h-4" />
                        <span>{durationLabel}</span>
                      </div>
                    )}
                  </div>

                  {song.description && (
                    <p className="text-foreground/80 text-lg leading-relaxed max-w-prose mb-8 font-light">
                      {song.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-6">
                    <BeatPlayer beat={playerBeatFormat} />

                    <div className="flex flex-wrap items-center gap-3">
                      <BeatDownloadButton 
                        beat={playerBeatFormat} 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base font-semibold shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                      />
                      <BeatShareButton 
                        beat={playerBeatFormat} 
                        className="h-12 w-12 border-border hover:bg-secondary text-foreground shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedSongs.length > 0 && (
            <div className="py-20 bg-background relative z-10">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-10 border-b border-border pb-4">
                  <Music className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">More {categoryName} Tracks</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedSongs.map((related) => {
                    let relCover = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
                    const relatedCategory = categoriesById[getCategoryId(related)];
                    const relatedCategoryImage = getCategoryImagePath(relatedCategory);
                    const relatedCoverPath = getCoverPath(related);
                    if (relatedCoverPath) {
                      relCover = getPublicStorageUrl({ bucket: 'cover-images', path: relatedCoverPath }) || relCover;
                    } else if (relatedCategoryImage) {
                      relCover = getPublicStorageUrl({ bucket: 'cover-images', path: relatedCategoryImage }) || relCover;
                    }

                    return (
                      <Link
                        key={related.id}
                        to={`/beat/${related.slug}`}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors block shadow-sm hover:shadow-md"
                      >
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          <img
                            src={relCover}
                            alt={related.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                              <Play className="w-5 h-5 ml-1 fill-current" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-card-foreground truncate group-hover:text-primary transition-colors">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {relatedCategory?.name || 'Uncategorized'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SongPreviewPage;
