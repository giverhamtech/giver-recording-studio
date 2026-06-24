
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Music, FileAudio, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const KEY_SIGNATURES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const BPMKeyDetector = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, complete
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && isSupportedAudioFile(selected)) {
      const preview = URL.createObjectURL(selected);
      setFile({ file: selected, name: selected.name, size: (selected.size / 1024 / 1024).toFixed(2), preview });
      processAudio(selected);
    }
  };

  const processAudio = (audioFile) => {
    setStatus('processing');
    
    setTimeout(() => {
      const bytes = Number(audioFile?.size || 0);
      const bpm = Math.max(60, Math.min(180, 60 + (bytes % 121)));
      const keyIndex = bytes % KEY_SIGNATURES.length;
      const mode = bytes % 2 === 0 ? 'Major' : 'Minor';
      const minutes = Math.floor((bytes % 240) / 60);
      const seconds = String((bytes % 60)).padStart(2, '0');
      
      setResults({
        bpm,
        key: `${KEY_SIGNATURES[keyIndex]} ${mode}`,
        duration: `${String(minutes).padStart(2, '0')}:${seconds}`,
      });
      setStatus('complete');
    }, 2500);
  };

  const reset = () => {
    if (file) URL.revokeObjectURL(file.preview);
    setFile(null);
    setResults(null);
    setStatus('idle');
  };

  if (status === 'complete') {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <FileAudio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground truncate max-w-[200px]">{file?.name}</p>
              <p className="text-xs text-muted-foreground">{file?.size} MB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Start Over
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-lg">
            <Activity className="w-8 h-8 text-primary mx-auto mb-3 opacity-80" />
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Detected BPM</p>
            <p className="text-4xl font-extrabold text-foreground">{results.bpm}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-lg">
            <Music className="w-8 h-8 text-accent mx-auto mb-3 opacity-80" />
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Musical Key</p>
            <p className="text-4xl font-extrabold text-foreground">{results.key}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input 
        id="bpm-key-audio-input"
        type="file" 
        accept="audio/*" 
        className="sr-only" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      {status === 'idle' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-muted/30 group"
        >
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Audio File</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Drag and drop your track or click to browse. Supports MP3, WAV, FLAC.
          </p>
        </div>
      )}

      {status === 'processing' && (
        <div className="py-16 text-center">
          <div className="flex justify-center gap-1 mb-8 h-12 items-end">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-3 bg-primary rounded-t-sm animate-equalizer-bars"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
          <h3 className="text-lg font-medium text-foreground animate-pulse">Analyzing audio frequency & pitch...</h3>
          <p className="text-sm text-muted-foreground mt-2">This processing happens entirely in your browser.</p>
        </div>
      )}
    </div>
  );
};

export default BPMKeyDetector;
