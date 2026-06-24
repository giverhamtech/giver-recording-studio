import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from './AnimatedBackground.jsx';
const HeroSection = () => {
  return <section className="section-shell relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1675292310383-0f4ef53fa3ab" alt="Professional recording studio" className="w-full h-full object-cover opacity-35 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,hsl(var(--background)/0.92)_0%,hsl(var(--background)/0.74)_38%,hsl(var(--background)/0.94)_100%)]"></div>
      </div>

      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass-panel neon-outline rounded-[30px] px-6 py-12 md:px-12 md:py-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/12 border border-primary/25 text-primary mb-8 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-[0.17em] uppercase">On The Beat It Is Giver</span>
          </div>

          <h1 className="text-[2.2rem] sm:text-5xl md:text-7xl lg:text-[5.6rem] font-extrabold text-foreground mb-6 leading-[0.95] tracking-[-0.03em] text-left md:text-center">
            Sound Like
            <br />
            <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,hsl(var(--primary))_0%,hsl(var(--accent))_48%,hsl(var(--primary))_100%)]">
              Your Biggest Record
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/75 mb-10 max-w-3xl mx-auto leading-relaxed font-light text-left md:text-center">
            Studio-grade production, elite mixing, precision mastering, and standout beat selection built for serious artists in Lagos and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-start md:justify-center items-stretch sm:items-center">
            <Link to="/beats">
              <Button size="lg" className="premium-button w-full sm:w-auto h-14 px-8 text-base md:text-lg">
                <PlayCircle className="w-5 h-5 mr-2" />
                Browse Beats
              </Button>
            </Link>
            <Link to="/submit">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base md:text-lg font-semibold border-primary/45 hover:bg-primary/10 transition-all">
                <Upload className="w-5 h-5 mr-2" />
                Submit Music
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center gap-5 text-sm text-foreground/75">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Premium studio workflow
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Instant preview and sharing
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Lagos, Nigeria
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default HeroSection;
