
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Music2, Headphones, Mic2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import FreeToolsSection from '@/components/FreeToolsSection.jsx';
import FeaturedBeatsSection from '@/components/FeaturedBeatsSection.jsx';

const HomePage = () => {
  const highlights = [
    {
      icon: Music2,
      title: 'Professional Production',
      description: 'State-of-the-art equipment and experienced producers'
    }, 
    {
      icon: Headphones,
      title: 'Premium Sound Quality',
      description: 'Industry-standard mixing and mastering services'
    }, 
    {
      icon: Mic2,
      title: 'Recording Sessions',
      description: 'Comfortable studio environment for your best performance'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Giver Recording Studio - Professional Music Production in Nigeria</title>
        <meta name="description" content="Premium recording studio offering music production, mixing, mastering, custom beats, and free audio tools for artists." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <HeroSection />

        <div className="section-separator" />

        <section className="section-shell py-20 md:py-24 bg-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.12),transparent_70%)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {highlights.map((highlight, index) => (
                <motion.div 
                  key={highlight.title} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="premium-card h-full group glass-panel">
                    <CardContent className="p-7 md:p-8 text-center">
                      <div className="w-16 h-16 mx-auto bg-primary/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <highlight.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-card-foreground mb-3 tracking-tight">
                        {highlight.title}
                      </h3>
                      <p className="text-card-foreground/70 font-light leading-relaxed">
                        {highlight.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <FeaturedBeatsSection />

  <div className="section-separator" />

        <FreeToolsSection />

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
