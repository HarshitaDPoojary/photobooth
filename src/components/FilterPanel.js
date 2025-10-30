import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: 'none', name: 'Original', preview: '🖼️' },
    { id: 'grayscale', name: 'B&W', preview: '⚫' },
    { id: 'sepia', name: 'Sepia', preview: '🤎' },
    { id: 'vintage', name: 'Vintage', preview: '📸' },
    { id: 'warm', name: 'Warm', preview: '�' },
    { id: 'cool', name: 'Cool', preview: '❄️' }
  ];

  return (
    <div className="filter-panel">
      <h3 className="panel-title">Filters</h3>
      <div className="filters-grid">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-option ${currentFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <div className="filter-preview">
              <span className="filter-icon">{filter.preview}</span>
            </div>
            <span className="filter-name">{filter.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;
