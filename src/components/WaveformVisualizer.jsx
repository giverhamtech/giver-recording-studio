
import React, { useState, useEffect } from 'react';
import { usePlayback } from '@/contexts/PlaybackContext.jsx';

const WaveformVisualizer = ({ audioUrl }) => {
  const { currentTrack, isPlaying, currentTime } = usePlayback();
  const [animationTime, setAnimationTime] = useState(0);

  const isActiveTrack = currentTrack?.url === audioUrl;
  const isCurrentlyPlaying = isActiveTrack && isPlaying;

  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;
      
      setAnimationTime(prev => prev + delta * 0.005);
      animationFrame = requestAnimationFrame(animate);
    };

    if (isCurrentlyPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isCurrentlyPlaying]);

  // Generate 12 deterministic bars
  const NUM_BARS = 12;
  const bars = Array.from({ length: NUM_BARS }).map((_, i) => {
    // Generate a pseudo-random seed per bar based on index and URL
    let seed = i * 1.5;
    if (audioUrl) {
      seed += audioUrl.charCodeAt(audioUrl.length / 2 || 0);
    }

    let height = 20; // base height %
    if (isActiveTrack) {
      // Sine wave animation based on ongoing time
      const sinWave = Math.sin(animationTime + seed) * 35;
      const cosWave = Math.cos(animationTime * 0.7 - seed) * 15;
      height = Math.max(15, Math.min(100, 40 + sinWave + cosWave));
    }
    
    return height;
  });

  return (
    <div className="flex items-end justify-between h-[40px] md:h-[50px] w-full gap-1 overflow-hidden">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-full bg-[#14b8a6] rounded-t-sm transition-all duration-75 origin-bottom"
          style={{ 
            height: `${height}%`,
            opacity: isActiveTrack ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
