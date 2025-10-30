import React from 'react';
import './CountdownSelector.css';

const CountdownSelector = ({ selectedTime, onTimeSelect }) => {
  const countdownOptions = [
    { value: 3, label: '3s' },
    { value: 5, label: '5s' },
    { value: 10, label: '10s' }
  ];

  return (
    <div className="countdown-selector">
      <h3 className="selector-title">Select Countdown Time</h3>
      <div className="time-options">
        {countdownOptions.map(option => (
          <button
            key={option.value}
            className={`time-option ${selectedTime === option.value ? 'selected' : ''}`}
            onClick={() => onTimeSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountdownSelector;