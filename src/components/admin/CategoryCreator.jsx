
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const CategoryCreator = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), previewUrl, isDefault);
    setName('');
    setPreviewUrl(null);
    setIsDefault(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Category</DialogTitle>
          <DialogDescription>
            Add a new genre or category to your studio's library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-name" className="text-foreground">Category Name *</Label>
            <Input
              id="new-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Synthwave"
              className="bg-background text-foreground focus-visible:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Default Artwork (Optional)</Label>
            <div className="h-32 rounded-xl border-2 border-dashed border-border hover:border-teal-500/50 bg-background flex flex-col items-center justify-center relative group overflow-hidden transition-colors">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-teal-500 transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-teal-500 transition-colors">Click to upload</span>
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Set as Default</Label>
              <p className="text-xs text-muted-foreground">Pre-selected in upload forms</p>
            </div>
            <Switch 
              checked={isDefault} 
              onCheckedChange={setIsDefault}
              className="data-[state=checked]:bg-teal-600" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-border text-foreground hover:bg-secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !name.trim()} className="bg-teal-600 text-white hover:bg-teal-700">
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryCreator;
