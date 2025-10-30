import React, { useState } from 'react';
import './FrameColorSelector.css';

const FrameColorSelector = ({ onColorSelect, currentColor }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  const colors = [
    { id: 'white', label: 'White', value: '#ffffff' },
    { id: 'black', label: 'Black', value: '#000000' },
    { id: 'pink', label: 'Pink', value: '#ec4899' },
    { id: 'green', label: 'Green', value: '#22c55e' },
    { id: 'blue', label: 'Blue', value: '#3b82f6' },
    { id: 'yellow', label: 'Yellow', value: '#fbbf24' },
    { id: 'purple', label: 'Purple', value: '#8b5cf6' },
    { id: 'maroon', label: 'Maroon', value: '#800000' },
    { id: 'burgundy', label: 'Burgundy', value: '#800020' }
  ];

  const handleCustomColorChange = (e) => {
    onColorSelect(e.target.value);
  };

  return (
    <div className="frame-color-selector">
      <h3 className="panel-title">Frame Color</h3>
      <div className="color-grid">
        {colors.map(color => (
          <button
            key={color.id}
            className={`color-option ${currentColor === color.value ? 'selected' : ''}`}
            onClick={() => onColorSelect(color.value)}
            style={{ backgroundColor: color.value }}
            title={color.label}
          >
            <span className="color-label">{color.label}</span>
          </button>
        ))}
        <button
          className={`color-option custom ${showCustomPicker ? 'active' : ''}`}
          onClick={() => setShowCustomPicker(!showCustomPicker)}
        >
          <span className="color-label">Custom</span>
        </button>
      </div>
      
      {showCustomPicker && (
        <div className="custom-color-picker">
          <input
            type="color"
            value={currentColor}
            onChange={handleCustomColorChange}
            className="color-input"
          />
          <label className="color-value">{currentColor}</label>
        </div>
      )}
    </div>
  );
};

export default FrameColorSelector;