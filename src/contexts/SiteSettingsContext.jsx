import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase.js';
import { getDefaultPrivacyPolicy, getDefaultTermsOfService } from '@/lib/legalDefaults.js';

const DEFAULT_SITE_SETTINGS = {
  id: 1,
  site_name: 'Giver Recording Studio',
  tagline: 'Professional music production',
  logo_url: null,
  favicon_url: '/vite.svg',
  footer_copyright: 'All Rights Reserved',
  footer_text: 'Professional music production, recording, and mixing services in Lagos, Nigeria.',
  contact_email: 'giverrecords@gmail.com',
  phone_number: '+2348075388856',
  facebook_url: '',
  instagram_url: 'https://instagram.com/giverrecords',
  twitter_url: 'https://x.com/giverham',
  youtube_url: '',
  tiktok_url: 'https://tiktok.com/@giverham',
  whatsapp_url: 'https://wa.me/2348075388856',
  privacy_policy: getDefaultPrivacyPolicy('giverrecords@gmail.com'),
  terms_of_service: getDefaultTermsOfService('giverrecords@gmail.com')
};

const SiteSettingsContext = createContext(null);

const normalizeSiteSettings = (row) => ({
  ...DEFAULT_SITE_SETTINGS,
  ...(row || {})
});

export const SiteSettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSiteSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setSiteSettings(normalizeSiteSettings(data));
    } catch (error) {
      console.error('[SiteSettings] Failed to fetch settings:', error);
      setSiteSettings(DEFAULT_SITE_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSiteSettings = useCallback(async (partialValues) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const payload = {
      id: 1,
      ...siteSettings,
      ...partialValues,
      updated_by: user?.id || null
    };

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const normalized = normalizeSiteSettings(data);
    setSiteSettings(normalized);
    return normalized;
  }, [siteSettings]);

  useEffect(() => {
    refreshSiteSettings();

    const channel = supabase
      .channel('public:site_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setSiteSettings(DEFAULT_SITE_SETTINGS);
            return;
          }

          setSiteSettings(normalizeSiteSettings(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshSiteSettings]);

  useEffect(() => {
    if (!siteSettings?.favicon_url || typeof document === 'undefined') {
      return;
    }

    const iconElement = document.querySelector("link[rel='icon']") || document.createElement('link');
    iconElement.setAttribute('rel', 'icon');
    iconElement.setAttribute('href', siteSettings.favicon_url);
    if (!iconElement.parentNode) {
      document.head.appendChild(iconElement);
    }
  }, [siteSettings?.favicon_url]);

  const value = useMemo(() => ({
    siteSettings,
    isLoading,
    refreshSiteSettings,
    saveSiteSettings
  }), [siteSettings, isLoading, refreshSiteSettings, saveSiteSettings]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
};
