
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
  const siteName = siteSettings?.site_name || 'Giver Recording Studio';
  const defaultTitle = `${siteName} - Premium Music Production`;
  const defaultDesc = "Download professional free beats, request custom productions, and explore top-tier mixing and mastering services in Nigeria.";
  const defaultKeywords = "beats, recording studio, music production, afrobeat, trap, amapiano, instrumental";
  const defaultImage = siteSettings?.logo_url || '/vite.svg';
  
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDesc = description || defaultDesc;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

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
