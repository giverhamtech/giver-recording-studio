
import React from 'react';
import { Instagram, Music, Twitter } from 'lucide-react';

const SocialMediaLinks = ({ instagram, tiktok, twitter }) => {
  return (
    <div className="flex items-center gap-6 mt-8">
      {instagram && (
        <a 
          href={instagram} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-[#00D9FF]/50 hover:bg-[#00D9FF]/10 transition-all duration-300"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] group-hover:scale-110 transition-all duration-300" />
        </a>
      )}
      {tiktok && (
        <a 
          href={tiktok} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-[#00D9FF]/50 hover:bg-[#00D9FF]/10 transition-all duration-300"
          aria-label="TikTok"
        >
          <Music className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] group-hover:scale-110 transition-all duration-300" />
        </a>
      )}
      {twitter && (
        <a 
          href={twitter} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-[#00D9FF]/50 hover:bg-[#00D9FF]/10 transition-all duration-300"
          aria-label="Twitter"
        >
          <Twitter className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] group-hover:scale-110 transition-all duration-300" />
        </a>
      )}
    </div>
  );
};

export default SocialMediaLinks;
