
import React, { useState } from 'react';
import { Save, CheckCircle2, ListPlus, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FeaturedToggle from './FeaturedToggle.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { CATEGORIES, CATEGORY_IMAGES } from '@/config/beatCategories.js';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection.js';

const PostUploadEditor = ({ records, failedUploads, skippedFiles, collectionName, onComplete }) => {
  const [editableRecords, setEditableRecords] = useState(
    records.map(r => ({ ...r, isFeatured: false }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const { checkForDuplicate } = useDuplicateDetection();

  const handleChange = (id, field, value) => {
    setEditableRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const record of editableRecords) {
        // Quick duplicate check if they changed the title
        const originalRecord = records.find(r => r.id === record.id);
        if (originalRecord && originalRecord.title !== record.title) {
          const { isDuplicate, reason } = await checkForDuplicate(record.title);
          if (isDuplicate) {
            const proceed = window.confirm(`Title "${record.title}" may be a duplicate: ${reason}. Proceed anyway?`);
            if (!proceed) {
              setIsSaving(false);
              return; // Stop saving process so they can fix it
            }
          }
        }

        const data = {
          title: record.title,
          description: record.description || '',
          category: record.category || record.genre, // handle both beats and productions
          ...(collectionName === 'beats' && { isFeatured: record.isFeatured })
        };
        await pb.collection(collectionName).update(record.id, data, { $autoCancel: false });
      }
      toast.success(`Successfully updated ${editableRecords.length} items.`);
      if (onComplete) onComplete();
    } catch (error) {
      toast.error('Failed to save some updates.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this newly uploaded item?')) return;
    try {
      await pb.collection(collectionName).delete(id, { $autoCancel: false });
      setEditableRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Item deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${(failedUploads?.length > 0 || skippedFiles?.length > 0) ? '1' : '3'} bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col justify-center`}>
          <div className="flex items-center gap-4 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <h3 className="text-xl font-bold text-foreground">Upload Complete</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Successfully uploaded <strong>{records.length}</strong> items. Review and finalize metadata below.
          </p>
        </div>

        {skippedFiles && skippedFiles.length > 0 && (
          <div className="lg:col-span-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {skippedFiles.length} Duplicates Skipped
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
              {skippedFiles.map((skip, i) => (
                <div key={i} className="text-xs bg-background p-2 rounded border border-border">
                  <p className="font-medium truncate text-foreground">{skip.file.name}</p>
                  <p className="text-amber-600 dark:text-amber-400 mt-1">{skip.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {failedUploads && failedUploads.length > 0 && (
          <div className="lg:col-span-1 bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-destructive" />
              {failedUploads.length} Failed Uploads
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
              {failedUploads.map((fail, i) => (
                <div key={i} className="text-xs bg-background p-2 rounded border border-border">
                  <p className="font-medium truncate text-foreground">{fail.file.name}</p>
                  <p className="text-destructive mt-1">{fail.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {editableRecords.map((record) => {
          const cat = record.category || record.genre || 'Instrumentals';
          const coverUrl = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES['Instrumentals'];

          return (
            <div key={record.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row gap-8 shadow-sm">
              <div className="w-full md:w-56 shrink-0 space-y-4">
                <img src={coverUrl} alt={cat} className="w-full aspect-square object-cover rounded-xl shadow-md" />
                <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(record.id)}>
                  Delete Entry
                </Button>
              </div>
              
              <div className="flex-grow space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Track Title</Label>
                  <Input 
                    value={record.title} 
                    onChange={(e) => handleChange(record.id, 'title', e.target.value)}
                    className="bg-background h-12 text-lg font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select 
                    value={cat} 
                    onValueChange={(val) => handleChange(record.id, collectionName === 'productions' ? 'genre' : 'category', val)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {collectionName === 'beats' && (
                  <FeaturedToggle 
                    isFeatured={record.isFeatured} 
                    onChange={(val) => handleChange(record.id, 'isFeatured', val)} 
                  />
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                  <Textarea 
                    value={record.description || ''} 
                    onChange={(e) => handleChange(record.id, 'description', e.target.value)}
                    className="bg-background min-h-[100px]"
                    placeholder="Add tags, mood, or context..."
                  />
                </div>
              </div>
            </div>
          );
        })}
        {editableRecords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
            No records to edit.
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
        <Button variant="outline" onClick={onComplete} disabled={isSaving} className="w-full sm:w-auto h-12">
          <ListPlus className="w-4 h-4 mr-2" /> Upload More Files
        </Button>
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving || editableRecords.length === 0} 
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
        >
          {isSaving ? 'Saving Changes...' : (
            <>
              <Save className="w-5 h-5 mr-2" /> Save & Finish
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PostUploadEditor;
