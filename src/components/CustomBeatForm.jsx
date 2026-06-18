
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import pb from '@/lib/firebaseClient';
import { toast } from 'sonner';

const CustomBeatForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Basic duplicate detection for spam prevention
      const existing = await pb.collection('booking_requests').getList(1, 1, {
        filter: `email = "${formData.email}" && message = "${formData.message.replace(/"/g, '\\"')}"`,
        $autoCancel: false
      });

      if (existing.items.length > 0) {
        const proceed = window.confirm("You have already submitted an identical request. Do you want to submit it again?");
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }

      await pb.collection('booking_requests').create({
        ...formData,
        service_type: 'Custom Beat Request'
      }, { $autoCancel: false });

      toast.success('Request submitted successfully');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Request a Custom Beat</CardTitle>
        <CardDescription>
          Tell us about your vision and we'll create a unique beat for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-background text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Describe your vision</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about the style, mood, tempo, and any reference tracks..."
              className="bg-background text-foreground"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomBeatForm;
