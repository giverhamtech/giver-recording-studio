
import React from 'react';
import ShareButton from './ShareButton.jsx';

const BeatShareButton = ({ beat, variant = "outline", size = "icon", className = "" }) => {
  const shareSlug = beat?.slug || beat?.id;
  const isProductionRoute = typeof beat?.shareRoute === 'string' ? beat.shareRoute === 'production' : false;
  const routePrefix = 'beat';
  const shareUrl = typeof window !== 'undefined' && shareSlug
    ? (isProductionRoute ? window.location.href : `${window.location.origin}/${routePrefix}/${shareSlug}`)
    : (typeof window !== 'undefined' ? window.location.href : '');

  const shareTitle = beat?.title || 'Track';
  const shareCategory = beat?.category || beat?.genre || (isProductionRoute ? 'Production' : 'Beat');
  const shareText = `Check out "${shareTitle}" by ${beat?.artist || 'Giver Recording Studio'} on Giver Recording Studio.`;

  return (
    <div onClick={e => e.stopPropagation()}>
      <ShareButton
        title={shareTitle}
        category={shareCategory}
        text={shareText}
        url={shareUrl}
        variant={variant}
        size={size}
        className={className}
      />
    </div>
  );
};

export default BeatShareButton;
