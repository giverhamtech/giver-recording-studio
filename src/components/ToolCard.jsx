
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ToolCard = ({ icon: Icon, title, description, onClick, isFeatured = false }) => {
  return (
    <Card 
      onClick={onClick}
      className={`group relative bg-card border-border overflow-hidden cursor-pointer transition-all duration-300 hover:animate-[card-glow_0.3s_forwards] hover:-translate-y-1 h-full flex flex-col ${isFeatured ? 'md:col-span-2' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <CardContent className="p-8 flex flex-col h-full relative z-10">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        <h3 className="text-2xl font-bold text-card-foreground mb-3 tracking-tight">
          {title}
        </h3>
        
        <p className="text-muted-foreground font-light mb-8 flex-grow leading-relaxed">
          {description}
        </p>
        
        <div className="mt-auto">
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
