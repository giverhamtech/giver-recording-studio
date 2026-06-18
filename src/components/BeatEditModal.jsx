
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FeaturedToggle from './FeaturedToggle.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { CATEGORIES } from '@/config/beatCategories.js';

const BeatEditModal = ({ beat, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    isFeatured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (beat && isOpen) {
      setFormData({
        title: beat.title || '',
        category: beat.category || '',
        description: beat.description || '',
        isFeatured: beat.isFeatured || false
      });
    }
  }, [beat, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beat) return;

    setIsSubmitting(true);
    try {
      const updated = await pb.collection('beats').update(beat.id, formData, { $autoCancel: false });
      toast.success('Beat updated successfully');
      if (onSave) onSave(updated);
      onClose();
    } catch (error) {
      console.error('Error updating beat:', error);
      toast.error('Failed to update beat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Edit Beat Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              required 
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => handleChange('category', val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              className="bg-background min-h-[100px]"
            />
          </div>

          <FeaturedToggle 
            isFeatured={formData.isFeatured} 
            onChange={(val) => handleChange('isFeatured', val)} 
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BeatEditModal;
