
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/firebaseClient.js';

const CategoryImageUpload = ({ isOpen, onClose, category, onSave, isLoading }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      if (!selected.type.startsWith('image/')) {
        toast.error('Must be an image file');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSave = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', `${category.name} Cover`);
      formData.append('artist', 'System');
      formData.append('genre', 'System_Category_Image');
      formData.append('coverImage', file);
      
      const existing = await pb.collection('productions').getFullList({
        filter: `genre="System_Category_Image" && title="${category.name} Cover"`,
        $autoCancel: false
      });
      
      let record;
      if (existing.length > 0) {
        record = await pb.collection('productions').update(existing[0].id, formData, { $autoCancel: false });
      } else {
        record = await pb.collection('productions').create(formData, { $autoCancel: false });
      }
      
      const imageUrl = pb.files.getURL(record, record.coverImage);
      
      await onSave(category.name, imageUrl);
      toast.success('Image successfully saved to database');
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload image to database');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Update Category Image</DialogTitle>
          <DialogDescription>
            This image will be used as the default artwork for {category?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="space-y-2 text-center w-full md:w-auto">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Image</Label>
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-border mx-auto bg-muted">
                {category?.imageUrl ? (
                  <img src={category.imageUrl} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/30 m-auto mt-12" />
                )}
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />

            <div className="space-y-2 text-center w-full md:w-auto">
              <Label className="text-xs text-teal-500 font-semibold uppercase tracking-wider">New Image</Label>
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-teal-500/50 bg-teal-500/5 flex items-center justify-center mx-auto relative group">
                {previewUrl ? (
                  <img src={previewUrl} alt="New Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-teal-500/50" />
                )}
                
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
                
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                  <UploadCloud className="w-6 h-6 text-teal-500 mb-1" />
                  <span className="text-xs font-medium text-teal-500">Choose File</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading || isUploading} className="border-border text-foreground hover:bg-secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isUploading || !previewUrl} className="bg-teal-600 text-white hover:bg-teal-700">
            {isUploading ? 'Uploading...' : 'Save & Replace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryImageUpload;
