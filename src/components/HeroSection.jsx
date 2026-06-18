import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from './AnimatedBackground.jsx';
const HeroSection = () => {
  return <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1675292310383-0f4ef53fa3ab" alt="Professional recording studio" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
      </div>

      {/* Animated Elements */}
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        ease: "easeOut"
      }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase">ON THE BEAT IT'S GIVER</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground mb-6 leading-tight tracking-tighter">
            ELEVATE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">SONIC VISION</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Industry standard beats, professional mixing, and mastering. Join the next generation of chart topping artists.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/beats">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all hover:scale-105">
                <PlayCircle className="w-5 h-5 mr-2" />
                Browse Beats
              </Button>
            </Link>
            <Link to="/submit">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-primary/50 hover:bg-primary/10 transition-all hover:scale-105">
                <Upload className="w-5 h-5 mr-2" />
                Submit Music
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default HeroSection;
