import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus, Loader2, Save, Settings2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';

const sanitizeFileName = (name) => String(name || 'asset').replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();

const AdminSiteSettingsPage = () => {
  const { siteSettings, isLoading, saveSiteSettings } = useSiteSettings();

  const [formState, setFormState] = useState({
    site_name: '',
    tagline: '',
    favicon_url: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  useEffect(() => {
    setFormState({
      site_name: siteSettings?.site_name || '',
      tagline: siteSettings?.tagline || '',
      favicon_url: siteSettings?.favicon_url || ''
    });
  }, [siteSettings]);

  const uploadBrandingAsset = async ({ file, folder }) => {
    const extension = sanitizeFileName(file.name).split('.').pop() || 'png';
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' });

    if (error) {
      throw error;
    }

    return getPublicStorageUrl({ bucket: 'site-assets', path: filePath });
  };

  const handleSaveDetails = async () => {
    try {
      setIsSaving(true);
      await saveSiteSettings({
        site_name: formState.site_name.trim() || 'Giver Recording Studio',
        tagline: formState.tagline.trim(),
        favicon_url: formState.favicon_url.trim() || null
      });
      toast.success('Site settings updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to save site settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const logoUrl = await uploadBrandingAsset({ file, folder: 'logos' });
      await saveSiteSettings({ logo_url: logoUrl });
      toast.success('Logo uploaded and applied');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (file) => {
    if (!file) return;
    try {
      setIsUploadingFavicon(true);
      const faviconUrl = await uploadBrandingAsset({ file, folder: 'favicons' });
      await saveSiteSettings({ favicon_url: faviconUrl });
      setFormState((prev) => ({ ...prev, favicon_url: faviconUrl }));
      toast.success('Favicon uploaded and applied');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to upload favicon');
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Site Settings - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
                <p className="text-sm text-muted-foreground">Manage logo, branding text, and favicon in real time.</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline" className="border-border">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>Upload a logo and update site naming used across the public website and admin pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    className="bg-background"
                    value={formState.site_name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, site_name: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon-url">Favicon URL</Label>
                  <Input
                    id="favicon-url"
                    className="bg-background"
                    value={formState.favicon_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, favicon_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Textarea
                  id="tagline"
                  className="bg-background"
                  value={formState.tagline}
                  onChange={(e) => setFormState((prev) => ({ ...prev, tagline: e.target.value }))}
                  rows={3}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">Current Logo</p>
                  <div className="h-24 rounded-md border border-border bg-secondary/40 flex items-center justify-center overflow-hidden">
                    {siteSettings?.logo_url ? (
                      <img src={siteSettings.logo_url} alt="Site logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No logo configured</span>
                    )}
                  </div>
                  <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center text-sm text-primary">
                    <ImagePlus className="w-4 h-4 mr-2" /> Upload/Replace Logo
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="bg-background"
                    disabled={isUploadingLogo}
                    onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  />
                  {isUploadingLogo && <p className="text-xs text-muted-foreground flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Uploading logo...</p>}
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">Favicon Upload</p>
                  <div className="h-24 rounded-md border border-border bg-secondary/40 flex items-center justify-center overflow-hidden">
                    {siteSettings?.favicon_url ? (
                      <img src={siteSettings.favicon_url} alt="Favicon preview" className="h-10 w-10 object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No favicon configured</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    className="bg-background"
                    disabled={isUploadingFavicon}
                    onChange={(e) => handleFaviconUpload(e.target.files?.[0])}
                  />
                  {isUploadingFavicon && <p className="text-xs text-muted-foreground flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Uploading favicon...</p>}
                </div>
              </div>

              <div>
                <Button onClick={handleSaveDetails} disabled={isSaving || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Settings</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdminSiteSettingsPage;
