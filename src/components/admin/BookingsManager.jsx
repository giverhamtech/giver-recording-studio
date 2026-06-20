import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase.js';
import { toast } from 'sonner';
import { CalendarCheck2, Loader2, Trash2 } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
};

const getStatusBadge = (status) => {
  if (status === 'confirmed') return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Confirmed</Badge>;
  if (status === 'completed') return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Completed</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
};

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Bookings fetch error:', error);
      toast.error('Failed to load booking requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      setBookings((prev) => prev.map((booking) => (booking.id === id ? (data || { ...booking, status }) : booking)));
      toast.success(`Booking marked as ${status}`);
    } catch (error) {
      console.error('Booking update error:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking request permanently?')) return;
    try {
      setIsUpdating(true);
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      toast.success('Booking deleted');
    } catch (error) {
      console.error('Booking delete error:', error);
      toast.error('Failed to delete booking');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle>Booking Requests</CardTitle>
        <CardDescription>Track client booking requests and progress statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <CalendarCheck2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No booking requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = String(booking.status || 'pending').toLowerCase();
              const clientName = booking.client_name || booking.name || 'Unknown Client';
              return (
                <div key={booking.id} className="p-4 border border-border rounded-xl bg-background/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{clientName}</h4>
                      <p className="text-sm text-muted-foreground">{booking.email} • {booking.phone || 'No phone'}</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        Preferred: {booking.preferred_date || 'Not specified'} • {booking.service_type || 'General booking'}
                      </p>
                      <p className="text-xs text-muted-foreground/80">{formatDate(booking.created_at)}</p>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <p className="text-sm text-foreground/90 mt-3 whitespace-pre-wrap">{booking.message || 'No notes provided.'}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <div className="w-52">
                      <Select value={status} onValueChange={(value) => updateStatus(booking.id, value)} disabled={isUpdating}>
                        <SelectTrigger className="bg-background border-border h-8">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isUpdating}
                      onClick={() => deleteBooking(booking.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsManager;
