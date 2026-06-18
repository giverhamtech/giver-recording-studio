import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Music2, Mic2, Sliders, Wand2, ListMusic, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pb from '@/lib/firebaseClient';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const iconMap = {
    'Music2': Music2,
    'Mic2': Mic2,
    'Sliders': Sliders,
    'Wand2': Wand2,
    'ListMusic': ListMusic,
    'Sparkles': Sparkles
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const records = await pb.collection('services').getFullList({ $autoCancel: false });
        setServices(records);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <>
      <Helmet>
        <title>Services - Giver Recording Studio</title>
        <meta name="description" content="Professional music production services including recording, mixing, mastering, vocal editing, and custom beats." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-20 bg-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
                Our services
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Professional music production services tailored to bring your creative vision to life
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const IconComponent = iconMap[service.icon] || Music2;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border h-full hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <IconComponent className="w-12 h-12 text-primary mb-4" />
                          <CardTitle className="text-card-foreground">{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-card-foreground/80">
                            {service.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 bg-secondary rounded-2xl p-8 md:p-12 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                Ready to start your project?
              </h2>
              <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
                Book a session or contact us to discuss your music production needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking">
                  <Button size="lg">
                    Book a Session
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ServicesPage;
