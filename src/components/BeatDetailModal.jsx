
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import pb from '@/lib/firebaseClient.js';
import BeatPlayer from './BeatPlayer.jsx';
import BeatDownloadButton from './BeatDownloadButton.jsx';
import BeatShareButton from './BeatShareButton.jsx';

const BeatDetailModal = ({ beat, isOpen, onClose, allBeats = [] }) => {
  const [relatedBeats, setRelatedBeats] = useState([]);

  useEffect(() => {
    if (beat && allBeats.length > 0) {
      // Find up to 3 related beats from the same genre
      const related = allBeats.filter(b => b.genre === beat.genre && b.id !== beat.id).slice(0, 3);
      setRelatedBeats(related);
    }
  }, [beat, allBeats]);

  if (!beat) return null;

  const coverUrl = beat.coverImage ? pb.files.getURL(beat, beat.coverImage) : beat.categoryImage || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 bg-card border-border overflow-hidden gap-0 rounded-2xl shadow-2xl shadow-primary/10">
        <DialogTitle className="sr-only">{beat.title} Details</DialogTitle>
        <DialogDescription className="sr-only">Detailed view of {beat.title}</DialogDescription>
        
        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto custom-scrollbar">
          {/* Left Column: Artwork */}
          <div className="w-full md:w-2/5 shrink-0 bg-secondary/50 relative">
            <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
              <img 
                src={coverUrl} 
                alt={beat.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent md:bg-gradient-to-r md:from-transparent md:to-background"></div>
            </div>
            {beat.genre && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground pointer-events-none">
                {beat.genre}
              </Badge>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight line-clamp-2">
                {beat.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{beat.artist || 'Giver Recording Studio'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(beat.created).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <BeatPlayer beat={beat} playlist={allBeats.map(b => ({
                id: b.id,
                title: b.title,
                artist: b.artist || 'Giver Recording Studio',
                category: b.genre,
                artwork: b.coverImage ? pb.files.getURL(b, b.coverImage) : b.categoryImage,
                url: b.audioFile ? pb.files.getURL(b, b.audioFile) : null
              }))} />
            </div>

            <div className="flex items-center gap-3 mt-auto">
              <BeatDownloadButton beat={beat} className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold" />
              <BeatShareButton beat={beat} className="h-12 w-12 border-border hover:bg-secondary text-foreground" />
            </div>

            {/* Related Beats (Optional minimal view) */}
            {relatedBeats.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Similar Beats</h4>
                <div className="space-y-3">
                  {relatedBeats.map(rb => (
                    <div key={rb.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <img 
                        src={rb.coverImage ? pb.files.getURL(rb, rb.coverImage) : rb.categoryImage || coverUrl} 
                        alt={rb.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{rb.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{rb.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeatDetailModal;
