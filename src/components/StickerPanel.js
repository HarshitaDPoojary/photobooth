import React, { useState } from 'react';
import './StickerPanel.css';

const StickerPanel = ({ onStickerSelect, onBackgroundChange }) => {
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [mode, setMode] = useState('small'); // 'small' | 'characters'
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [scatterEnabled, setScatterEnabled] = useState(false);
  const [density, setDensity] = useState(20);
  
  const categoriesSmall = [
    { id: 'basic', name: 'Basic' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'nature', name: 'Nature' },
    { id: 'fun', name: 'Fun' },
    { id: 'magic', name: 'Magic' }
  ];
  const categoriesCharacters = [
    { id: 'disney', name: 'Disney' }
  ];

  const stickersByCategory = {
    basic: [
      { id: 'heart', emoji: '💖', name: 'Heart' },
      { id: 'star', emoji: '⭐', name: 'Star' },
      { id: 'sparkles', emoji: '✨', name: 'Sparkles' },
      { id: 'rainbow', emoji: '🌈', name: 'Rainbow' }
    ],
    fantasy: [
      { id: 'castle', emoji: '🏰', name: 'Castle' },
      { id: 'crown', emoji: '👑', name: 'Crown' },
      { id: 'wand', emoji: '🪄', name: 'Magic Wand' },
      { id: 'crystal', emoji: '💎', name: 'Crystal' }
    ],
    nature: [
      { id: 'flower', emoji: '🌸', name: 'Flower' },
      { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
      { id: 'sun', emoji: '☀️', name: 'Sun' },
      { id: 'moon', emoji: '🌙', name: 'Moon' }
    ],
    fun: [
      { id: 'balloon', emoji: '🎈', name: 'Balloon' },
      { id: 'party', emoji: '�', name: 'Party' },
      { id: 'gift', emoji: '🎁', name: 'Gift' },
      { id: 'music', emoji: '🎵', name: 'Music' }
    ],
    magic: [
      { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
      { id: 'fairy', emoji: '🧚', name: 'Fairy' },
      { id: 'dragon', emoji: '🐉', name: 'Dragon' },
      { id: 'stars', emoji: '🌟', name: 'Stars' }
    ],
    // Characters set: Disney-inspired placeholders (no copyrighted assets)
    disney: [
      { id: 'mickey', emoji: '🐭', name: 'Mickey' },
      { id: 'minnie', emoji: '🎀🐭', name: 'Minnie' },
      { id: 'donald', emoji: '🦆', name: 'Donald' },
      { id: 'goofy', emoji: '🐶', name: 'Goofy' }
    ]
  };

  const handleStickerClick = (sticker) => {
    setSelectedSticker(sticker);
    if (mode === 'characters') {
      onStickerSelect && onStickerSelect(sticker);
    }
  };

  const applyScatter = () => {
    const emojis = (stickersByCategory[selectedCategory] || []).map(s => s.emoji);
    const enabled = !scatterEnabled ? true : false;
    setScatterEnabled(enabled);
    onBackgroundChange && onBackgroundChange({ enabled, emojis, density });
  };

  return (
    <div className="sticker-panel">
      <h3 className="panel-title">Stickers</h3>

      <div className="sticker-modes">
        <button className={`mode-btn ${mode === 'small' ? 'selected' : ''}`} onClick={() => setMode('small')}>Small Stickers</button>
        <button className={`mode-btn ${mode === 'characters' ? 'selected' : ''}`} onClick={() => setMode('characters')}>Characters</button>
      </div>

      <div className="sticker-categories">
        {(mode === 'small' ? categoriesSmall : categoriesCharacters).map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="stickers-grid">
        {stickersByCategory[selectedCategory]?.map((sticker) => (
          <button
            key={sticker.id}
            className={`sticker-btn ${selectedSticker?.id === sticker.id ? 'selected' : ''}`}
            onClick={() => handleStickerClick(sticker)}
          >
            <div className="sticker-preview">
              <span className="sticker-emoji">{sticker.emoji}</span>
            </div>
            <span className="sticker-name">{sticker.name}</span>
          </button>
        ))}
      </div>

      {mode === 'small' ? (
        <div className="scatter-controls">
          <label className="density-label">Density</label>
          <input type="range" min="5" max="80" value={density} onChange={(e) => setDensity(Number(e.target.value))} />
          <button className={`apply-scatter-btn ${scatterEnabled ? 'active' : ''}`} onClick={applyScatter}>
            {scatterEnabled ? 'Disable Scatter' : 'Scatter in Background'}
          </button>
        </div>
      ) : (
        selectedSticker && (
          <div className="sticker-instructions">
            Click on the polaroid to place the character, then drag to reposition.
          </div>
        )
      )}
    </div>
  );
};

export default StickerPanel;