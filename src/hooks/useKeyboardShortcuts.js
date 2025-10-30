import { useEffect } from 'react';

export const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle if not typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          // Space to start capture
          if (handlers.onStartCapture) {
            event.preventDefault();
            handlers.onStartCapture();
          }
          break;

        case 'r':
          // R to retake photos
          if (handlers.onRetake) {
            event.preventDefault();
            handlers.onRetake();
          }
          break;

        case 's':
          // S to save/download
          if (handlers.onSave) {
            event.preventDefault();
            handlers.onSave();
          }
          break;

        case 'f':
          // F to cycle through filters
          if (handlers.onNextFilter) {
            event.preventDefault();
            handlers.onNextFilter();
          }
          break;

        case 'l':
          // L to change layout
          if (handlers.onChangeLayout) {
            event.preventDefault();
            handlers.onChangeLayout();
          }
          break;

        case 'escape':
          // Escape to cancel/clear selection
          if (handlers.onCancel) {
            event.preventDefault();
            handlers.onCancel();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
};