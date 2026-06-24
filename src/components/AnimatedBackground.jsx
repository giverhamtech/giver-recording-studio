
import React from 'react';
import { Music, Disc } from 'lucide-react';

const AnimatedBackground = () => {
  const particleLayout = [
    { left: '8%', top: '14%', size: 8, delay: '0s' },
    { left: '18%', top: '28%', size: 5, delay: '0.8s' },
    { left: '34%', top: '12%', size: 6, delay: '1.6s' },
    { left: '45%', top: '34%', size: 4, delay: '2.3s' },
    { left: '58%', top: '18%', size: 9, delay: '1.1s' },
    { left: '69%', top: '37%', size: 5, delay: '0.4s' },
    { left: '80%', top: '22%', size: 7, delay: '2.8s' },
    { left: '88%', top: '31%', size: 4, delay: '1.9s' }
  ];

  const equalizerHeights = [20, 46, 38, 52, 34, 58, 30, 50, 44, 28, 56, 36, 48, 32, 54, 40];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-20 left-[8%] h-72 w-72 rounded-full bg-primary/20 blur-[120px] floating-particle" />
      <div className="absolute top-[28%] -right-20 h-80 w-80 rounded-full bg-accent/20 blur-[120px] floating-particle" style={{ animationDelay: '1.6s' }} />
      <div className="absolute bottom-[-60px] left-[30%] h-64 w-64 rounded-full bg-primary/20 blur-[120px] floating-particle" style={{ animationDelay: '0.7s' }} />

      <div className="absolute top-20 left-10 text-primary/25 floating-particle" style={{ animationDelay: '0s' }}>
        <Music size={48} />
      </div>
      <div className="absolute top-40 right-20 text-accent/25 floating-particle" style={{ animationDelay: '2s' }}>
        <Music size={32} />
      </div>
      <div className="absolute bottom-40 left-1/3 text-primary/25 floating-particle" style={{ animationDelay: '4s' }}>
        <Music size={64} />
      </div>

      <div className="absolute -top-20 -right-20 text-foreground/5 animate-spin-slow">
        <Disc size={200} />
      </div>
      <div className="absolute -bottom-32 -left-32 text-foreground/5 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
        <Disc size={300} />
      </div>

      {particleLayout.map((particle, index) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-primary/40 floating-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: particle.delay,
            filter: 'blur(0.2px)'
          }}
        />
      ))}

      <div className="absolute bottom-16 left-1/2 h-8 w-[360px] max-w-[86vw] -translate-x-1/2 overflow-hidden opacity-40">
        <div className="wave-line flex min-w-[760px] items-center gap-3">
          {Array.from({ length: 48 }).map((_, index) => (
            <span
              key={`wave-${index}`}
              className="h-[2px] w-6 rounded-full bg-gradient-to-r from-primary/40 via-accent/70 to-primary/40"
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-[6px] h-24 opacity-35">
        {equalizerHeights.map((height, i) => (
          <div 
            key={i} 
            className="equalizer-bar w-[5px] rounded-t-sm bg-gradient-to-b from-accent via-primary to-primary/30"
            style={{ 
              height: `${height}px`,
              animationDelay: `${(i % 5) * 0.18}s`,
              animationDuration: `${1.1 + (i % 4) * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
