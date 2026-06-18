
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Download, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
import MinimizedPlayer from './MinimizedPlayer.jsx';
import BeatShareButton from './BeatShareButton.jsx';

const formatTime = (time) => {
  if (isNaN(time) || time === Infinity || !time) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const StickyMiniPlayer = () => {
  const playback = usePlayback();
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    shuffle,
    isPlayerVisible,
    isMinimized,
    pause,
    resume,
    next,
    previous,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    toggleMinimize,
    closePlayer,
    seek
  } = playback;

  if (!isPlayerVisible) return null;

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isDownSwipe) toggleMinimize();
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  const togglePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const handleVolumeToggle = () => {
    if (isMuted || volume === 0) {
      setVolume(prevVolume > 0 ? prevVolume : 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  return (
    <AnimatePresence mode="wait">
      {isMinimized ? (
        <MinimizedPlayer key="minimized" />
      ) : (
        <motion.div
          key="full-player"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.6)] touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Mobile Swipe Indicator */}
          <div className="w-full flex justify-center pt-2 pb-1 md:hidden">
            <div className="w-12 h-1 bg-muted rounded-full"></div>
          </div>

          {/* Progress Bar (Desktop & Mobile combined logic) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30 hidden md:block group cursor-pointer">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
            />
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear pointer-events-none group-hover:h-2"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="w-full px-4 pt-1 md:hidden relative group h-2">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="absolute inset-x-4 top-0 h-full opacity-0 z-20 cursor-pointer"
            />
            <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
               <div 
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[90px] md:h-[100px] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mt-2 md:mt-0 pb-3 md:pb-0 relative">
            
            {/* Header controls mobile */}
            <div className="absolute top-[-25px] right-2 flex items-center gap-1 md:hidden">
                <Button variant="ghost" size="icon" onClick={closePlayer} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Track Info */}
            <div className="flex items-center gap-4 w-full md:w-[30%] min-w-0">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shrink-0 shadow-md">
                <img 
                  src={currentTrack?.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&q=80'} 
                  alt={currentTrack?.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-110' : 'scale-100'}`}
                />
              </div>
              <div className="min-w-0 flex-1 pr-12 md:pr-0">
                <h4 className="text-base md:text-lg font-bold text-foreground truncate">{currentTrack?.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{currentTrack?.artist || 'Giver Recording Studio'}</p>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex flex-col items-center w-full md:w-[40%] max-w-md">
              <div className="flex items-center gap-4 md:gap-6">
                <Button variant="ghost" size="icon" onClick={toggleShuffle} className={`h-8 w-8 hidden sm:flex transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Shuffle className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={previous} className="h-8 w-8 md:h-10 md:w-10 text-foreground hover:text-primary transition-colors">
                  <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                </Button>

                <Button
                  size="icon"
                  onClick={togglePlayPause}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:scale-105 transition-all shrink-0"
                >
                  {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" /> : <Play className="w-6 h-6 md:w-7 md:h-7 ml-1 fill-current" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 md:h-10 md:w-10 text-foreground hover:text-primary transition-colors">
                  <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleRepeat} className={`h-8 w-8 hidden sm:flex transition-colors ${repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="hidden md:flex w-full items-center justify-between text-xs text-muted-foreground mt-2 px-8">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="hidden md:flex items-center justify-end gap-3 w-[30%] shrink-0">
              <div className="flex items-center gap-2 mr-2">
                <Button variant="ghost" size="icon" onClick={handleVolumeToggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  {volume === 0 || isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(parseFloat(e.target.value));
                  }}
                  className="w-20 lg:w-24 h-1.5 bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
              </div>
              
              {currentTrack && <BeatShareButton beat={currentTrack} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}
              
              <div className="flex items-center gap-1 border-l border-border pl-2">
                <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Minimize">
                  <ChevronDown className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={closePlayer} className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" title="Close">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMiniPlayer;
