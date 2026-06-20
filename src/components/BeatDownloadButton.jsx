
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';
import { toast } from 'sonner';

const BeatDownloadButton = ({ beat, variant = "default", size = "default", className = "" }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const incrementDownloadCount = async () => {
    try {
      if (!beat?.id) return;
      const { data: song, error: readErr } = await supabase
        .from('songs')
        .select('downloadCount')
        .eq('id', beat.id)
        .maybeSingle();

      if (readErr) return;
      if (typeof song?.downloadCount !== 'number') return;

      await supabase
        .from('songs')
        .update({ downloadCount: song.downloadCount + 1 })
        .eq('id', beat.id);
    } catch (error) {
      console.warn('Download count increment skipped (permission denied or network issue).');
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const audioPath = beat?.audioFile || beat?.mp3_file;
    const fileUrl = beat?.url || (audioPath ? getPublicStorageUrl({ bucket: 'song-files', path: audioPath }) : null);

    if (!fileUrl) {
      toast.error('No audio file available for download.');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      const safeTitle = (beat.title || 'track').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle}_giver_recording_studio.mp3`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      
      incrementDownloadCount();
      
      toast.success('Download started successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download the beat. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handleDownload}
      disabled={isDownloading || (!beat?.audioFile && !beat?.mp3_file && !beat?.url)}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 md:mr-2" />
      )}
      <span className="hidden md:inline">Download</span>
    </Button>
  );
};

export default BeatDownloadButton;
