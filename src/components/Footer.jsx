import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Instagram, MessageCircle, Mail, Phone } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Giver Recording Studio</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Professional music production, recording, and mixing services in Lagos, Nigeria.
            </p>
            <p className="text-xs text-secondary-foreground/60">
              Business Registration NO: 9481212
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a href="mailto:giverrecords@gmail.com" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Mail className="w-4 h-4" />
                giverrecords@gmail.com
              </a>
              <a href="tel:+2348075388856" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Phone className="w-4 h-4" />
                +234 807 538 8856
              </a>
              <a href="https://wa.me/2348075388856" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="space-y-3">
              <a href="https://instagram.com/giverrecords" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Instagram className="w-4 h-4" />
                @giverrecords
              </a>
              <a href="https://instagram.com/giverham" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors duration-200">
                <Instagram className="w-4 h-4" />
                @giverham
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/60">
            © All Rights Reserved. Giver Recording Studio 2026
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
