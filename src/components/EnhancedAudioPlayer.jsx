import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Repeat1, Shuffle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
import WaveformVisualizer from './WaveformVisualizer.jsx';

const formatTime = (time) => {
  if (isNaN(time) || time === Infinity) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const EnhancedAudioPlayer = ({ song, playlist = [], onDownload }) => {
  const playback = usePlayback();
  const isPlaying = playback.currentSong?.url === song.url && playback.playbackStatus === 'playing';
  const isCurrent = playback.currentSong?.url === song.url;
  
  const currentTime = isCurrent ? playback.playbackPosition : 0;
  const duration = isCurrent && playback.duration > 0 ? playback.duration : (song.duration || 0);
  const progress = duration > 0 ? currentTime / duration : 0;

  const handleToggle = () => {
    if (isPlaying) {
      playback.pause();
    } else {
      playback.play(song, playlist);
    }
  };

  const handleSeek = (percentage) => {
    if (isCurrent) {
      playback.seek(percentage * duration);
    }
  };

  const toggleRepeat = () => {
    const modes = ['off', 'repeat-all', 'repeat-one'];
    const nextMode = modes[(modes.indexOf(playback.repeatMode) + 1) % modes.length];
    playback.setRepeatMode(nextMode);
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border/50 p-2 md:p-4 transition-all flex flex-col justify-center">
      
      {/* Mobile Layout (Compact) */}
      <div className="flex items-center gap-3 md:hidden">
        <Button
          size="icon"
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 shadow-md shadow-primary/20"
          onClick={handleToggle}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </Button>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <WaveformVisualizer 
            audioUrl={song.url} 
            progress={progress} 
            onSeek={handleSeek} 
          />
        </div>
      </div>

      {/* Desktop Layout (Full Size) */}
      <div className="hidden md:flex flex-row items-center gap-4 w-full">
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => playback.previous()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)] shrink-0"
            onClick={handleToggle}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => playback.next()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <WaveformVisualizer 
            audioUrl={song.url} 
            progress={progress} 
            onSeek={handleSeek} 
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
          <div className="flex items-center text-xs font-medium text-muted-foreground tabular-nums w-20 justify-center">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => playback.setShuffleMode(!playback.shuffleMode)}
            className={`h-9 w-9 transition-colors ${playback.shuffleMode ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={`h-9 w-9 transition-colors ${playback.repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Repeat"
          >
            {playback.repeatMode === 'repeat-one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </Button>

          {onDownload && (
            <Button
              variant="outline"
              size="icon"
              onClick={onDownload}
              className="h-9 w-9 border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all ml-2"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAudioPlayer;
