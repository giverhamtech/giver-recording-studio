import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';

const BookingPage = () => {
  const bookingInfo = [
    {
      icon: Calendar,
      title: 'Flexible scheduling',
      description: 'Book sessions that fit your timeline'
    },
    {
      icon: Clock,
      title: 'Quick response',
      description: 'We typically respond within 24 hours'
    },
    {
      icon: MessageCircle,
      title: 'Direct communication',
      description: 'Discuss your project details with our team'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Book a Session - Giver Recording Studio</title>
        <meta name="description" content="Book a professional recording session at Giver Recording Studio. Flexible scheduling and expert production services." />
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
                Book a session
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Fill out the form below and we'll get back to you to confirm your booking
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {bookingInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border text-center h-full">
                    <CardContent className="p-6">
                      <info.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        {info.title}
                      </h3>
                      <p className="text-sm text-card-foreground/80">
                        {info.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <BookingForm />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-foreground/80 mb-4">
                Prefer to chat directly? Reach us on WhatsApp
              </p>
              <a
                href="https://wa.me/2348075388856"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">+234 807 538 8856</span>
              </a>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BookingPage;