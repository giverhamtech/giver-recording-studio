
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, MicOff, FileAudio as AudioWaveform, FileText, Settings2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ToolCard from './ToolCard.jsx';
import ToolsModal from './ToolsModal.jsx';

export const TOOLS_DATA = [
  {
    id: 'bpm-key',
    icon: Activity,
    title: 'BPM & Key Detector',
    description: 'Instantly find the tempo and musical key of any audio file or beat.',
    isHighlighted: true
  },
  {
    id: 'vocal-remover',
    icon: MicOff,
    title: 'AI Vocal Remover',
    description: 'Separate vocals from instrumentals with high precision for remixes and karaoke.',
    isHighlighted: true
  },
  {
    id: 'voice-converter',
    icon: AudioWaveform,
    title: 'Voice Converter',
    description: 'Transform vocals with pitch shifts and creative studio effects in real-time.',
    isHighlighted: false
  },
  {
    id: 'audio-to-lyrics',
    icon: FileText,
    title: 'Audio to Lyrics',
    description: 'Automatically transcribe vocals into text lyrics you can copy or download.',
    isHighlighted: false
  },
  {
    id: 'audio-converter',
    icon: Settings2,
    title: 'Format Converter',
    description: 'Quickly convert audio files between MP3, WAV, FLAC, AAC, and M4A.',
    isHighlighted: false
  }
];

const FreeToolsSection = () => {
  const [activeTool, setActiveTool] = useState(null);

  const priorityTools = TOOLS_DATA.filter(t => t.isHighlighted);
  const otherTools = TOOLS_DATA.filter(t => !t.isHighlighted);

  return (
    <>
      <section className="py-20 md:py-24 bg-background relative overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
          <img 
            src="https://images.unsplash.com/photo-1570338534384-8178168f05bc" 
            alt="Audio Waveform" 
            className="w-full h-full object-cover animate-waveform opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center gap-1 mb-6 h-12 items-end">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 bg-primary rounded-t-sm animate-equalizer-bars"
                    style={{ animationDelay: `${i * 0.1}s`, height: i % 2 === 0 ? '60%' : '100%' }}
                  ></div>
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-5 md:mb-6 tracking-tight px-2">
                FREE MUSIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">TOOLS</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-light mb-8 px-2 leading-7 sm:leading-8 break-words">
                Empowering artists and producers with browser-based tools. Process audio securely without leaving the page.
              </p>
              
              <Link to="/tools">
                <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border mx-auto">
                  Explore All Tools
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Spotlight Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {priorityTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ToolCard 
                  {...tool} 
                  onClick={() => setActiveTool(tool)}
                />
              </motion.div>
            ))}
          </div>

          {/* Other Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
              >
                <ToolCard 
                  {...tool} 
                  onClick={() => setActiveTool(tool)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ToolsModal 
        isOpen={!!activeTool} 
        onClose={() => setActiveTool(null)} 
        activeTool={activeTool} 
      />
    </>
  );
};

export default FreeToolsSection;
