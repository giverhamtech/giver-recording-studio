
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

const FeaturedToggle = ({ isFeatured, onChange, disabled = false, className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 bg-secondary/50 p-3 rounded-lg border border-border ${className}`}>
      <Switch
        id="featured-toggle"
        checked={isFeatured}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-primary"
      />
      <Label 
        htmlFor="featured-toggle" 
        className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground"
      >
        <Star className={`w-4 h-4 ${isFeatured ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
        Mark as Featured
      </Label>
    </div>
  );
};

export default FeaturedToggle;
