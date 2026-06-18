
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import BPMKeyDetector from './tools/BPMKeyDetector.jsx';
import VocalRemover from './tools/VocalRemover.jsx';
import VoiceConverter from './tools/VoiceConverter.jsx';
import AudioToLyrics from './tools/AudioToLyrics.jsx';
import AudioConverter from './tools/AudioConverter.jsx';

const TOOL_COMPONENTS = {
  'bpm-key': BPMKeyDetector,
  'vocal-remover': VocalRemover,
  'voice-converter': VoiceConverter,
  'audio-to-lyrics': AudioToLyrics,
  'audio-converter': AudioConverter,
};

const ToolsModal = ({ isOpen, onClose, activeTool }) => {
  if (!activeTool) return null;

  const ActiveComponent = TOOL_COMPONENTS[activeTool.id];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border p-0 overflow-hidden shadow-[0_0_50px_hsl(var(--primary)/0.1)]">
        <DialogHeader className="p-6 pb-0 relative z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <activeTool.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">{activeTool.title}</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {activeTool.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          {ActiveComponent ? <ActiveComponent /> : <p className="text-muted-foreground">Tool interface loading...</p>}
        </div>
        
        <div className="bg-muted/30 p-4 text-center border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Files are processed securely in your browser and are automatically deleted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolsModal;
