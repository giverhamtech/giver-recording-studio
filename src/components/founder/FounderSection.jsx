import React from 'react';
import { motion } from 'framer-motion';
import FounderImage from './FounderImage.jsx';
import FounderBio from './FounderBio.jsx';
import useFounderProfile from '@/hooks/useFounderProfile.js';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';

const FounderSection = () => {
  const { profile, getImageUrl, isLoading } = useFounderProfile();
  const { siteSettings } = useSiteSettings();

  // Show a loading skeleton or a subtle empty state if loading initially without data
  if (isLoading && !profile) {
    return (
      <section className="py-24 bg-[#0A0A0A] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="aspect-[3/4] w-full max-w-md mx-auto lg:mx-0 rounded-[2rem] bg-white/5 animate-pulse" />
            <div className="space-y-6">
              <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-16 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-[#00D9FF]/10 rounded animate-pulse" />
              <div className="space-y-3 mt-8">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="py-24 bg-[#0A0A0A] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Founder Profile Not Configured</h2>
            <p className="text-white/70">
              Add founder profile details in admin to show this section on the public website.
            </p>
            {siteSettings?.site_name ? (
              <p className="text-white/40 text-sm mt-3">{siteSettings.site_name}</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[#0A0A0A] border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <FounderImage 
              imageUrl={getImageUrl()} 
              altText={profile.founderName} 
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <FounderBio profile={profile} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
