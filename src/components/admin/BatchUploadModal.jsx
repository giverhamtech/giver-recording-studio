
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, RefreshCw, CheckCircle2, AlertCircle, FileAudio, Trash2, Loader2, Music, Image as ImageIcon, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase.js';
import { toast } from 'sonner';
import useLastCategory from '@/hooks/useLastCategory.js';
import { extractMetadata } from '@/lib/audioMetadataExtractor.js';
import { validateAudioFile, getSupportedFormats } from '@/lib/audioFormatValidator.js';
import { SPOTLIGHT_SONGS_QUERY_KEY, SONGS_ADMIN_QUERY_KEY } from '@/lib/queryClient.js';
import { generateSlug } from '@/lib/utils.js';

const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-');

const formatSupabaseError = (stage, error) => {
  if (!error) return `${stage}: Unknown error`;
  const code = error.code ? `code=${error.code}` : null;
  const status = error.status ? `status=${error.status}` : null;
  const message = error.message ? `message=${error.message}` : null;
  const details = error.details ? `details=${error.details}` : null;
  const hint = error.hint ? `hint=${error.hint}` : null;
  return [stage, code, status, message, details, hint].filter(Boolean).join(' | ');
};

const getCategoryImagePath = (cat) => {
  if (!cat) return null;
  return cat.category_image ?? cat.categoryImage ?? cat.category_Image ?? null;
};

