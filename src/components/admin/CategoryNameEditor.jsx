
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CategoryNameEditor = ({ isOpen, onClose, category, onSave, isLoading }) => {
  const [newName, setNewName] = useState(category?.name || '');

  const handleSave = () => {
    if (!newName.trim()) return;
    if (newName === category.name) {
      onClose();
      return;
    }
    onSave(category.name, newName.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Rename Category</DialogTitle>
          <DialogDescription>
            This will update the category name across all associated beats and productions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Category Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-background text-foreground focus-visible:ring-teal-500"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-border text-foreground hover:bg-secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !newName.trim()} className="bg-teal-600 text-white hover:bg-teal-700">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryNameEditor;
