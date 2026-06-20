
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdminAuthenticated, logout } = useAuth();
  const { siteSettings } = useSiteSettings();
  const logoUrl = siteSettings?.logo_url || '/vite.svg';
  const siteName = siteSettings?.site_name || 'GIVER RECORDING STUDIO';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Beats', path: '/beats' },
    { name: 'My Productions', path: '/productions' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Tools', path: '/tools' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoUrl}
              alt="Giver Recording Studio Logo" 
              className="h-12 w-auto object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-bold text-foreground hidden sm:block tracking-tight">{siteName.toUpperCase()}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10 border border-primary/20 shadow-[0_0_10px_hsl(var(--primary)/0.1)]'
                    : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/submit">
              <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Submit Music
              </Button>
            </Link>
            {!isAdminAuthenticated ? (
              <Link to="/admin/login">
                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                  Admin Login
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                    Admin Dashboard
                  </Button>
                </Link>
                <Link to="/admin/site-settings">
                  <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                    Site Settings
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
                  Logout
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10 border border-primary/20'
                    : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <Link to="/submit" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full mb-2 bg-primary text-primary-foreground">
                  Submit Music
                </Button>
              </Link>
              {!isAdminAuthenticated ? (
                <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary">
                    Admin Login
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full mb-2 border-primary/50 text-primary">
                      Admin Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/site-settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full mb-2 border-primary/50 text-primary">
                      Site Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
