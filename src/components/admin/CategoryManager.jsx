
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Tags, Image as ImageIcon, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { toast } from 'sonner';

const getDisplayOrder = (cat) => Number(cat?.display_order ?? cat?.displayOrder ?? cat?.display_Order ?? 0);
const getCategoryImagePath = (cat) => cat?.categoryImage ?? cat?.category_image ?? cat?.category_Image ?? null;
const getCategoryVisible = (cat) => cat?.visible ?? cat?.isVisible ?? true;

const logSupabaseError = (context, error, extra = {}) => {
  console.error(`[CategoryManager] ${context} failed`, {
    code: error?.code,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    status: error?.status,
    ...extra
  });
};

const isSchemaMismatchError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    message.includes('column') ||
    message.includes('description') ||
    message.includes('display_order') ||
    message.includes('category_image') ||
    message.includes('visible')
  );
};

const getCategoryPayloadVariants = (payload) => {
  const withoutVisible = { ...payload };
  delete withoutVisible.visible;

  const legacy = {
    name: payload.name,
    display_Order: payload.display_order,
    category_Image: payload.category_image ?? null
  };

  const fallbackCamel = {
    name: payload.name,
    description: payload.description ?? null,
    displayOrder: payload.display_order,
    categoryImage: payload.category_image ?? null
  };

  return [payload, withoutVisible, legacy, fallbackCamel];
};

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
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
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        logSupabaseError('fetchCategories', error);
        throw error;
      }
      setCategories([...(data || [])].sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b)));
    } catch (error) {
      logSupabaseError('fetchCategories', error);
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
      let uploadedImagePath = null;

      if (categoryImage) {
        const fileExt = categoryImage.name.split('.').pop() || 'jpg';
        const filePath = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('cover-images')
          .upload(filePath, categoryImage, { upsert: false });
        if (uploadErr) {
          logSupabaseError('categoryImageUpload', uploadErr, { filePath, fileName: categoryImage?.name });
          throw uploadErr;
        }
        console.info('[CategoryManager] category image uploaded successfully', { filePath, fileName: categoryImage?.name });
        uploadedImagePath = filePath;
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        display_order: Number(formData.displayOrder) || 0,
        visible: Boolean(formData.visible)
      };

      if (uploadedImagePath) payload.category_image = uploadedImagePath;

      let error = null;
      const payloadVariants = getCategoryPayloadVariants(payload);

      if (editingCategory) {
        for (let i = 0; i < payloadVariants.length; i++) {
          const variant = payloadVariants[i];
          const updateResult = await supabase.from('categories').update(variant).eq('id', editingCategory.id);
          error = updateResult.error;
          if (!error) {
            console.log('Update response:', updateResult.data);
            if (i > 0) {
              console.info('[CategoryManager] update succeeded using fallback payload variant', { variant, categoryId: editingCategory.id, variantIndex: i });
            }
            break;
          }
          logSupabaseError('updateCategoryVariantAttempt', error, { variant, categoryId: editingCategory.id, variantIndex: i });
          if (!isSchemaMismatchError(error)) break;
        }
      } else {
        for (let i = 0; i < payloadVariants.length; i++) {
          const variant = payloadVariants[i];
          const insertResult = await supabase.from('categories').insert(variant);
          error = insertResult.error;
          if (!error) {
            console.log('Insert response:', insertResult.data);
            if (i > 0) {
              console.info('[CategoryManager] create succeeded using fallback payload variant', { variant, variantIndex: i });
            }
            break;
          }
          logSupabaseError('createCategoryVariantAttempt', error, { variant, variantIndex: i });
          if (!isSchemaMismatchError(error)) break;
        }
      }

      if (error) {
        logSupabaseError(editingCategory ? 'updateCategory' : 'createCategory', error, { payload });
        throw error;
      }

      toast.success(editingCategory ? 'Category updated successfully' : 'Category created and persisted to database!');
      
      setFormData({ name: '', description: '', displayOrder: 0, visible: true });
      setCategoryImage(null);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      logSupabaseError('handleSubmit', error, { formData, editingCategoryId: editingCategory?.id ?? null });
      toast.error(`${editingCategory ? 'Failed to update category' : 'Failed to create category'}: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category?.name || '',
      description: category?.description || '',
      displayOrder: getDisplayOrder(category),
      visible: getCategoryVisible(category)
    });
    setCategoryImage(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', displayOrder: 0, visible: true });
    setCategoryImage(null);
  };

  const handleDelete = async (id) => {
    const [{ count: categoryIdCount, error: categoryIdError }, { count: categoryLegacyCount, error: categoryLegacyError }] = await Promise.all([
      supabase
        .from('songs')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id),
      supabase
        .from('songs')
        .select('id', { count: 'exact', head: true })
        .eq('category', id)
    ]);

    if (categoryIdError) {
      logSupabaseError('deleteCategoryPreflight', categoryIdError, { categoryId: id, field: 'category_id' });
      toast.error('Unable to check whether songs use this category');
      return;
    }

    if (categoryLegacyError) {
      logSupabaseError('deleteCategoryPreflight', categoryLegacyError, { categoryId: id, field: 'category' });
      toast.error('Unable to check whether songs use this category');
      return;
    }

    if ((categoryIdCount || 0) + (categoryLegacyCount || 0) > 0) {
      toast.error('Cannot delete a category that already has songs. Reassign those songs first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { data: deleteData, error } = await supabase.from('categories').delete().eq('id', id).select('*').maybeSingle();
      if (error) {
        logSupabaseError('deleteCategory', error, { categoryId: id });
        throw error;
      }
      console.log('Delete response:', deleteData);
      toast.success('Category deleted permanently');
      await fetchCategories();
      if (editingCategory?.id === id) {
        cancelEdit();
      }
    } catch (error) {
      console.log('Error:', error);
      logSupabaseError('deleteCategoryCatch', error, { categoryId: id });
      toast.error(`Failed to delete category: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</CardTitle>
          <CardDescription>{editingCategory ? 'Update the selected category details.' : 'Add a genre or style category to organize beats.'}</CardDescription>
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

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingCategory ? <><Edit className="w-4 h-4 mr-2" /> Save Changes</> : <><Plus className="w-4 h-4 mr-2" /> Create Category</>}
              </Button>
              {editingCategory && (
                <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting} className="border-border hover:bg-secondary">
                  <X className="w-4 h-4 mr-2" /> Cancel Edit
                </Button>
              )}
            </div>
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
                    {getCategoryImagePath(cat) ? (
                      <img
                        src={getPublicStorageUrl({ bucket: 'cover-images', path: getCategoryImagePath(cat) })}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      {cat.name}
                      {cat.visible === false && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Hidden</Badge>}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-1">{cat.description || 'No description'}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Order: {getDisplayOrder(cat)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="text-muted-foreground hover:text-primary">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
