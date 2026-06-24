
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileAudio, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const BulkUploadZone = ({ files, onAddFiles, onRemoveFile, onClearAll, disabled }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const validateAndAddFiles = (fileList) => {
    const validFiles = [];
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB

    Array.from(fileList).forEach(file => {
      const isAudio = isSupportedAudioFile(file);
      const isWithinSize = file.size <= maxSizeBytes;

      if (!isAudio) {
        toast.error(`"${file.name}" skipped: Unsupported audio format.`);
      } else if (!isWithinSize) {
        toast.error(`"${file.name}" skipped: File size exceeds 20MB limit.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      onAddFiles(validFiles);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files?.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [disabled, onAddFiles]);

  const handleFileInput = (e) => {
    if (e.target.files?.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-primary bg-primary/5 shadow-[0_0_30px_hsl(var(--primary)/0.1)]' 
            : 'border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('bulk-file-input').click()}
      >
        <input
          id="bulk-file-input"
          type="file"
          multiple
          accept="audio/*"
          className="sr-only"
          onChange={handleFileInput}
          disabled={disabled}
        />
        <div className={`w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
          <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {isDragActive ? 'Drop audio files here' : 'Drag files here'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Supports MP3, WAV, M4A, AAC, FLAC and OGG up to 20MB per file.
        </p>
        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground" disabled={disabled}>
          Click to select files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div>
              <h4 className="font-semibold text-foreground">Selected Files ({files.length})</h4>
              <p className="text-xs text-muted-foreground">Total size: {formatSize(totalSize)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearAll} disabled={disabled} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">{fileObj.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatSize(fileObj.size)}</span>
                      <span>•</span>
                      <span>{formatDuration(fileObj.duration)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(fileObj.id);
                  }}
                  disabled={disabled}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadZone;
