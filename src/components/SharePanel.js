import React, { useState } from 'react';
import './SharePanel.css';

const SharePanel = ({ onShare }) => {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Picapica Photo Strip',
          text: 'Check out my photo strip from Picapica Photo Booth!',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy link
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareUrl(url);
      setTimeout(() => setShareUrl(''), 2000);
    });
  };

  return (
    <div className="share-panel">
      <h3 className="panel-title">Share Your Photos</h3>
      
      <div className="share-options">
        <button 
          className="share-btn"
          onClick={handleShare}
          disabled={isGeneratingLink}
        >
          {isGeneratingLink ? 'Generating...' : '🔗 Share Link'}
        </button>

        {shareUrl && (
          <div className="share-feedback">
            Link copied to clipboard! ✨
          </div>
        )}
        
        <div className="share-socials">
          <button className="social-btn" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out my photo strip from Picapica Photo Booth!')}`, '_blank')}>
            Twitter
          </button>
          <button className="social-btn" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
            Facebook
          </button>
          <button className="social-btn" onClick={() => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(window.location.origin + '/assets/picapica-photostrip.png')}&description=${encodeURIComponent('My Picapica Photo Strip')}`, '_blank')}>
            Pinterest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePanel;