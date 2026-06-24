
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ToolCard = ({ icon: Icon, title, description, onClick, isHighlighted = false }) => {
  return (
    <Card 
      onClick={onClick}
      className={`group relative bg-card border-border overflow-hidden cursor-pointer transition-all duration-300 hover:animate-[card-glow_0.3s_forwards] hover:-translate-y-1 h-full flex flex-col ${isHighlighted ? 'md:col-span-2' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full relative z-10 min-w-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors shrink-0 mx-auto md:mx-0">
          <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-3 tracking-tight text-center md:text-left break-words">
          {title}
        </h3>
        
        <p className="text-sm sm:text-base text-muted-foreground font-light mb-6 sm:mb-8 flex-grow leading-7 text-center md:text-left break-words min-w-0">
          {description}
        </p>
        
        <div className="mt-auto flex justify-center md:justify-start">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
          >
            Try Now
            <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
