
import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Send, Link as LinkIcon, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const ShareButton = ({ title, category, url, variant = "outline", size = "icon", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `Check out "${title}" by Giver Recording Studio - ${category || 'Premium'} beat!`;
  const hashtags = `GiverRecordingStudio,Beats${category ? `,${category.replace(/\s+/g, '')}` : ''}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Giver Recording Studio`,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          setIsOpen(true); // Fallback to menu if native share fails
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
    setIsOpen(false);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
  };

  const openWindow = (url) => {
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className} 
          onClick={(e) => {
            e.preventDefault();
            // On mobile devices, prefer native share
            if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
              handleNativeShare();
            } else {
              setIsOpen(true);
            }
          }}
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl">
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
          <LinkIcon className="w-4 h-4 mr-2" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWindow(shareLinks.whatsapp)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
          <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWindow(shareLinks.twitter)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
          <Twitter className="w-4 h-4 mr-2 text-[#1DA1F2]" />
          <span>X / Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWindow(shareLinks.facebook)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
          <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWindow(shareLinks.telegram)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
          <Send className="w-4 h-4 mr-2 text-[#0088cc]" />
          <span>Telegram</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
