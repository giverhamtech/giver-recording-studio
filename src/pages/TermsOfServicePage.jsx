import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';
import { getDefaultTermsOfService } from '@/lib/legalDefaults.js';

const formatDate = (value) => {
  if (!value) return 'June 20, 2026';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'June 20, 2026';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const TermsOfServicePage = () => {
  const { siteSettings } = useSiteSettings();
  const contactEmail = siteSettings?.contact_email || 'giverrecords@gmail.com';
  const content = (siteSettings?.terms_of_service || '').trim() || getDefaultTermsOfService(contactEmail);
  const sections = content ? content.split(/\n\n+/).filter(Boolean) : [];
  const lastUpdated = formatDate(siteSettings?.updated_at);

  return (
    <>
      <Helmet>
        <title>Terms of Service - {siteSettings?.site_name || 'Giver Recording Studio'}</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">Terms of Service</CardTitle>
              <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {sections.length > 0 ? (
                sections.map((section, index) => (
                  <p key={index} className="text-foreground/90 leading-7 whitespace-pre-wrap">
                    {section}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">Content coming soon.</p>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfServicePage;
