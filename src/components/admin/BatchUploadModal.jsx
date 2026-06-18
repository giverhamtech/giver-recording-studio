
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, RefreshCw, CheckCircle2, AlertCircle, FileAudio, Trash2, Loader2, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/firebaseClient.js';
import { toast } from 'sonner';
import useLastCategory from '@/hooks/useLastCategory.js';
import { extractMetadata } from '@/lib/audioMetadataExtractor.js';
import { validateAudioFile, getSupportedFormats } from '@/lib/audioFormatValidator.js';

const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-');

const BatchUploadModal = ({ isOpen, onClose, categories, onUploadComplete }) => {
  const { lastCategory, setLastCategory } = useLastCategory();
  const [selectedCategory, setSelectedCategory] = useState(lastCategory || '');
  const [uploadItems, setUploadItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lastCategory && !selectedCategory) {
      setSelectedCategory(lastCategory);
    }
  }, [lastCategory, selectedCategory]);

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setLastCategory(val);
  };

  const processFiles = async (files) => {
    const newItems = [];
    
    for (const file of files) {
      const validation = validateAudioFile(file);
      if (!validation.isValid) {
        toast.error(`Cannot add ${file.name}: ${validation.error}`);
        continue;
      }
      
      const metadata = await extractMetadata(file);
      
      newItems.push({
        id: Math.random().toString(36).substring(2, 11),
        file,
        metadata,
        status: 'pending', // pending, uploading, success, error
        progress: 0,
        error: null
      });
    }
    
    if (newItems.length > 0) {
      setUploadItems(prev => [...prev, ...newItems]);
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files?.length) {
      processFiles(Array.from(e.target.files));
      e.target.value = null; // reset input
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeItem = (id) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setUploadItems([]);
  };

  const startBatchUpload = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category to apply to these tracks.');
      return;
    }

    const pendingItems = uploadItems.filter(item => item.status === 'pending' || item.status === 'error');
    if (pendingItems.length === 0) return;

    setIsUploading(true);

    // Process sequentially to avoid slamming the server, but could be chunked.
    for (const item of pendingItems) {
      // Set to uploading
      setUploadItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'uploading', progress: 10, error: null } : p));
      
      // Fake progress interval to show activity
      const progressInterval = setInterval(() => {
        setUploadItems(prev => prev.map(p => 
          p.id === item.id && p.progress < 90 ? { ...p, progress: p.progress + 5 } : p
        ));
      }, 400);

      try {
        const formData = new FormData();
        formData.append('title', item.metadata.title);
        formData.append('audioFile', item.file);
        formData.append('category', selectedCategory);
        formData.append('privacy', 'public');
        
        // Generate a unique slug
        const baseSlug = slugify(item.metadata.title);
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        formData.append('slug', uniqueSlug);

        await pb.collection('songs').create(formData, { $autoCancel: false });

        clearInterval(progressInterval);
        setUploadItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'success', progress: 100 } : p));
      } catch (err) {
        clearInterval(progressInterval);
        setUploadItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', progress: 0, error: err.message || 'Upload failed' } : p));
      }
    }

    setIsUploading(false);
    if (onUploadComplete) onUploadComplete();
  };

  const handleClose = () => {
    if (isUploading) {
      toast.error('Please wait for uploads to complete before closing.');
      return;
    }
    onClose();
  };

  const formatList = getSupportedFormats().join(', ');
  
  const stats = {
    total: uploadItems.length,
    success: uploadItems.filter(i => i.status === 'success').length,
    failed: uploadItems.filter(i => i.status === 'error').length,
    pending: uploadItems.filter(i => i.status === 'pending').length
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-6 h-6 text-primary" />
                Batch Upload Tracks
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Upload multiple audio files simultaneously. Supported formats: {formatList}.
              </DialogDescription>
            </div>
            
            <div className="w-64">
              <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isUploading}>
                <SelectTrigger className="bg-background border-border shadow-sm">
                  <SelectValue placeholder="Apply Category to All" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
          {/* Dropzone */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out mb-6 ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-secondary/20 hover:bg-secondary/40'
            } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              multiple 
              accept=".mp3,.wav,.m4a,.aac,.flac,.ogg,.aiff,.wma,audio/*"
              className="hidden" 
              ref={fileInputRef} 
              onChange={onFileSelect}
            />
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
              <FileAudio className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Click or drag audio files here</h3>
            <p className="text-sm text-muted-foreground">Maximum file size: 20MB per track</p>
          </div>

          {/* File List */}
          {uploadItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="font-semibold text-foreground">Selected Files ({uploadItems.length})</h4>
                <Button variant="ghost" size="sm" onClick={clearAll} disabled={isUploading} className="text-muted-foreground hover:text-destructive h-8">
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-3">
                {uploadItems.map(item => (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-card-foreground truncate pr-4">{item.metadata.fileName}</h5>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {(item.metadata.size / 1024 / 1024).toFixed(2)} MB • {item.metadata.formattedDuration}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.status === 'pending' && <Badge variant="outline" className="text-[10px] text-muted-foreground">Pending</Badge>}
                            {item.status === 'uploading' && <Badge className="text-[10px] bg-primary/20 text-primary hover:bg-primary/20 border-primary/20">Uploading...</Badge>}
                            {item.status === 'success' && <Badge className="text-[10px] bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Complete</Badge>}
                            {item.status === 'error' && <Badge variant="destructive" className="text-[10px]">Failed</Badge>}
                            
                            {item.error && <span className="text-xs text-destructive truncate max-w-[200px]" title={item.error}>{item.error}</span>}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.status === 'error' && !isUploading && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setUploadItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'pending', error: null } : p))}>
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {(item.status === 'pending' || item.status === 'error') && !isUploading && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar overlay at bottom of card */}
                    {(item.status === 'uploading' || item.status === 'success') && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                        <div 
                          className={`h-full transition-all duration-300 ${item.status === 'success' ? 'bg-emerald-500' : 'bg-primary'}`} 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-secondary/30 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            {isUploading ? (
              <span className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading {stats.total - stats.pending} of {stats.total} files...
              </span>
            ) : stats.total > 0 ? (
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-4 h-4" /> {stats.success}</span>
                {stats.failed > 0 && <span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-4 h-4" /> {stats.failed}</span>}
                <span className="text-muted-foreground">{stats.pending} pending</span>
              </span>
            ) : (
              <span>No files selected</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading} className="border-border hover:bg-secondary">
              Close
            </Button>
            <Button 
              onClick={startBatchUpload} 
              disabled={isUploading || stats.pending === 0 || !selectedCategory}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-semibold shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              Start Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchUploadModal;
