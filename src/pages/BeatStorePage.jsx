import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BeatCard from '@/components/BeatCard.jsx';
import CustomBeatForm from '@/components/CustomBeatForm.jsx';
import pb from '@/lib/firebaseClient.js';
import { getCategoriesList, getCategoryImagesMap } from '@/config/beatCategories.js';
import { motion } from 'framer-motion';
import MetaHead from '@/components/MetaHead.jsx';

const BeatStorePage = () => {
  const [beats, setBeats] = useState([]);
  const [filteredBeats, setFilteredBeats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const categoriesList = getCategoriesList();
  const CATEGORY_IMAGES = getCategoryImagesMap();
  const categories = ['All', ...categoriesList.filter(c => c !== 'Artist Submissions')];

  const fetchBeats = async () => {
    try {
      const records = await pb.collection('beats').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setBeats(records);
      
      if (selectedCategory === 'All') {
        setFilteredBeats(records);
      } else {
        setFilteredBeats(records.filter(beat => beat.category === selectedCategory));
      }
    } catch (error) {
      console.error('Failed to fetch beats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeats();

    pb.collection('beats').subscribe('*', () => {
      fetchBeats();
    });

    return () => {
      pb.collection('beats').unsubscribe('*');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredBeats(beats);
    } else {
      setFilteredBeats(beats.filter(beat => beat.category === selectedCategory));
    }
  }, [selectedCategory, beats]);

  const currentPlaylist = filteredBeats
    .filter(b => b.mp3_file)
    .map(b => ({
      id: b.id,
      title: b.title,
      artist: 'Giver Recording Studio',
      category: b.category,
      artwork: b.categoryImage || CATEGORY_IMAGES[b.category] || CATEGORY_IMAGES['Instrumentals'],
      url: pb.files.getURL(b, b.mp3_file)
    }));

  return (
    <>
      <MetaHead 
        title="Beat Store"
        description="Browse and download professional free beats across Afrobeat, Amapiano, Trap, R&B, and more from Giver Recording Studio."
      />

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-20 bg-secondary/50 border-b border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
                  BEAT <span className="text-primary">STORE</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                  Download professional free beats or request a custom production tailored to your vision
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`transition-all duration-200 rounded-full px-6 ${selectedCategory === category ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)] border-transparent' : 'border-border hover:border-primary/50 text-foreground bg-card'}`}
                >
                  {category}
                </Button>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-card border-border overflow-hidden h-32 md:h-40 flex flex-row">
                    <div className="w-[35%] md:w-40 bg-muted animate-pulse h-full"></div>
                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
                        <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                      </div>
                      <div className="h-8 bg-muted animate-pulse rounded w-full mt-4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBeats.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBeats.map((beat, index) => (
                  <motion.div
                    key={beat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <BeatCard 
                      beat={{...beat, categoryImage: beat.categoryImage || CATEGORY_IMAGES[beat.category] || CATEGORY_IMAGES['Instrumentals']}}
                      playlist={currentPlaylist}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border max-w-2xl mx-auto">
                <p className="text-xl text-muted-foreground">No beats found in this category</p>
                <Button 
                  variant="outline" 
                  className="mt-6 border-border hover:bg-secondary"
                  onClick={() => setSelectedCategory('All')}
                >
                  View All Beats
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="py-24 bg-secondary/30 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <CustomBeatForm />

              <div className="space-y-6">
                <Card className="bg-card border-border h-full flex flex-col justify-center overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <MessageCircle className="w-32 h-32" />
                  </div>
                  <CardContent className="p-8 text-center relative z-10">
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Need help choosing?
                    </h3>
                    <p className="text-muted-foreground mb-8 text-lg">
                      Contact us on WhatsApp for personalized recommendations and custom beat consultations.
                    </p>
                    <a
                      href="https://wa.me/2348075388856"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat on WhatsApp
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BeatStorePage;
