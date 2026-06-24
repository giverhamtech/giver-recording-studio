import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Instagram, MessageCircle, Mail, Phone } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';

const Footer = () => {
  const { siteSettings } = useSiteSettings();
  const siteName = siteSettings?.site_name || 'Giver Recording Studio';
  const footerText = siteSettings?.footer_text || 'Professional music production, recording, and mixing services in Lagos, Nigeria.';
  const footerCopyright = siteSettings?.footer_copyright || '';
  const contactEmail = siteSettings?.contact_email || 'giverrecords@gmail.com';
  const phoneNumber = siteSettings?.phone_number || '+2348075388856';
  const whatsappUrl = siteSettings?.whatsapp_url || 'https://wa.me/2348075388856';
  const instagramUrl = siteSettings?.instagram_url || 'https://instagram.com/giverrecords';

  return <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">{siteName}</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              {footerText}
            </p>
            <p className="text-xs text-secondary-foreground/60">
              Business Registration NO: 3426996
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Mail className="w-4 h-4" />
                {contactEmail}
              </a>
              <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Phone className="w-4 h-4" />
                {phoneNumber}
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="space-y-3">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/60">
            {footerCopyright}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
