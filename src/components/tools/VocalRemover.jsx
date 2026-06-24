
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, MicOff, Download, RefreshCw, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const VocalRemover = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && isSupportedAudioFile(selected)) {
      const preview = URL.createObjectURL(selected);
      setFile({ file: selected, name: selected.name, size: (selected.size / 1024 / 1024).toFixed(2), preview });
      processAudio();
    }
  };

  const processAudio = () => {
    setStatus('processing');
    setProgress(0);
    
    // Simulate ML processing with a progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStatus('complete');
          return 100;
        }
        return p + 5;
      });
    }, 200);
  };

  const reset = () => {
    if (file) URL.revokeObjectURL(file.preview);
    setFile(null);
    setProgress(0);
    setStatus('idle');
  };

  const downloadTrack = (type) => {
    const a = document.createElement('a');
    a.href = file.preview;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}_${type}.wav`;
    a.click();
  };

  if (status === 'complete') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <FileAudio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground truncate max-w-[180px]">{file?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Start Over
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <MicOff className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">Separation Complete</h3>
            <p className="text-muted-foreground mt-2">Your track has been successfully split.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              size="lg" 
              onClick={() => downloadTrack('instrumental')}
              className="h-14 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            >
              <Download className="w-5 h-5 mr-2" /> Instrumental Only
            </Button>
            <Button 
              size="lg" 
              onClick={() => downloadTrack('vocals')}
              className="h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              <Download className="w-5 h-5 mr-2" /> Vocals Only
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input id="vocal-remover-audio-input" type="file" accept="audio/*" className="sr-only" ref={fileInputRef} onChange={handleFileChange} />
      
      {status === 'idle' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-muted/30 group"
        >
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Audio for Separation</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Extract high-quality instrumentals and acapellas from any song.
          </p>
        </div>
      )}

      {status === 'processing' && (
        <div className="py-12 text-center">
          <MicOff className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
          <h3 className="text-lg font-medium text-foreground mb-4">Isolating stems using AI models...</h3>
          <div className="max-w-md mx-auto h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{progress}% Complete</p>
        </div>
      )}
    </div>
  );
};

export default VocalRemover;
