import React from 'react';
import FilterPanel from './FilterPanel';
import FrameColorSelector from './FrameColorSelector';
import StickerPanel from './StickerPanel';
import './EditPanel.css';

const EditPanel = ({
  currentFilter,
  onFilterChange,
  currentFrame,
  onFrameChange,
  onStickerSelect,
  selectedSticker
}) => {
  const [activeTab, setActiveTab] = React.useState('filters');

  const tabs = [
    { id: 'filters', label: 'Filters', icon: '🎨' },
    { id: 'frames', label: 'Frame Color', icon: '🖼️' },
    { id: 'stickers', label: 'Stickers', icon: '🎯' }
  ];

  return (
    <div className="edit-panel">
      <div className="edit-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="edit-content">
        {activeTab === 'filters' && (
          <FilterPanel
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
          />
        )}
        {activeTab === 'frames' && (
          <FrameColorSelector
            currentColor={currentFrame}
            onColorSelect={onFrameChange}
          />
        )}
        {activeTab === 'stickers' && (
          <StickerPanel
            onStickerSelect={onStickerSelect}
            selectedSticker={selectedSticker}
          />
        )}
      </div>
    </div>
  );
};

export default EditPanel;