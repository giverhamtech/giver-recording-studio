
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileAudio as AudioWaveform, Play, Pause, RefreshCw, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRESETS = [
  { id: 'normal', name: 'Original', pitch: 1 },
  { id: 'pitchUp', name: 'Pitch Up', pitch: 1.5 },
  { id: 'pitchDown', name: 'Pitch Down', pitch: 0.7 },
  { id: 'chipmunk', name: 'High Voice', pitch: 2.0 },
  { id: 'deep', name: 'Deep Voice', pitch: 0.5 },
  { id: 'robotic', name: 'Robotic', pitch: 1, robotic: true },
  { id: 'echo', name: 'Echo', pitch: 1, echo: true },
];

const VoiceConverter = () => {
  const [file, setFile] = useState(null);
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('audio/')) {
      const preview = URL.createObjectURL(selected);
      setFile({ file: selected, name: selected.name, preview });
      if (audioRef.current) {
        audioRef.current.src = preview;
      }
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    if (audioRef.current) {
      // Simulate Voice Conversion using playback rate for pitch shifting
      // (Native pitch shift without tempo change requires WebAudio API AudioWorklet, 
      // utilizing playbackRate is a lightweight alternative for this temporary tool)
      audioRef.current.preservesPitch = preset.robotic || preset.echo; 
      audioRef.current.playbackRate = preset.pitch;
      
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    if (audioRef.current) audioRef.current.pause();
    if (file) URL.revokeObjectURL(file.preview);
    setFile(null);
    setIsPlaying(false);
    setActivePreset(PRESETS[0]);
  };

  return (
    <div className="space-y-6">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
      
      <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-muted/30 group"
        >
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Voice Recording</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Transform your vocals with studio effects.
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                onClick={togglePlay}
                size="icon"
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </Button>
              <div className="overflow-hidden">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <AudioWaveform className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{activePreset.name} Effect Applied</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="w-full sm:w-auto shrink-0">
              <RefreshCw className="w-4 h-4 mr-2" /> Change File
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Select Voice Preset</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    activePreset.id === preset.id
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_hsl(var(--primary)/0.2)]'
                      : 'bg-card border-border text-foreground/80 hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceConverter;
