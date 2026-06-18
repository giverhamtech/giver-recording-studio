
import React from 'react';
import { Play, Pause, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';
import { motion } from 'framer-motion';

const MinimizedPlayer = () => {
  const playback = usePlayback();
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    pause,
    resume,
    toggleMinimize
  } = playback;

  if (!currentTrack) return null;

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.4)] cursor-pointer touch-none"
      onClick={toggleMinimize}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted/30">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded overflow-hidden shrink-0 shadow-sm border border-border/50">
            <img 
              src={currentTrack.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&q=80'} 
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
          </div>
          <div className="min-w-0 pr-2">
            <h4 className="text-sm md:text-base font-bold text-foreground truncate">{currentTrack.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist || 'Giver Recording Studio'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleTogglePlay}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full text-foreground hover:bg-primary/20 hover:text-primary transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1 fill-current" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }} 
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MinimizedPlayer;
