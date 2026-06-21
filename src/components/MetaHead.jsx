
import React from 'react';
import { Helmet } from 'react-helmet';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';

const MetaHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  schemaData = null 
}) => {
  const { siteSettings } = useSiteSettings();

  // Canonical metadata defaults (used when page doesn't provide overrides)
  const canonicalTitle = 'Giver Recording Studio';
  const canonicalDescription = 'Professional music production, recording, mixing, and mastering services in Lagos, Nigeria.';
  const canonicalUrl = 'https://www.giverrecords.com';
  const canonicalImage = 'https://www.giverrecords.com/og-image.jpg';

  const siteName = siteSettings?.site_name || canonicalTitle;
  const defaultTitle = canonicalTitle;
  const defaultDesc = canonicalDescription;
  const defaultKeywords = 'beats, recording studio, music production, afrobeat, trap, amapiano, instrumental';

  // Requirement: use site logo or hero image.
  // We prefer the configured site logo, otherwise fall back to the canonical OG image.
  const defaultImage = siteSettings?.logo_url || canonicalImage;

  // Title/description can be overridden per-page.
  // If overridden, keep the exact user-provided title (no extra suffix) to satisfy OG/Twitter requirements.
  const finalTitle = title || defaultTitle;
  const finalDesc = description || defaultDesc;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;

  // If a page passes `url`, use it; otherwise use the current location.
  // For canonical requirement we set a stable default to https://www.giverrecords.com.
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : canonicalUrl);


  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:creator" content="@GIVERRECORDS" />

      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default MetaHead;
