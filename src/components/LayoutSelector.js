import React, { useState } from 'react';
import './LayoutSelector.css';

const LayoutSelector = ({ onLayoutSelect }) => {
  const [selectedLayout, setSelectedLayout] = useState(null);
  
  const layouts = [
    {
      id: 'layout-a',
      name: 'Classic Strip',
        photoCount: 6,
        description: '6 Photos (2x3 Grid)',
      preview: '/assets/layout-a.png',
      style: 'vertical-strip'
    },
    {
      id: 'layout-b',
      name: 'Triple Shot',
      photoCount: 3,
      description: '3 Large Photos',
      preview: '/assets/layout-b.png',
      style: 'vertical-strip'
    },
    {
      id: 'layout-c',
      name: 'Double Take',
      photoCount: 2,
      description: '2 Full-Size Photos',
      preview: '/assets/layout-c.png',
      style: 'vertical-wide'
    },
    {
      id: 'layout-d',
      name: 'Photo Grid',
        photoCount: 4,
        description: '4 Photo Collage',
      preview: '/assets/layout-d.png',
      style: 'grid'
    }
  ];

  return (
    <div className="layout-selector">
      <div className="layout-header">
        <h2 className="layout-title">Select a layout for your photo session</h2>
        <p className="layout-subtitle">You can choose from different styles and poses</p>
      </div>

      <div className="layout-grid">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            className={`layout-card ${selectedLayout === layout.id ? 'selected' : ''}`}
            onClick={() => setSelectedLayout(layout.id)}
          >
            <div className="layout-preview">
              <div className={`preview-container preview-${layout.style} preview-${layout.id}`}>
                <img 
                  src={layout.preview} 
                  alt={`${layout.name} preview`}
                  className={`layout-preview-image ${layout.id}`}
                />
                <div className="layout-overlay">
                  <div className="layout-photo-count">
                    {layout.photoCount} Photos
                  </div>
                </div>
              </div>
            </div>
            
            <div className="layout-info">
              <h3 className="layout-name">{layout.name}</h3>
              <p className="layout-description">{layout.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="layout-actions">
        <button 
          className="continue-btn"
          onClick={() => onLayoutSelect(selectedLayout)}
          disabled={!selectedLayout}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LayoutSelector;
