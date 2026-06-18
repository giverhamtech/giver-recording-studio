
import React from 'react';
import { Layers, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BulkUploadZone from './BulkUploadZone.jsx';
import { CATEGORIES, CATEGORY_IMAGES } from '@/config/beatCategories.js';

const BulkUploadForm = ({ 
  files, 
  addFiles, 
  removeFile, 
  clearFiles, 
  uploadFiles, 
  selectedCategory, 
  handleCategoryChange,
  isUploading
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <BulkUploadZone 
            files={files} 
            onAddFiles={addFiles} 
            onRemoveFile={removeFile} 
            onClearAll={clearFiles}
            disabled={isUploading}
          />
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Batch Settings
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Apply Category to All *</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={handleCategoryChange}
                  disabled={isUploading}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && CATEGORY_IMAGES[selectedCategory] && (
                <div className="mt-4 border border-border rounded-xl overflow-hidden bg-background">
                  <div className="p-3 bg-muted/50 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">Assigned Artwork</p>
                  </div>
                  <div className="p-4 flex items-center gap-4">
                    <img 
                      src={CATEGORY_IMAGES[selectedCategory]} 
                      alt={selectedCategory} 
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This cover art will be automatically applied to all uploaded files in this batch.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <Button 
                onClick={uploadFiles} 
                disabled={files.length === 0 || !selectedCategory || isUploading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Initializing...' : `Upload All (${files.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadForm;
