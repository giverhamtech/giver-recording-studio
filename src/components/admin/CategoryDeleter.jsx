
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

const CategoryDeleter = ({ isOpen, onClose, category, categories, onDelete, isLoading }) => {
  const [deleteMode, setDeleteMode] = useState('reassign');
  const [targetCategory, setTargetCategory] = useState('');

  const otherCategories = categories.filter(c => c.name !== category?.name);

  const handleDelete = () => {
    if (deleteMode === 'reassign' && !targetCategory) return;
    onDelete(category.name, deleteMode === 'reassign' ? targetCategory : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Delete "{category?.name}"
          </DialogTitle>
          <DialogDescription>
            What should happen to the beats and productions currently in this category?
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <RadioGroup value={deleteMode} onValueChange={setDeleteMode} className="space-y-4">
            <div className="flex items-start space-x-3 border border-border p-4 rounded-lg bg-background data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-500/5">
              <RadioGroupItem value="reassign" id="reassign" className="mt-1 text-teal-600 border-teal-600" />
              <div className="flex-1">
                <Label htmlFor="reassign" className="font-semibold text-foreground cursor-pointer">Reassign content to another category</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">Move all associated items before deleting this category.</p>
                
                {deleteMode === 'reassign' && (
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
                    <SelectTrigger className="w-full bg-card border-border">
                      <SelectValue placeholder="Select target category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {otherCategories.map(c => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 border border-destructive/20 p-4 rounded-lg bg-destructive/5">
              <RadioGroupItem value="delete" id="delete" className="mt-1 text-destructive border-destructive" />
              <div>
                <Label htmlFor="delete" className="font-semibold text-destructive cursor-pointer">Delete all associated content</Label>
                <p className="text-sm text-muted-foreground mt-1">Warning: This will permanently delete all beats and productions in this category. This cannot be undone.</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-border text-foreground hover:bg-secondary">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading || (deleteMode === 'reassign' && !targetCategory)}
          >
            {isLoading ? 'Processing...' : 'Confirm Deletion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDeleter;
