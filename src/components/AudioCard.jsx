
import React from 'react';
import { Play, Pause, Download, Music, Disc, Youtube, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '@/hooks/useAudioPlayer.js';
import { getCategoryImagesMap } from '@/config/beatCategories.js';

const formatTime = (time) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const AudioCard = ({ 
  title, 
  artist, 
  genre, 
  coverUrl, 
  audioUrl, 
  onDownload, 
  streamingLinks = {},
  description
}) => {
  const {
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek
  } = useAudioPlayer(audioUrl);

  const handleSeek = (e) => {
    seek(Number(e.target.value));
  };

  const defaultCover = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80';
  const CATEGORY_IMAGES = getCategoryImagesMap();
  const finalCoverUrl = coverUrl || CATEGORY_IMAGES[genre] || defaultCover;

  return (
    <Card className="bg-card border-border overflow-hidden flex flex-col h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img 
          src={finalCoverUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {genre && (
          <Badge variant="secondary" className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-primary border-primary/20">
            {genre}
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
          </button>
        </div>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-card-foreground truncate" title={title}>{title}</h3>
          <p className="text-primary font-medium truncate" title={artist}>{artist}</p>
          {description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description}</p>}
        </div>

        <div className="mt-auto space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="audio-scrubber"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              {streamingLinks.spotify && (
                <a href={streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Disc className="w-5 h-5" />
                </a>
              )}
              {streamingLinks.appleMusic && (
                <a href={streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Music className="w-5 h-5" />
                </a>
              )}
              {streamingLinks.soundCloud && (
                <a href={streamingLinks.soundCloud} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <PlayCircle className="w-5 h-5" />
                </a>
              )}
              {streamingLinks.youtube && (
                <a href={streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {onDownload && (
              <Button size="sm" variant="secondary" onClick={onDownload} className="hover:bg-primary hover:text-primary-foreground transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioCard;
