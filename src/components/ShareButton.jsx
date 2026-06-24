
import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Send, Link as LinkIcon, Music2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const ShareButton = ({
  title,
  category,
  url,
  text,
  variant = 'outline',
  size = 'icon',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || `Check out "${title}" by Giver Recording Studio - ${category || 'Premium'} track.`;
  const hashtags = `GiverRecordingStudio,Beats${category ? `,${category.replace(/\s+/g, '')}` : ''}`;
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    if (canUseNativeShare) {
      try {
        await navigator.share({
          title: `${title} | Giver Recording Studio`,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyLink = async () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
    setIsOpen(false);
  };

  const copyForTikTok = async () => {
    await copyLink();
    window.open('https://www.tiktok.com', '_blank', 'noopener,noreferrer');
    toast.success('Link copied. Paste it in your TikTok caption or bio.');
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
  };

  const openWindow = (targetUrl) => {
    window.open(targetUrl, '_blank', 'width=660,height=520,noopener,noreferrer');
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
            if (canUseNativeShare && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
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
      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl rounded-xl p-2">
        {canUseNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer hover:bg-secondary focus:bg-secondary rounded-lg mb-1 py-2">
            <Smartphone className="w-4 h-4 mr-2 text-primary" />
            <span>Share via device</span>
          </DropdownMenuItem>
        )}
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
        <DropdownMenuItem onClick={copyForTikTok} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
          <Music2 className="w-4 h-4 mr-2" />
          <span>TikTok</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
