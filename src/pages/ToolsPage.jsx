
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ToolCard from '@/components/ToolCard.jsx';
import ToolsModal from '@/components/ToolsModal.jsx';
import { TOOLS_DATA } from '@/components/FreeToolsSection.jsx';
import { trackEvent } from '@/lib/analytics.js';

const ToolsPage = () => {
  const [activeTool, setActiveTool] = useState(null);

  const openTool = (tool) => {
    trackEvent('tool_usage', {
      tool_id: tool?.id,
      tool_name: tool?.title || tool?.name || 'unknown'
    });
    setActiveTool(tool);
  };

  // Group tools by spotlight priority to structure the grid elegantly
  const topFeatured = TOOLS_DATA.slice(0, 2);
  const bottomRow = TOOLS_DATA.slice(2);

  return (
    <>
      <Helmet>
        <title>Free Music Tools For Giver Recording Studio</title>
        <meta name="description" content="Access free browser-based audio tools for producers and artists including BPM detection, vocal removal, and format conversion." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-20 relative overflow-hidden bg-secondary/30 border-b border-border">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
                STUDIO <span className="text-primary">UTILITIES</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
                A suite of professional audio tools right in your browser. All files are processed securely and deleted automatically.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Spotlight Tools - 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topFeatured.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ToolCard 
                      {...tool} 
                      onClick={() => openTool(tool)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Remaining Tools - 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bottomRow.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  >
                    <ToolCard 
                      {...tool} 
                      onClick={() => openTool(tool)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <ToolsModal 
        isOpen={!!activeTool} 
        onClose={() => setActiveTool(null)} 
        activeTool={activeTool} 
      />
    </>
  );
};

export default ToolsPage;
