import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase.js';
import { toast } from 'sonner';
import { Loader2, Mail, Trash2 } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
};

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code === 'PGRST205') {
          setMessages([]);
          toast.error('Contact messages table is missing. Run the Supabase migration first.');
          return;
        }
        throw error;
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Messages fetch error:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      console.log('Update response:', data);
      setMessages((prev) => prev.map((msg) => (msg.id === id ? (data || { ...msg, status }) : msg)));
      toast.success(`Message marked as ${status}`);
      await fetchMessages();
    } catch (error) {
      console.log('Error:', error);
      console.error('Message status error:', error);
      toast.error('Failed to update message status');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      setIsUpdating(true);
      const { data: deleteData, error } = await supabase.from('contact_messages').delete().eq('id', id).select('*').maybeSingle();
      if (error) throw error;
      console.log('Delete response:', deleteData);
      toast.success('Message deleted');
      await fetchMessages();
    } catch (error) {
      console.log('Error:', error);
      console.error('Message delete error:', error);
      toast.error('Failed to delete message');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle>Contact Messages</CardTitle>
        <CardDescription>Review incoming contact form submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No contact messages yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const status = String(msg.status || 'unread').toLowerCase();
              return (
                <div key={msg.id} className="p-4 border border-border rounded-xl bg-background/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{msg.subject || 'No subject'}</h4>
                      <p className="text-sm text-muted-foreground">{msg.name} • {msg.email}</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">{formatDate(msg.created_at)}</p>
                    </div>
                    <Badge variant={status === 'read' ? 'secondary' : 'default'}>{status === 'read' ? 'Read' : 'Unread'}</Badge>
                  </div>

                  <p className="text-sm text-foreground/90 mt-3 whitespace-pre-wrap">{msg.message}</p>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating || status === 'read'}
                      onClick={() => updateStatus(msg.id, 'read')}
                      className="border-border hover:bg-secondary"
                    >
                      Mark Read
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating || status === 'unread'}
                      onClick={() => updateStatus(msg.id, 'unread')}
                      className="border-border hover:bg-secondary"
                    >
                      Mark Unread
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isUpdating}
                      onClick={() => deleteMessage(msg.id)}
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

export default MessagesManager;
