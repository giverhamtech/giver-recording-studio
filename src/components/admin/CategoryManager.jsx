
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Tags, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    visible: true
  });
  const [categoryImage, setCategoryImage] = useState(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await pb.collection('categories').getFullList({ sort: 'displayOrder', $autoCancel: false });
      setCategories(res);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('displayOrder', formData.displayOrder);
      payload.append('visible', formData.visible);
      
      if (categoryImage) {
        payload.append('categoryImage', categoryImage);
      }

      await pb.collection('categories').create(payload, { $autoCancel: false });
      toast.success('Category created and persisted to database!');
      
      setFormData({ name: '', description: '', displayOrder: 0, visible: true });
      setCategoryImage(null);
      fetchCategories();
    } catch (error) {
      console.error('Category creation error:', error);
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Songs using it will become Uncategorized.')) return;
    
    try {
      await pb.collection('categories').delete(id, { $autoCancel: false });
      toast.success('Category deleted permanently');
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
          <CardDescription>Add a genre or style category to organize beats.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="E.g., Afrobeats" required className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order (Lower comes first)</Label>
                <Input id="displayOrder" name="displayOrder" type="number" value={formData.displayOrder} onChange={handleInputChange} className="bg-background" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief description of this style..." className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryImage">Category Cover Image</Label>
                <Input id="categoryImage" type="file" accept="image/*" onChange={(e) => setCategoryImage(e.target.files[0])} className="bg-background" />
                <p className="text-xs text-muted-foreground mt-1">Used as fallback artwork for songs in this category.</p>
              </div>

              <div className="space-y-2 flex items-center gap-2 pt-8">
                <input 
                  type="checkbox" 
                  id="visible" 
                  name="visible" 
                  checked={formData.visible} 
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="visible" className="cursor-pointer mb-0">Visible to Public</Label>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4 mr-2" /> Create Category</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Database Categories</CardTitle>
          <CardDescription>Manage active categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Tags className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No categories found in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-background/50">
                  <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border/50">
                    {cat.categoryImage ? (
                      <img src={pb.files.getURL(cat, cat.categoryImage)} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      {cat.name}
                      {!cat.visible && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Hidden</Badge>}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-1">{cat.description || 'No description'}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Order: {cat.displayOrder}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
