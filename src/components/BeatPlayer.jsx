
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
import { Button } from '@/components/ui/button';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const BeatPlayer = ({ beat }) => {
  const { 
    currentSong, 
    playbackStatus, 
    playbackPosition, 
    duration, 
    play, 
    pause, 
    seek, 
    volume, 
    changeVolume, 
    isMuted, 
    toggleMute 
  } = usePlayback();

  const isCurrentBeat = currentSong?.id === beat?.id;
  const isPlaying = isCurrentBeat && playbackStatus === 'playing';
  const currentPos = isCurrentBeat ? playbackPosition : 0;
  const currentDur = isCurrentBeat ? duration : 0;

  const handlePlayToggle = () => {
    if (!beat?.audioFile && !beat?.url) return;
    
    if (isPlaying) {
      pause();
    } else {
      // Map properties properly if playing directly from component
      const songData = {
        id: beat.id,
        title: beat.title,
        artist: beat.artist || 'Giver Recording Studio',
        category: beat.category || beat.genre,
        artwork: beat.categoryImage || beat.artwork,
        url: beat.url || (beat.audioFile ? pb.files.getURL(beat, beat.audioFile) : null)
      };
      play(songData, [songData]); // Single song playlist for this view
    }
  };

  const handleSeek = (e) => {
    if (isCurrentBeat && currentDur > 0) {
      seek(parseFloat(e.target.value));
    }
  };

  const handleVolume = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm w-full">
      <div className="flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-medium text-muted-foreground w-10 text-right">
            {formatTime(currentPos)}
          </span>
          <div className="relative flex-1 h-12 flex items-center group cursor-pointer">
            <input 
              type="range" 
              min="0" 
              max={currentDur || 100} 
              value={currentPos} 
              onChange={handleSeek}
              disabled={!isCurrentBeat}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer disabled:cursor-not-allowed"
            />
            {/* Visual Track */}
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden relative z-10 pointer-events-none">
              <div 
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${currentDur > 0 ? (currentPos / currentDur) * 100 : 0}%` }}
              />
            </div>
            {/* Scrubber Knob */}
            {isCurrentBeat && (
              <div 
                className="absolute h-4 w-4 bg-primary rounded-full shadow-md z-10 pointer-events-none transition-all scale-0 group-hover:scale-100"
                style={{ left: `calc(${currentDur > 0 ? (currentPos / currentDur) * 100 : 0}% - 8px)` }}
              />
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground w-10">
            {formatTime(currentDur)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-0 md:opacity-100 w-1/3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={handleVolume}
              className="w-20 h-1.5 bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-center gap-4 w-1/3">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary hover:bg-secondary disabled:opacity-30" disabled={!isCurrentBeat}>
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:scale-105 transition-transform"
              onClick={handlePlayToggle}
              disabled={!beat?.audioFile && !beat?.url}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary hover:bg-secondary disabled:opacity-30" disabled={!isCurrentBeat}>
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default BeatPlayer;
