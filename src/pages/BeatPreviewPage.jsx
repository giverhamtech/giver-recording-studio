import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, Disc, Calendar, User, Music } from 'lucide-react';
import pb from '@/lib/firebaseClient.js';
import { getCategoryImagesMap } from '@/config/beatCategories.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer.jsx';
import BeatCard from '@/components/BeatCard.jsx';
import MetaHead from '@/components/MetaHead.jsx';
import ShareButton from '@/components/ShareButton.jsx';
import EmailCaptureModal from '@/components/EmailCaptureModal.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const BeatPreviewPage = () => {
  const { slug } = useParams();
  const [beat, setBeat] = useState(null);
  const [relatedBeats, setRelatedBeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const fetchBeatData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Attempt to fetch by slug first, fallback to id if old beat
        let fetchedBeat;
        try {
          fetchedBeat = await pb.collection('beats').getFirstListItem(`slug="${slug}"`, { $autoCancel: false });
        } catch (e) {
          // If slug fails, try by ID
          fetchedBeat = await pb.collection('beats').getOne(slug, { $autoCancel: false });
        }

        setBeat(fetchedBeat);

        // Fetch related beats
        const related = await pb.collection('beats').getList(1, 4, {
          filter: `category="${fetchedBeat.category}" && id!="${fetchedBeat.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setRelatedBeats(related.items);

      } catch (err) {
        console.error('Error fetching beat:', err);
        setError('Beat not found or has been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchBeatData();
  }, [slug]);

  const handleDownload = () => setShowEmailModal(true);

  const handleEmailSubmit = async (email) => {
    try {
      await pb.collection('email_leads').create({
        email,
        beat_downloaded: beat.title
      }, { $autoCancel: false });

      const downloadUrl = pb.files.getURL(beat, beat.mp3_file);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${beat.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
      setShowEmailModal(false);
    } catch (err) {
      toast.error('Failed to process download');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-1/3 aspect-square rounded-2xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full mt-8" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !beat) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Disc className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Beat Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/beats">
            <Button className="bg-primary text-primary-foreground">Browse Store</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const CATEGORY_IMAGES = getCategoryImagesMap();
  const coverImage = beat.categoryImage || CATEGORY_IMAGES[beat.category] || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
  const audioUrl = beat.mp3_file ? pb.files.getURL(beat, beat.mp3_file) : null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": beat.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": "Giver Recording Studio"
    },
    "genre": beat.category,
    "image": coverImage,
    "description": beat.description || `${beat.category} beat produced by Giver Recording Studio`,
    "url": currentUrl
  };

  return (
    <>
      <MetaHead 
        title={beat.title}
        description={`Download ${beat.title}, a premium ${beat.category} beat produced by Giver Recording Studio. ${beat.description || ''}`}
        image={coverImage}
        url={currentUrl}
        type="music.song"
        schemaData={schemaData}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        {/* Hero Preview Section */}
        <main className="flex-1">
          <div className="bg-secondary/30 border-b border-border/50 pt-10 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link to="/beats" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
              </Link>

              <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
                
                {/* Artwork */}
                <div className="w-full md:w-72 lg:w-96 shrink-0">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 relative bg-muted group">
                    <img 
                      src={coverImage} 
                      alt={beat.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  </div>
                </div>

                {/* Details & Player */}
                <div className="flex-1 w-full min-w-0 flex flex-col justify-center py-4">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded-full border border-primary/20">
                      {beat.category}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight leading-tight" style={{letterSpacing: '-0.02em'}}>
                    {beat.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-foreground">Giver Recording Studio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(beat.created).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {beat.description && (
                    <p className="text-muted-foreground/90 text-lg leading-relaxed max-w-prose mb-8">
                      {beat.description}
                    </p>
                  )}

                  {/* Player Component */}
                  {audioUrl ? (
                    <div className="mt-auto pt-6 border-t border-border/50">
                      <EnhancedAudioPlayer 
                        song={{
                          id: beat.id,
                          title: beat.title,
                          artist: 'Giver Recording Studio',
                          category: beat.category,
                          artwork: coverImage,
                          url: audioUrl,
                          duration: 0
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg mt-8 inline-block border border-destructive/20">
                      Preview audio file unavailable.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 mt-8">
                    <Button 
                      size="lg" 
                      onClick={handleDownload}
                      disabled={!audioUrl}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.25)] h-12 px-8 text-base font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Free MP3
                    </Button>
                    
                    <ShareButton 
                      title={beat.title} 
                      category={beat.category} 
                      url={currentUrl} 
                      variant="outline"
                      size="default"
                      className="h-12 px-6 border-border hover:bg-secondary text-foreground"
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Related Beats */}
          {relatedBeats.length > 0 && (
            <div className="py-20 bg-background">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-10 border-b border-border/50 pb-4">
                  <Music className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">More {beat.category} Beats</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBeats.map(related => (
                    <BeatCard 
                      key={related.id} 
                      beat={related} 
                      playlist={relatedBeats.map(b => ({
                        id: b.id,
                        title: b.title,
                        artist: 'Giver Recording Studio',
                        category: b.category,
                        artwork: b.categoryImage || CATEGORY_IMAGES[b.category] || CATEGORY_IMAGES['Instrumentals'],
                        url: pb.files.getURL(b, b.mp3_file)
                      }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
        <EmailCaptureModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSubmit}
          beatTitle={beat.title}
        />
      </div>
    </>
  );
};

export default BeatPreviewPage;
