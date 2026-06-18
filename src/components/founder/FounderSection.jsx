import React from 'react';
import { motion } from 'framer-motion';
import FounderImage from './FounderImage.jsx';
import FounderBio from './FounderBio.jsx';
import useFounderProfile from '@/hooks/useFounderProfile.js';

const FounderSection = () => {
  const { profile, getImageUrl, isLoading } = useFounderProfile();

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

  // Fallback data if no profile exists
  const displayProfile = profile || {
    founderName: 'ADELAJA M HASSAN',
    professions: 'Music Producer, Crypto Trader, Metro Journalist',
    experience: '8 Years of Experience in Mixing and Mastering',
    biography: 'I am Adelaja M Hassan, a passionate music producer and mixing engineer with an ear for detail. My journey started nearly a decade ago, navigating through the evolving landscapes of both the music industry and digital finance.',
    instagramUrl: 'https://instagram.com/giverham',
    tiktokUrl: 'https://tiktok.com/@giverham',
    twitterUrl: 'https://x.com/giverham'
  };

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
              altText={displayProfile.founderName} 
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <FounderBio profile={displayProfile} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;