
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import BulkUploadZone from './BulkUploadZone.jsx';
import UploadProgressTracker from './UploadProgressTracker.jsx';
import PostUploadEditor from './PostUploadEditor.jsx';
import useBulkUpload from '@/hooks/useBulkUpload.js';
import useLastCategory from '@/hooks/useLastCategory.js';
import { CATEGORIES } from '@/config/beatCategories.js';
import { toast } from 'sonner';

const BulkUploadProductions = ({ onComplete }) => {
  const { lastCategory, setLastCategory } = useLastCategory();
  
  const {
    files,
    isUploading,
    uploadedRecords,
    selectedCategory,
    handleCategoryChange: _handleCatChange,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    setUploadedRecords
  } = useBulkUpload('productions');

  const [defaultArtist, setDefaultArtist] = useState('Giver Recording Studio');

  useEffect(() => {
    // If the hook initializes empty but we have a lastCategory, sync it up
    if (!selectedCategory && lastCategory) {
      _handleCatChange(lastCategory);
    }
  }, [lastCategory, selectedCategory, _handleCatChange]);

  const handleCategoryChange = (val) => {
    _handleCatChange(val);
    setLastCategory(val);
  };

  const handleStartUpload = async () => {
    if (!selectedCategory) {
      toast.error('Please select a genre first.');
      return;
    }
    if (!defaultArtist) {
      toast.error('Please enter a default artist name.');
      return;
    }
    await uploadFiles({ artist: defaultArtist });
  };

  const handleEditorComplete = () => {
    clearFiles();
    if (onComplete) onComplete();
  };

  if (uploadedRecords.length > 0 && !isUploading) {
    return (
      <PostUploadEditor 
        records={uploadedRecords} 
        collectionName="productions" 
        onComplete={handleEditorComplete} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-xl border border-border">
        <div className="space-y-2">
          <Label>Apply Genre to All Files *</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isUploading}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Default Artist Name *</Label>
          <Input 
            value={defaultArtist} 
            onChange={(e) => setDefaultArtist(e.target.value)} 
            disabled={isUploading}
            className="bg-background border-border text-foreground"
          />
        </div>
      </div>

      {!isUploading ? (
        <>
          <BulkUploadZone 
            files={files} 
            onAddFiles={addFiles} 
            onRemoveFile={removeFile} 
            onClearAll={clearFiles}
            disabled={isUploading}
          />
          
          {files.length > 0 && (
            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleStartUpload} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
              >
                <Upload className="w-5 h-5 mr-2" /> Start Bulk Upload ({files.length} files)
              </Button>
            </div>
          )}
        </>
      ) : (
        <UploadProgressTracker files={files} />
      )}
    </div>
  );
};

export default BulkUploadProductions;
