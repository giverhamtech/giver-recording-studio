
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pb from '@/lib/firebaseClient.js';
import { toast } from 'sonner';

const BeatDownloadButton = ({ beat, variant = "default", size = "default", className = "" }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const incrementDownloadCount = async () => {
    try {
      // Attempt to increment in DB. Will silently fail if permissions don't allow public updates.
      await pb.collection('songs').update(beat.id, { "downloadCount+": 1 }, { $autoCancel: false });
    } catch (error) {
      console.warn("Download count increment skipped (permission denied or network issue).");
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!beat.audioFile) {
      toast.error('No audio file available for download.');
      return;
    }

    setIsDownloading(true);
    try {
      const fileUrl = pb.files.getURL(beat, beat.audioFile);
      
      // Fetch the file to bypass CORS issues on some direct downloads and force download prompt
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      // Sanitize title for filename
      const safeTitle = beat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle}_giver_recording_studio.mp3`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      
      // Update stats
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
      disabled={isDownloading || !beat.audioFile}
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
