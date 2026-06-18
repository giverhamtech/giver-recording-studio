
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Users, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FounderSection from '@/components/founder/FounderSection.jsx';

const AboutPage = () => {
  const values = [{
    icon: Award,
    title: 'Excellence',
    description: 'We maintain the highest standards in every project we undertake'
  }, {
    icon: Users,
    title: 'Collaboration',
    description: 'Working closely with artists to bring their vision to life'
  }, {
    icon: Target,
    title: 'Precision',
    description: 'Attention to detail in every mix, master, and production'
  }, {
    icon: Zap,
    title: 'Innovation',
    description: 'Staying ahead with the latest production techniques and technology'
  }];

  return (
    <>
      <Helmet>
        <title>About Us - Giver Recording Studio</title>
        <meta name="description" content="Learn about Giver Recording Studio's mission, values, and commitment to professional music production in Nigeria." />
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
                About Giver Recording Studio
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                We are a professional recording studio dedicated to helping artists create exceptional music. With state-of-the-art equipment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* New Founder Section */}
        <FounderSection />

        {/* Existing Story Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
                  Our story
                </h2>
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p>
                    Giver Recording Studio was founded in 2013 with a simple mission: to provide artists with access to professional-grade recording facilities and expert production services. We believe that great music deserves great sound.
                  </p>
                  <p>
                    Over the years, we've worked with countless artists across multiple genres, from Afrobeat to Gospel, helping them achieve their sonic goals. Our team combines technical expertise with creative insight to deliver results that exceed expectations.
                  </p>
                  <p>
                    Today, we continue to invest in the latest technology and training to ensure our clients receive the best possible service. Whether you're recording your first track or your hundredth, we're here to make it sound incredible.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center" style={{ letterSpacing: '-0.02em' }}>
                Our values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <motion.div 
                    key={value.title} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-border h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                        <value.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-card-foreground mb-2">
                          {value.title}
                        </h3>
                        <p className="text-sm text-card-foreground/80">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.6 }} 
              className="bg-secondary rounded-2xl p-8 md:p-12 text-center border border-border"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                Our mission
              </h2>
              <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                To empower artists with professional recording services and production tools that help them create music that resonates with audiences worldwide. We're committed to excellence, innovation, and supporting the growth of Nigeria's music industry.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
