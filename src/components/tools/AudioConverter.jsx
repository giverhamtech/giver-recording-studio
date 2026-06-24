
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Settings2, Download, CheckCircle2, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const FORMATS = ['MP3', 'WAV', 'FLAC', 'AAC', 'M4A'];
const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const AUDIO_ACCEPT = 'audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg';
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const AudioConverter = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [targetFormat, setTargetFormat] = useState('WAV');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  const handleSelectedFile = (selected) => {
    if (selected && isSupportedAudioFile(selected)) {
      const preview = URL.createObjectURL(selected);
      setFile({ file: selected, name: selected.name, preview });
    }
  };

  const handleFileChange = (e) => {
    handleSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleSelectedFile(e.dataTransfer?.files?.[0]);
  };

  const handleConvert = () => {
    if (!file) return;
    setStatus('processing');
    
    // Simulate conversion delay
    setTimeout(() => {
      setStatus('complete');
      toast.success(`Successfully converted to ${targetFormat}`);
    }, 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.preview;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}_converted.${targetFormat.toLowerCase()}`;
    a.click();
  };

  const reset = () => {
    if (file) URL.revokeObjectURL(file.preview);
    setFile(null);
    setStatus('idle');
  };

  return (
    <div className="space-y-6">
      <input id="audio-converter-input" type="file" accept={AUDIO_ACCEPT} className="sr-only" ref={fileInputRef} onChange={handleFileChange} />
      
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30'
          }`}
        >
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Audio to Convert</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Lossless and fast format conversions entirely in-browser.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <FileAudio className="w-6 h-6 text-primary" />
            </div>
            <div className="overflow-hidden flex-grow">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Ready to convert</p>
            </div>
            {status !== 'processing' && (
              <Button variant="ghost" size="sm" onClick={reset}>Change</Button>
            )}
          </div>

          {status === 'idle' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Format</label>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger className="w-full h-12 bg-background border-border">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map(fmt => (
                      <SelectItem key={fmt} value={fmt}>{fmt} Format</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleConvert} 
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
              >
                <Settings2 className="w-5 h-5 mr-2" /> Start Conversion
              </Button>
            </div>
          )}

          {status === 'processing' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-foreground font-medium">Converting to {targetFormat}...</p>
            </div>
          )}

          {status === 'complete' && (
            <div className="py-4 text-center space-y-6 animate-in zoom-in-95">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h4 className="text-xl font-bold text-foreground">Conversion Successful</h4>
                <p className="text-muted-foreground mt-1">Your file is ready to download.</p>
              </div>
              <Button 
                onClick={handleDownload} 
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold"
              >
                <Download className="w-5 h-5 mr-2" /> Download {targetFormat}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioConverter;