const BatchUploadModal = ({ isOpen, onClose, categories, onUploadComplete }) => {
  const queryClient = useQueryClient();
  const { lastCategory, setLastCategory } = useLastCategory();
  const [selectedCategory, setSelectedCategory] = useState(lastCategory || 'none');
  const [uploadItems, setUploadItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [privacy, setPrivacy] = useState('public');
  const [spotlightEnabled, setSpotlightEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const safeCategories = Array.isArray(categories) ? categories : [];

  const selectedCategoryRecord =
    selectedCategory && selectedCategory !== 'none'
      ? safeCategories.find((cat) => cat?.id === selectedCategory) || null
      : null;
  const selectedCategoryCoverPath = getCategoryImagePath(selectedCategoryRecord);

  useEffect(() => {
    if (lastCategory && selectedCategory === 'none') {
      setSelectedCategory(lastCategory);
    }
  }, [lastCategory, selectedCategory]);

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    if (val !== 'none') {
      setLastCategory(val);
    }
  };

  const processFiles = async (files) => {
    const newItems = [];
    
    for (const file of files) {
      try {
        const validation = validateAudioFile(file);
        if (!validation.isValid) {
          toast.error(`Cannot add ${file?.name || 'file'}: ${validation.error}`);
          continue;
        }
        
        const metadata = await extractMetadata(file);
        
        newItems.push({
          id: Math.random().toString(36).substring(2, 11),
          file,
          metadata,
          title: metadata.title,
          status: 'pending', // pending, uploading, success, error
          progress: 0,
          error: null
        });
      } catch (error) {
        console.error('Batch file processing error:', error);
        toast.error(`Failed to process ${file?.name || 'selected file'}`);
      }
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
    setCoverImage(null);
  };

  const updateItemTitle = (id, value) => {
    setUploadItems(prev => prev.map(item => item.id === id ? { ...item, title: value } : item));
  };

  const startBatchUpload = async () => {
    const pendingItems = uploadItems.filter(item => item.status === 'pending' || item.status === 'error');
    if (pendingItems.length === 0) return;

    setIsUploading(true);
    let sharedCoverPath = null;
    let successCount = 0;
    let failedCount = 0;

    try {
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop() || 'jpg';
        sharedCoverPath = `songs/covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: coverUploadError } = await supabase.storage
          .from('cover-images')
          .upload(sharedCoverPath, coverImage, { upsert: false });

        if (coverUploadError) {
          throw new Error(formatSupabaseError('cover-images upload failed', coverUploadError));
        }
      } else if (selectedCategory && selectedCategory !== 'none') {
        // Default to category artwork when no shared cover was manually selected.
        sharedCoverPath = selectedCategoryCoverPath;

        if (!sharedCoverPath) {
          const { data: fetchedCategory, error: categoryFetchError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', selectedCategory)
            .maybeSingle();

          if (categoryFetchError) {
            console.error('Category cover fallback lookup failed:', categoryFetchError);
          } else {
            sharedCoverPath = getCategoryImagePath(fetchedCategory);
          }
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to prepare batch cover image');
      setIsUploading(false);
      return;
    }

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
        const audioExt = item.file.name.split('.').pop() || 'mp3';
        const audioPath = `songs/audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${audioExt}`;
        const { error: audioUploadError } = await supabase.storage
          .from('song-files')
          .upload(audioPath, item.file, { upsert: false });

        if (audioUploadError) {
          throw new Error(formatSupabaseError('song-files upload failed', audioUploadError));
        }

        const payload = {
          title: item.title?.trim() || item.metadata.title,
          description: null,
          category_id: selectedCategory === 'none' ? null : selectedCategory,
          privacy,
          is_featured: Boolean(spotlightEnabled),
          slug: generateSlug(item.title?.trim() || item.metadata.title) || slugify(item.title?.trim() || item.metadata.title),
          audio_file: audioPath,
          cover_image: sharedCoverPath
        };

        const { data: insertData, error: insertError } = await supabase.from('songs').insert(payload).select('*').maybeSingle();

        if (insertError) {
          throw new Error(formatSupabaseError('songs insert failed', insertError));
        }

        console.log('Insert response:', insertData);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
          queryClient.invalidateQueries({ queryKey: SONGS_ADMIN_QUERY_KEY })
        ]);

        clearInterval(progressInterval);
        setUploadItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'success', progress: 100 } : p));
        successCount += 1;
      } catch (err) {
        clearInterval(progressInterval);
        setUploadItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', progress: 0, error: err.message || 'Upload failed' } : p));
        failedCount += 1;
      }
    }

    setIsUploading(false);
    if (onUploadComplete) {
      await onUploadComplete();
    }

    if (failedCount === 0) {
      toast.success(`Batch upload complete: ${successCount} tracks added.`);
    } else {
      toast.error(`Batch upload finished with ${failedCount} failed track${failedCount === 1 ? '' : 's'}.`);
    }
  };

  const retryFailed = () => {
    setUploadItems(prev => prev.map(item => item.status === 'error' ? { ...item, status: 'pending', error: null, progress: 0 } : item));
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
            
            <div className="w-64 space-y-2">
              <Label className="text-xs text-muted-foreground">Apply Category to All</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isUploading}>
                <SelectTrigger className="bg-background border-border shadow-sm">
                  <SelectValue placeholder="Uncategorized" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {safeCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Batch Privacy</Label>
              <Select value={privacy} onValueChange={setPrivacy} disabled={isUploading}>
                <SelectTrigger className="bg-background border-border shadow-sm">
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shared Cover Image</Label>
              <div className="flex gap-2">
                <Input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    try {
                      const selectedFile = e?.target?.files?.[0] || null;
                      setCoverImage(selectedFile);
                    } catch (error) {
                      console.error('Cover file selection error:', error);
                      setCoverImage(null);
                      toast.error('Could not read selected cover image.');
                    }
                  }}
                  disabled={isUploading}
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={spotlightEnabled}
                  onChange={(e) => setSpotlightEnabled(e.target.checked)}
                  disabled={isUploading}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Add all to homepage spotlight
              </label>
            </div>
          </div>

          {coverImage && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/20 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{coverImage.name}</p>
                <p className="text-xs text-muted-foreground">Shared artwork will be applied to every track in this batch.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCoverImage(null)} disabled={isUploading} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {!coverImage && selectedCategory !== 'none' && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/20 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {selectedCategoryRecord?.name || 'Selected category'} cover will be used by default
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCategoryCoverPath ? 'No shared cover selected, so category artwork will be applied automatically.' : 'No shared cover selected. If category artwork exists in the database, it will be applied automatically.'}
                </p>
              </div>
            </div>
          )}

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
                          <div className="flex items-center gap-2 min-w-0 pr-4">
                            <Edit3 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Input
                              value={item.title}
                              onChange={(e) => updateItemTitle(item.id, e.target.value)}
                              disabled={isUploading || item.status === 'success'}
                              className="h-8 bg-background border-border text-sm font-semibold"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {(item.metadata.size / 1024 / 1024).toFixed(2)} MB • {item.metadata.formattedDuration}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">Source file: {item.metadata.fileName}</p>
                        
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
              {stats.failed > 0 && !isUploading && (
                <Button variant="outline" onClick={retryFailed} className="border-border hover:bg-secondary">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry Failed
                </Button>
              )}
            <Button 
              onClick={startBatchUpload} 
                disabled={isUploading || stats.pending === 0}
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
