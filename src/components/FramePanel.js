import React from 'react';
import './FramePanel.css';

const FramePanel = ({ currentFrame, onFrameChange, onThemeScatter }) => {
  const frames = [
    { id: 'default', name: 'Classic', preview: '⬜', color: '#e5e7eb' },
    { id: 'colorful', name: 'Colorful', preview: '🌈', color: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)' },
    { id: 'elegant', name: 'Elegant', preview: '💎', color: '#8b5cf6' },
    { id: 'fun', name: 'Fun', preview: '🎉', color: '#f59e0b' },
    { id: 'vintage', name: 'Vintage', preview: '📜', color: '#92400e' }
  ];

  const stickers = [
    { id: 'girlypop', name: 'Girlypop', emoji: '💖' },
    { id: 'cute', name: 'Cute', emoji: '🥰' },
    { id: 'mofusand', name: 'Mofusand', emoji: '🐻' },
    { id: 'shinchan', name: 'Shin Chan', emoji: '👶' },
    { id: 'miffy', name: 'Miffy', emoji: '🐰' }
  ];

  return (
    <div className="frame-panel">
      <h3 className="panel-title">Frames & Stickers</h3>
      
      <div className="section">
        <h4 className="section-title">Frames</h4>
        <div className="frames-grid">
          {frames.map((frame) => (
            <button
              key={frame.id}
              className={`frame-option ${currentFrame === frame.id ? 'active' : ''}`}
              onClick={() => onFrameChange(frame.id)}
            >
              <div 
                className="frame-preview"
                style={{ 
                  background: frame.color,
                  border: frame.id === 'colorful' ? 'none' : `2px solid ${frame.color}`
                }}
              >
                <span className="frame-icon">{frame.preview}</span>
              </div>
              <span className="frame-name">{frame.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h4 className="section-title">Themed Stickers</h4>
        <div className="stickers-grid">
          {stickers.map((sticker) => (
            <button
              key={sticker.id}
              className="sticker-option"
              title={sticker.name}
              onClick={() => onThemeScatter && onThemeScatter(sticker.emoji)}
            >
              <div className="sticker-preview">
                <span className="sticker-emoji">{sticker.emoji}</span>
              </div>
              <span className="sticker-name">{sticker.name}</span>
            </button>
          ))}
        </div>
        <p className="sticker-note">* Click a themed sticker to scatter it in the background. Click again to clear.</p>
      </div>
    </div>
  );
};

export default FramePanel;
