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
import { getDefaultPrivacyPolicy, getDefaultTermsOfService } from '@/lib/legalDefaults.js';

const sanitizeFileName = (name) => String(name || 'asset').replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();

const AdminSiteSettingsPage = () => {
  const { siteSettings, isLoading, saveSiteSettings } = useSiteSettings();

  const [formState, setFormState] = useState({
    site_name: '',
    tagline: '',
    favicon_url: '',
    footer_copyright: '',
    footer_text: '',
    contact_email: '',
    phone_number: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    tiktok_url: '',
    whatsapp_url: '',
    privacy_policy: '',
    terms_of_service: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  useEffect(() => {
    setFormState({
      site_name: siteSettings?.site_name || '',
      tagline: siteSettings?.tagline || '',
      favicon_url: siteSettings?.favicon_url || '',
      footer_copyright: siteSettings?.footer_copyright || '',
      footer_text: siteSettings?.footer_text || '',
      contact_email: siteSettings?.contact_email || '',
      phone_number: siteSettings?.phone_number || '',
      facebook_url: siteSettings?.facebook_url || '',
      instagram_url: siteSettings?.instagram_url || '',
      twitter_url: siteSettings?.twitter_url || '',
      youtube_url: siteSettings?.youtube_url || '',
      tiktok_url: siteSettings?.tiktok_url || '',
      whatsapp_url: siteSettings?.whatsapp_url || '',
      privacy_policy: siteSettings?.privacy_policy || getDefaultPrivacyPolicy(siteSettings?.contact_email || 'giverrecords@gmail.com'),
      terms_of_service: siteSettings?.terms_of_service || getDefaultTermsOfService(siteSettings?.contact_email || 'giverrecords@gmail.com')
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
        favicon_url: formState.favicon_url.trim() || null,
        footer_copyright: formState.footer_copyright.trim() || null,
        footer_text: formState.footer_text.trim() || null,
        contact_email: formState.contact_email.trim() || null,
        phone_number: formState.phone_number.trim() || null,
        facebook_url: formState.facebook_url.trim() || null,
        instagram_url: formState.instagram_url.trim() || null,
        twitter_url: formState.twitter_url.trim() || null,
        youtube_url: formState.youtube_url.trim() || null,
        tiktok_url: formState.tiktok_url.trim() || null,
        whatsapp_url: formState.whatsapp_url.trim() || null,
        privacy_policy: formState.privacy_policy.trim() || null,
        terms_of_service: formState.terms_of_service.trim() || null
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

              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Textarea
                  id="footer-text"
                  className="bg-background"
                  value={formState.footer_text}
                  onChange={(e) => setFormState((prev) => ({ ...prev, footer_text: e.target.value }))}
                  rows={2}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-copyright">Footer Copyright</Label>
                <Input
                  id="footer-copyright"
                  className="bg-background"
                  value={formState.footer_copyright}
                  onChange={(e) => setFormState((prev) => ({ ...prev, footer_copyright: e.target.value }))}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    className="bg-background"
                    value={formState.contact_email}
                    onChange={(e) => setFormState((prev) => ({ ...prev, contact_email: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    className="bg-background"
                    value={formState.phone_number}
                    onChange={(e) => setFormState((prev) => ({ ...prev, phone_number: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="facebook-url">Facebook URL</Label>
                  <Input
                    id="facebook-url"
                    className="bg-background"
                    value={formState.facebook_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, facebook_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram-url">Instagram URL</Label>
                  <Input
                    id="instagram-url"
                    className="bg-background"
                    value={formState.instagram_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, instagram_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="twitter-url">Twitter/X URL</Label>
                  <Input
                    id="twitter-url"
                    className="bg-background"
                    value={formState.twitter_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, twitter_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    className="bg-background"
                    value={formState.youtube_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, youtube_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tiktok-url">TikTok URL</Label>
                  <Input
                    id="tiktok-url"
                    className="bg-background"
                    value={formState.tiktok_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, tiktok_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-url">WhatsApp URL</Label>
                  <Input
                    id="whatsapp-url"
                    className="bg-background"
                    value={formState.whatsapp_url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, whatsapp_url: e.target.value }))}
                    disabled={isLoading || isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Privacy Policy Content</Label>
                <Textarea
                  id="privacy-policy"
                  className="bg-background min-h-[280px]"
                  value={formState.privacy_policy}
                  onChange={(e) => setFormState((prev) => ({ ...prev, privacy_policy: e.target.value }))}
                  rows={14}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms-of-service">Terms of Service Content</Label>
                <Textarea
                  id="terms-of-service"
                  className="bg-background min-h-[280px]"
                  value={formState.terms_of_service}
                  onChange={(e) => setFormState((prev) => ({ ...prev, terms_of_service: e.target.value }))}
                  rows={14}
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
