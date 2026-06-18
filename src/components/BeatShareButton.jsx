
import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Link as LinkIcon, Instagram, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const BeatShareButton = ({ beat, variant = "outline", size = "icon", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/beat/${beat.slug || beat.id}` : '';
  const shareText = `Check out "${beat.title}" by ${beat.artist || 'Giver Recording Studio'}!`;

  const handleNativeShare = async (e) => {
    e.stopPropagation();
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `${beat.title} | Giver Recording Studio`,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyLink = (e, platform = null) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    if (platform) {
      toast.success(`Link copied for your ${platform} bio!`);
    } else {
      toast.success("Link copied to clipboard!");
    }
    setIsOpen(false);
  };

  const openWindow = (e, url) => {
    e.stopPropagation();
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className={className} 
            onClick={handleNativeShare}
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl rounded-xl p-2">
          <DropdownMenuItem onClick={copyLink} className="cursor-pointer hover:bg-secondary rounded-lg mb-1 py-2">
            <LinkIcon className="w-4 h-4 mr-3" />
            <span className="font-medium">Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => openWindow(e, shareLinks.whatsapp)} className="cursor-pointer hover:bg-secondary rounded-lg mb-1 py-2">
            <MessageCircle className="w-4 h-4 mr-3 text-[#25D366]" />
            <span className="font-medium">WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => openWindow(e, shareLinks.facebook)} className="cursor-pointer hover:bg-secondary rounded-lg mb-1 py-2">
            <Facebook className="w-4 h-4 mr-3 text-[#1877F2]" />
            <span className="font-medium">Facebook</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => openWindow(e, shareLinks.twitter)} className="cursor-pointer hover:bg-secondary rounded-lg mb-1 py-2">
            <Twitter className="w-4 h-4 mr-3 text-foreground" />
            <span className="font-medium">X / Twitter</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => copyLink(e, 'Instagram')} className="cursor-pointer hover:bg-secondary rounded-lg mb-1 py-2">
            <Instagram className="w-4 h-4 mr-3 text-[#E1306C]" />
            <span className="font-medium">Instagram</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => copyLink(e, 'TikTok')} className="cursor-pointer hover:bg-secondary rounded-lg py-2">
            <Music2 className="w-4 h-4 mr-3 text-foreground" />
            <span className="font-medium">TikTok</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BeatShareButton;
