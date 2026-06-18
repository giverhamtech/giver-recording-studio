
import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { updateCategoryConfig, getCategoryConfig } from '@/config/beatCategories.js';
import { AuthProvider } from './contexts/AuthContext.jsx';
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
import StickyMiniPlayer from './components/StickyMiniPlayer.jsx';

function App() {
  
  useEffect(() => {
    // Left for legacy dynamic category setup if needed, though schema changes
    // shift primary data sources to DB categories
    const syncDynamicCategories = async () => {
      try {
        const records = await pb.collection('productions').getFullList({
          filter: 'genre="System_Category_Image"',
          $autoCancel: false
        });
        
        if (records.length > 0) {
          let config = getCategoryConfig();
          records.forEach(r => {
            const catName = r.title.replace(' Cover', '');
            const url = pb.files.getURL(r, r.coverImage);
            config = config.map(c => c.name === catName ? { ...c, imageUrl: url } : c);
          });
          updateCategoryConfig(config);
        }
      } catch (e) {
        // Silently ignore if fails to load dynamic images
      }
    };
    
    syncDynamicCategories();
  }, []);

  return (
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
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
          <StickyMiniPlayer />
          <Toaster />
        </Router>
      </PlaybackProvider>
    </AuthProvider>
  );
}

export default App;
