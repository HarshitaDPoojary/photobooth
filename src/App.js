import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LayoutSelector from './components/LayoutSelector';
import Camera from './components/Camera';
import PhotoStrip from './components/PhotoStrip';
import FilterPanel from './components/FilterPanel';
import FramePanel from './components/FramePanel';
import StickerPanel from './components/StickerPanel';
import SharePanel from './components/SharePanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { initAudio, playCountdownBeep, playCaptureSound, playCompleteSound } from './utils/audioFeedback';
import { deletePhotoSession, isFileSystemSupported } from './utils/fileStorage';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [currentFrame, setCurrentFrame] = useState('default');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [backgroundStickers, setBackgroundStickers] = useState({ enabled: false, emojis: [], density: 20 });
  const [showPhotoStrip, setShowPhotoStrip] = useState(false);
  const toggleThemeScatter = (emoji) => {
    setBackgroundStickers((prev) => {
      const isSame = prev.enabled && prev.emojis && prev.emojis.length === 1 && prev.emojis[0] === emoji;
      if (isSame) {
        return { enabled: false, emojis: [], density: prev.density || 30 };
      }
      return { enabled: true, emojis: [emoji], density: prev.density || 30 };
    });
  };
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoFolder, setPhotoFolder] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [showLayoutSelector, setShowLayoutSelector] = useState(true);
  const [retakeCount, setRetakeCount] = useState(0);

  const handlePhotosTaken = (capturedBlobs, folderName = null) => {
    console.log('App received blobs:', capturedBlobs);
    console.log('Number of blobs received:', capturedBlobs.length);
    
    // Convert blobs to URLs for display
    const photoUrls = capturedBlobs.map(blob => URL.createObjectURL(blob));
    console.log('Created photo URLs:', photoUrls);
    
    setPhotos(photoUrls);
    setPhotoFolder(folderName);
    setShowPhotoStrip(true);
  };

  const handleLayoutSelect = (layoutId) => {
    if (layoutId) {
      setSelectedLayout(layoutId);
      setShowLayoutSelector(false);
    }
  };

  const handleRetake = async () => {
    // Delete the folder if it exists
    if (photoFolder) {
      try {
        await deletePhotoSession(photoFolder);
        console.log(`Deleted folder: ${photoFolder}`);
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
    
    setPhotos([]);
    setShowPhotoStrip(false);
    setCurrentFilter('none');
    setCurrentFrame('default');
    setPhotoFolder(null);
    setShowLayoutSelector(true);
  };

  const handleDownload = () => {
    // This will be implemented in PhotoStrip component
  };

  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    onStartCapture: () => !isCapturing && !showPhotoStrip && handleStartCapture(),
    onRetake: () => showPhotoStrip && handleRetake(),
    onSave: () => showPhotoStrip && handleDownload(),
    onNextFilter: () => {
      if (!showPhotoStrip) return;
      const filters = ['none', 'bw', 'sepia', 'vintage', 'soft', 'noir', 'vivid'];
      const currentIndex = filters.indexOf(currentFilter);
      const nextIndex = (currentIndex + 1) % filters.length;
      setCurrentFilter(filters[nextIndex]);
    },
    onChangeLayout: () => setShowLayoutSelector(true),
    onCancel: () => {
      if (selectedSticker) {
        setSelectedSticker(null);
      } else if (showPhotoStrip) {
        handleRetake();
      }
    }
  });

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudioContext = () => {
      initAudio();
      window.removeEventListener('click', initAudioContext);
    };
    window.addEventListener('click', initAudioContext);
    return () => window.removeEventListener('click', initAudioContext);
  }, []);

  // Auto-select layout from URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');
      const layout = params.get('layout');
      if (from === 'clone') {
        setSelectedLayout(layout || 'layout-1');
        setShowLayoutSelector(false);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining photo folders when component unmounts
      if (photoFolder) {
        deletePhotoSession(photoFolder).catch(console.error);
      }
    };
  }, [photoFolder]);

  return (
    <div className="App">
      <div className="container">
        <header className="text-center mb-8">
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <Link to="/clone" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
              Picapica Landing
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Picapica Photo Booth
          </h1>
          <p className="text-white text-xl">
            Capture and customize your photo strip
          </p>
          <div className="keyboard-shortcuts">
            <p className="text-white text-sm mt-2">
              Keyboard shortcuts: [Space] Start/Capture • [R] Retake • [F] Change Filter • [S] Save • [L] Layout
            </p>
          </div>
          {!isFileSystemSupported() && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 max-w-2xl mx-auto">
              <p className="text-sm">
                <strong>Note:</strong> Your browser doesn't support folder creation. 
                Photos will be saved to browser storage instead.
              </p>
            </div>
          )}
          {retakeCount > 2 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 max-w-2xl mx-auto">
              <p className="text-sm">
                <strong>Tip:</strong> Having trouble? Try adjusting your lighting or moving to a different spot.
              </p>
            </div>
          )}
        </header>

        {showLayoutSelector ? (
          <LayoutSelector 
            onLayoutSelect={handleLayoutSelect}
            selectedLayout={selectedLayout}
          />
        ) : !showPhotoStrip ? (
          <div className="flex flex-col items-center gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Selected layout: {selectedLayout ? selectedLayout.replace('layout-', 'Layout ').toUpperCase() : 'None'}
                </h2>
                <button 
                  onClick={() => setShowLayoutSelector(true)}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Change Layout
                </button>
              </div>
              <Camera 
                onPhotosTaken={handlePhotosTaken}
                isCapturing={isCapturing}
                setIsCapturing={setIsCapturing}
                selectedLayout={selectedLayout}
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
                timerDuration={3}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <PhotoStrip 
                photos={photos}
                filter={currentFilter}
                frame={currentFrame}
                folderName={photoFolder}
                selectedLayout={selectedLayout}
                selectedSticker={selectedSticker}
                backgroundStickers={backgroundStickers}
                onRetake={handleRetake}
                onDownload={handleDownload}
              />
            </div>
            <div className="lg:w-80">
              <div className="space-y-6">
                <FramePanel 
                  currentFrame={currentFrame}
                  onFrameChange={setCurrentFrame}
                  onThemeScatter={toggleThemeScatter}
                />
                <StickerPanel
                  onStickerSelect={setSelectedSticker}
                  onBackgroundChange={(cfg) => setBackgroundStickers((prev) => ({ ...prev, ...cfg }))}
                />
                <SharePanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
