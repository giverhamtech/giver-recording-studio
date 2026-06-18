
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Image as ImageIcon, Trash2, Star } from 'lucide-react';

const CategoryCard = ({ category, onEditName, onUpdateImage, onDelete }) => {
  return (
    <Card className="bg-card border-border overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 bg-muted w-full overflow-hidden">
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-teal-600 hover:bg-teal-700 text-white border-none shadow-md"
            onClick={() => onUpdateImage(category)}
          >
            <ImageIcon className="w-4 h-4 mr-2" /> Replace Image
          </Button>
        </div>
        {category.isDefault && (
          <Badge className="absolute top-3 right-3 bg-teal-600 text-white border-none shadow-md">
            <Star className="w-3 h-3 mr-1 fill-current" /> Default
          </Badge>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{category.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
              Active Category
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-border text-foreground hover:bg-secondary hover:text-teal-600 transition-colors"
            onClick={() => onEditName(category)}
          >
            <Edit2 className="w-4 h-4 mr-2" /> Rename
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-none border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => onDelete(category)}
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
