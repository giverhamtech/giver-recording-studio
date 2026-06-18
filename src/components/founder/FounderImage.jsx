
import React from 'react';

const FounderImage = ({ imageUrl, altText }) => {
  return (
    <div className="relative group w-full max-w-md mx-auto lg:mx-0">
      {/* Decorative background element for premium feel */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#00D9FF]/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl rounded-[3rem] transition-all duration-700 pointer-events-none" />
      
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 bg-[#111]">
        <img
          src={imageUrl}
          alt={altText || "Founder Portrait"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none" />
      </div>
    </div>
  );
};

export default FounderImage;
