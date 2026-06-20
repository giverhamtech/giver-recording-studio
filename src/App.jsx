
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.jsx';
import { PlaybackProvider } from './contexts/PlaybackContext.jsx';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PublicBeatsPage from './pages/PublicBeatsPage.jsx';
import SongPreviewPage from './pages/SongPreviewPage.jsx';
import ProductionsPage from './pages/ProductionsPage.jsx';
import ArtistSubmissionPage from './pages/ArtistSubmissionPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminSiteSettingsPage from './pages/AdminSiteSettingsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import StickyMiniPlayer from './components/StickyMiniPlayer.jsx';

function App() {

  return (
    <SiteSettingsProvider>
      <AuthProvider>
        <PlaybackProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/beats" element={<PublicBeatsPage />} />
              
              {/* New consolidated Song Preview Route mapping to slug */}
              <Route path="/beat/:slug" element={<SongPreviewPage />} />
              
              <Route path="/productions" element={<ProductionsPage />} />
              <Route path="/submit" element={<ArtistSubmissionPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/site-settings"
                element={
                  <ProtectedAdminRoute>
                    <AdminSiteSettingsPage />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
            <StickyMiniPlayer />
            <Toaster />
          </Router>
        </PlaybackProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}

export default App;
