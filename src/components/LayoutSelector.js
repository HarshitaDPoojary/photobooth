import React from 'react';
import './LayoutSelector.css';

const LayoutSelector = ({ onLayoutSelect, selectedLayout }) => {
  const layouts = [
    {
      id: 'layout-a',
      name: 'Layout A',
      photoCount: 4,
      description: '4 Pose',
      preview: 'vertical-strip',
      icon: '📸📸📸📸'
    },
    {
      id: 'layout-b', 
      name: 'Layout B',
      photoCount: 3,
      description: '3 Pose',
      preview: 'vertical-strip',
      icon: '📸📸📸'
    },
    {
      id: 'layout-c',
      name: 'Layout C', 
      photoCount: 2,
      description: '2 Pose',
      preview: 'vertical-wide',
      icon: '📸📸'
    },
    {
      id: 'layout-d',
      name: 'Layout D',
      photoCount: 6,
      description: '6 Pose',
      preview: 'grid',
      icon: '📸📸📸\n📸📸📸'
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
            onClick={() => onLayoutSelect(layout.id)}
          >
            <div className="layout-preview">
              <div className={`preview-${layout.preview}`}>
                {layout.photoCount <= 4 ? (
                  Array.from({ length: layout.photoCount }, (_, i) => (
                    <div key={i} className="preview-photo">
                      <div className="photo-placeholder">
                        <span className="photo-icon">📷</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid-preview">
                    {Array.from({ length: layout.photoCount }, (_, i) => (
                      <div key={i} className="preview-photo small">
                        <div className="photo-placeholder">
                          <span className="photo-icon">📷</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="layout-branding">
                <div className="brand-text">Picapica {new Date().toLocaleDateString()}</div>
                <div className="brand-price">2025.00</div>
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
