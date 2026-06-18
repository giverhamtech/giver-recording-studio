
import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
import WaveformVisualizer from './WaveformVisualizer.jsx';
import BeatDownloadButton from './BeatDownloadButton.jsx';
import BeatShareButton from './BeatShareButton.jsx';

const formatTime = (time) => {
  if (isNaN(time) || !time) return '0:00';
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const FeaturedBeatCard = ({ beat, playlist = [] }) => {
  const playback = usePlayback();
  
  const isPlaying = playback.currentTrack?.id === beat.id && playback.isPlaying;
  const isCurrentTrack = playback.currentTrack?.id === beat.id;
  const audioUrl = beat.url;

  const handlePlayPause = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!audioUrl) return;

    if (isPlaying) {
      playback.pause();
    } else {
      playback.play(beat, playlist.length > 0 ? playlist : [beat]);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCurrentTrack) playback.next();
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCurrentTrack) playback.previous();
  };

  return (
    <div className="premium-card flex flex-col h-full group overflow-hidden bg-card/80 backdrop-blur-sm hover:bg-card relative">
      {/* Artwork Section */}
      <div className="relative w-full h-[150px] md:h-[180px] bg-muted overflow-hidden shrink-0">
        <img 
          src={beat.artwork || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'} 
          alt={beat.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Tag */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/20">
          {beat.category || 'Uncategorized'}
        </div>

        {/* Central Controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 text-foreground backdrop-blur-sm disabled:opacity-30 hidden sm:flex"
            onClick={handlePrev}
            disabled={!isCurrentTrack}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <Button 
            size="icon"
            onClick={handlePlayPause}
            className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" /> : <Play className="w-6 h-6 md:w-7 md:h-7 ml-1 fill-current" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 text-foreground backdrop-blur-sm disabled:opacity-30 hidden sm:flex"
            onClick={handleNext}
            disabled={!isCurrentTrack}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 z-10 relative">
        <h3 className="font-bold text-lg md:text-xl text-card-foreground truncate mb-1" title={beat.title}>
          {beat.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate mb-4">
          {beat.artist || 'Giver Recording Studio'}
        </p>

        <div className="mb-4">
          <WaveformVisualizer audioUrl={audioUrl} />
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-4">
          <span>{isCurrentTrack ? formatTime(playback.currentTime) : '0:00'}</span>
          <span>{isCurrentTrack && playback.duration ? formatTime(playback.duration) : '--:--'}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center gap-3">
          <BeatDownloadButton beat={beat} variant="secondary" className="flex-1 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-semibold h-10" />
          <BeatShareButton beat={beat} variant="outline" className="border-border hover:bg-secondary h-10 w-10 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default FeaturedBeatCard;
