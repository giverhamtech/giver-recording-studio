import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Instagram, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'giverrecords@gmail.com',
      link: 'mailto:giverrecords@gmail.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+234 807 538 8856',
      link: 'tel:+2348075388856'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+234 807 538 8856',
      link: 'https://wa.me/2348075388856'
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: '@giverrecords',
      link: 'https://instagram.com/giverrecords'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await pb.collection('contact_messages').create(formData, { $autoCancel: false });
      toast.success('Message sent successfully');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Giver Recording Studio</title>
        <meta name="description" content="Get in touch with Giver Recording Studio. Email, phone, WhatsApp, and Instagram contact information." />
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
                Get in touch
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Have questions or ready to start your project? We'd love to hear from you
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-background text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-background text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          required
                          className="bg-background text-foreground"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">Contact information</h2>
                <div className="space-y-4 mb-8">
                  {contactMethods.map((method, index) => (
                    <motion.div
                      key={method.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    >
                      <a
                        href={method.link}
                        target={method.link.startsWith('http') ? '_blank' : undefined}
                        rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block"
                      >
                        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <method.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-card-foreground/60 mb-1">{method.title}</p>
                              <p className="font-medium text-card-foreground">{method.value}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </motion.div>
                  ))}
                </div>

                <Card className="bg-secondary border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Business Information</h3>
                        <p className="text-sm text-foreground/80">
                          Registration Number: 9481212
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/60">
                      Professional recording studio services in Nigeria
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;