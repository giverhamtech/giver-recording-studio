
import React from 'react';
import { Award } from 'lucide-react';
import SocialMediaLinks from './SocialMediaLinks.jsx';

const FounderBio = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-4">
        <h2 className="text-[#00D9FF] text-sm font-bold tracking-widest uppercase mb-2">
          Meet the Founder
        </h2>
        <p className="text-white/60 text-lg md:text-xl font-medium mb-6">
          The Producer Behind Giver Recording Studio
        </p>
        <h3 className="text-4xl md:text-6xl font-extrabold text-white leading-tight" style={{ letterSpacing: '-0.03em' }}>
          {profile.founderName || 'ADELAJA M HASSAN'}
        </h3>
      </div>

      <div className="mb-8">
        <p className="text-xl md:text-2xl font-medium text-[#00D9FF]">
          {profile.professions || 'Music Producer, Crypto Trader, Metro Journalist'}
        </p>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#00D9FF]/10 border border-[#00D9FF]/20 text-[#00D9FF] px-4 py-2 rounded-lg font-medium text-sm">
          <Award className="w-4 h-4" />
          <span>{profile.experience || '8 Years of Experience in Mixing and Mastering'}</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-white/70 text-lg leading-relaxed mb-6">
          {profile.biography || "I am Adelaja M Hassan, a passionate music producer and mixing engineer with an ear for detail. My journey started nearly a decade ago, navigating through the evolving landscapes of both the music industry and digital finance."}
        </p>
      </div>

      <SocialMediaLinks 
        instagram={profile.instagramUrl} 
        tiktok={profile.tiktokUrl} 
        twitter={profile.twitterUrl} 
      />
    </div>
  );
};

export default FounderBio;
