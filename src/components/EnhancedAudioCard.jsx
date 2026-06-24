import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedAudioPlayer from './EnhancedAudioPlayer.jsx';
import ShareButton from './ShareButton.jsx';
import { getCategoryImagesMap } from '@/config/beatCategories.js';

const EnhancedAudioCard = ({ 
  title, 
  artist, 
  genre, 
  coverUrl, 
  audioUrl, 
  onDownload, 
  streamingLinks = {},
  description,
  extraInfo,
  playlist = []
}) => {
  const defaultCover = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80';
  const CATEGORY_IMAGES = getCategoryImagesMap();
  const finalCoverUrl = coverUrl || CATEGORY_IMAGES[genre] || defaultCover;

  const songData = {
    title,
    artist,
    category: genre,
    artwork: finalCoverUrl,
    url: audioUrl,
    duration: 0 
  };

  return (
    <Card className="premium-card glass-panel overflow-hidden flex flex-col h-full group">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img 
          src={finalCoverUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90"></div>
        
        {genre && (
          <Badge variant="secondary" className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-primary border-primary/20 font-semibold tracking-wide">
            {genre}
          </Badge>
        )}
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-foreground truncate drop-shadow-md group-hover:text-primary transition-colors" title={title}>{title}</h3>
          <p className="text-muted-foreground font-medium truncate drop-shadow-md" title={artist}>{artist}</p>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col bg-card/30">
        {description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2 px-2">{description}</p>}
        {extraInfo && <div className="mb-4 px-2">{extraInfo}</div>}

        <div className="mb-3 flex items-center justify-end">
          <ShareButton
            title={title}
            category={genre || 'Production'}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            text={`Check out \"${title}\" by ${artist || 'Giver Recording Studio'} on Giver Recording Studio.`}
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          />
        </div>

        <div className="mt-auto">
          <EnhancedAudioPlayer 
            song={songData}
            playlist={playlist}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAudioCard;
