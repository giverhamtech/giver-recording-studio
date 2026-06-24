
import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
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

  const currentDuration = isCurrentTrack && playback.duration ? playback.duration : beat?.duration;

  return (
    <div className="premium-card glass-panel flex flex-col h-full group overflow-hidden bg-card/75 relative">
      <div className="relative w-full aspect-square bg-muted overflow-hidden shrink-0">
        <img 
          src={beat.artwork || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'} 
          alt={beat.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent"></div>
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute top-3 left-3 px-2.5 py-1 bg-background/80 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-[0.14em] rounded-lg border border-primary/20">
          {beat.category || 'Uncategorized'}
        </div>

        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/65 border border-white/10 text-[11px] text-foreground/80 font-semibold tabular-nums">
          {currentDuration ? formatTime(currentDuration) : '--:--'}
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full bg-background/55 hover:bg-background/80 text-foreground backdrop-blur-sm disabled:opacity-30 hidden md:flex"
            onClick={handlePrev}
            disabled={!isCurrentTrack}
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </Button>

          <Button 
            size="icon"
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)] hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full bg-background/55 hover:bg-background/80 text-foreground backdrop-blur-sm disabled:opacity-30 hidden md:flex"
            onClick={handleNext}
            disabled={!isCurrentTrack}
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/75 to-accent/85 transition-all duration-200"
            style={{ width: `${isCurrentTrack && playback.duration ? (playback.currentTime / playback.duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="p-3.5 md:p-4 flex flex-col flex-1 z-10 relative">
        <h3 className="font-bold text-sm md:text-base text-card-foreground truncate mb-1" title={beat.title}>
          {beat.title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground truncate mb-3">
          {beat.artist || 'Giver Recording Studio'}
        </p>

        <div className="flex items-end gap-[2px] h-8 mb-3 rounded-md bg-secondary/45 px-2 py-1.5">
          {Array.from({ length: 20 }).map((_, index) => {
            const active = isCurrentTrack && playback.isPlaying && index < Math.ceil((playback.currentTime / (playback.duration || 1)) * 20);
            return (
              <span
                key={`eq-${beat.id}-${index}`}
                className={`equalizer-bar flex-1 rounded-sm ${active ? 'bg-primary/95' : 'bg-muted-foreground/40'}`}
                style={{ height: `${22 + ((index * 7) % 18)}px`, animationDelay: `${(index % 4) * 0.1}s` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-3">
          <span>{isCurrentTrack ? formatTime(playback.currentTime) : '0:00'}</span>
          <span>{currentDuration ? formatTime(currentDuration) : '--:--'}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-border/70 flex items-center gap-2">
          <BeatDownloadButton beat={beat} variant="secondary" className="flex-1 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-semibold h-9 text-xs md:text-sm" />
          <BeatShareButton beat={beat} variant="outline" className="border-border hover:bg-secondary h-9 w-9 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default FeaturedBeatCard;
