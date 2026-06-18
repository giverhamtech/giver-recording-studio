import React, { useState } from 'react';
import { Download, Play, Pause, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmailCaptureModal from './EmailCaptureModal.jsx';
import pb from '@/lib/firebaseClient.js';
import { toast } from 'sonner';
import { getCategoryImagesMap } from '@/config/beatCategories.js';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
import { generateSlug } from '@/lib/utils.js';
import ShareButton from './ShareButton.jsx';
import WaveformVisualizer from './WaveformVisualizer.jsx';

const BeatCard = ({ beat, playlist = [] }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const playback = usePlayback();

  const handleDownload = (e) => {
    if(e) e.preventDefault();
    setShowEmailModal(true);
  };

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
    } catch (error) {
      toast.error('Failed to process download');
    }
  };

  const audioUrl = beat.mp3_file ? pb.files.getURL(beat, beat.mp3_file) : null;
  const CATEGORY_IMAGES = getCategoryImagesMap();
  const coverImage = beat.categoryImage || CATEGORY_IMAGES[beat.category] || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';

  const isPlaying = playback.currentSong?.url === audioUrl && playback.playbackStatus === 'playing';
  const isCurrent = playback.currentSong?.url === audioUrl;
  
  const currentTime = isCurrent ? playback.playbackPosition : 0;
  const duration = isCurrent && playback.duration > 0 ? playback.duration : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  const handlePlayToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioUrl) {
      toast.error('Audio file not available');
      return;
    }
    
    if (isPlaying) {
      playback.pause();
    } else {
      const songData = {
        id: beat.id,
        title: beat.title,
        artist: 'Giver Recording Studio',
        category: beat.category,
        artwork: coverImage,
        url: audioUrl,
        duration: 0 
      };
      playback.play(songData, playlist);
    }
  };

  const handleSeek = (percentage) => {
    if (isCurrent) {
      playback.seek(percentage * duration);
    }
  };

  // Resolve slug: use DB slug if available, else generate fallback
  const beatSlug = beat.slug || generateSlug(beat.title) || beat.id;
  const beatUrl = `${window.location.origin}/beat/${beatSlug}`;

  return (
    <>
      <Link to={`/beat/${beatSlug}`} className="block group">
        <Card className="bg-card border-border hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 flex flex-row overflow-hidden h-32 md:h-40 rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary/5">
          
          {/* Left: Artwork Container */}
          <div className="relative w-[35%] md:w-40 h-full shrink-0 overflow-hidden bg-muted">
            <img 
              src={coverImage} 
              alt={`${beat.category || 'Beat'} cover`} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'group-hover:scale-105'}`}
            />
            <div className={`absolute inset-0 bg-background/40 transition-opacity duration-300 ${isPlaying ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'} flex items-center justify-center`}>
              <button 
                onClick={handlePlayToggle}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center transform transition-all duration-300 ${isPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'} shadow-[0_0_15px_hsl(var(--primary)/0.4)]`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
              </button>
            </div>
            {beat.category && (
              <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] md:text-xs bg-background/80 backdrop-blur-md text-primary font-medium border-none pointer-events-none">
                {beat.category}
              </Badge>
            )}
          </div>
          
          {/* Right: Content & Controls */}
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
            
            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors" title={beat.title}>
                  {beat.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Giver Recording Studio</p>
              </div>
              <div className="flex shrink-0 items-center gap-1" onClick={e => e.preventDefault()}>
                <ShareButton 
                  title={beat.title} 
                  category={beat.category} 
                  url={beatUrl} 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 text-muted-foreground hover:text-primary hidden sm:flex" 
                />
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-primary/20 hover:bg-primary text-foreground hover:text-primary-foreground transition-colors ml-1"
                  disabled={!audioUrl}
                >
                  <Download className="w-3 h-3 md:mr-1.5" />
                  <span className="hidden md:inline">Download</span>
                </Button>
              </div>
            </div>

            {/* Waveform / Visualizer */}
            <div className="w-full flex items-center mb-1 h-8 md:h-12" onClick={e => e.preventDefault()}>
               <WaveformVisualizer 
                 audioUrl={audioUrl} 
                 progress={progress} 
                 onSeek={handleSeek} 
               />
            </div>
            
          </div>
        </Card>
      </Link>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        beatTitle={beat.title}
      />
    </>
  );
};

export default BeatCard;
