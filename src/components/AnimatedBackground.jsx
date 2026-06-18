
import React from 'react';
import { Music, Disc } from 'lucide-react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Neon Teal Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      {/* Floating Music Notes */}
      <div className="absolute top-20 left-10 text-primary/20 animate-float" style={{ animationDelay: '0s' }}>
        <Music size={48} />
      </div>
      <div className="absolute top-40 right-20 text-accent/20 animate-float" style={{ animationDelay: '2s' }}>
        <Music size={32} />
      </div>
      <div className="absolute bottom-40 left-1/3 text-primary/20 animate-float" style={{ animationDelay: '4s' }}>
        <Music size={64} />
      </div>

      {/* Rotating Vinyl Records */}
      <div className="absolute -top-20 -right-20 text-foreground/5 animate-spin-slow">
        <Disc size={200} />
      </div>
      <div className="absolute -bottom-32 -left-32 text-foreground/5 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
        <Disc size={300} />
      </div>

      {/* Equalizer Bars */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-2 h-32 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-4 bg-primary animate-equalizer rounded-t-sm"
            style={{ 
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
