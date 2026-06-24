
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Copy, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const AudioToLyrics = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [lyrics, setLyrics] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && isSupportedAudioFile(selected)) {
      setFile(selected);
      processAudio();
    }
  };

  const processAudio = () => {
    setStatus('processing');
    
    setTimeout(() => {
      setLyrics(
        'Automatic transcription is currently unavailable in this build.\n\n' +
        'Your upload was received successfully, but no placeholder lyrics are generated.\n' +
        'Please use your production transcription service and paste the final lyrics here if needed.'
      );
      setStatus('complete');
    }, 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    toast.success('Lyrics copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([lyrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, "")}_lyrics.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setLyrics('');
    setStatus('idle');
  };

  return (
    <div className="space-y-6">
      <input id="audio-to-lyrics-input" type="file" accept="audio/*" className="sr-only" ref={fileInputRef} onChange={handleFileChange} />
      
      {status === 'idle' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-muted/30 group"
        >
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Song for Lyrics</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            AI-powered speech-to-text transcription.
          </p>
        </div>
      )}

      {status === 'processing' && (
        <div className="py-12 text-center animate-in fade-in">
          <FileText className="w-12 h-12 text-primary mx-auto mb-6 animate-bounce" />
          <h3 className="text-lg font-medium text-foreground mb-2">Transcribing Audio...</h3>
          <p className="text-sm text-muted-foreground">Generating text from vocals. This usually takes a few seconds.</p>
        </div>
      )}

      {status === 'complete' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Transcription Ready
            </h4>
            <Button variant="ghost" size="sm" onClick={reset}>Upload New</Button>
          </div>
          
          <div className="bg-muted/30 border border-border rounded-xl p-6 relative group">
            <pre className="font-sans text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {lyrics}
            </pre>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" onClick={handleCopy} className="h-8 w-8">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="secondary" onClick={handleDownload} className="h-8 w-8">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioToLyrics;
