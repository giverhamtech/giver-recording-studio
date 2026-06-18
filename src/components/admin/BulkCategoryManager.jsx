
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

const BulkCategoryManager = ({ categories }) => {
  return (
    <Card className="bg-card border-border mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Layers className="w-5 h-5 text-teal-500" />
          Bulk Image Management
        </CardTitle>
        <CardDescription>
          Quickly view and update default artwork across all your genres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-2 group cursor-pointer">
              <div className="aspect-square rounded-lg overflow-hidden border border-border relative">
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-semibold text-foreground bg-secondary px-2 py-1 rounded">Edit</span>
                </div>
              </div>
              <p className="text-xs font-medium text-center text-foreground truncate px-1" title={cat.name}>{cat.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-between">
          <p className="text-sm text-foreground">Need to update multiple images? Use the individual cards below for precise control over metadata syncing.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkCategoryManager;
