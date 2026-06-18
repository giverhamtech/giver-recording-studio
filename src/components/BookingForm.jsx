import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/firebaseClient';
import { toast } from 'sonner';

const BookingForm = ({ onSuccess }) => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    preferred_date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const records = await pb.collection('services').getFullList({ $autoCancel: false });
        setServices(records);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServiceChange = (value) => {
    setFormData({
      ...formData,
      service_type: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await pb.collection('booking_requests').create(formData, { $autoCancel: false });
      toast.success('Booking request submitted successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        preferred_date: '',
        message: ''
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to submit booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Label htmlFor="service_type">Service Type</Label>
          <Select value={formData.service_type} onValueChange={handleServiceChange}>
            <SelectTrigger className="bg-background text-foreground">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="preferred_date">Preferred Date</Label>
          <Input
            id="preferred_date"
            name="preferred_date"
            type="date"
            value={formData.preferred_date}
            onChange={handleChange}
            className="bg-background text-foreground"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about your project..."
            className="bg-background text-foreground"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
      </Button>
    </form>
  );
};

export default BookingForm;
