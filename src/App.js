import React, { useState, useRef, useEffect } from 'react';
import LayoutSelector from './components/LayoutSelector';
import Camera from './components/Camera';
import PhotoStrip from './components/PhotoStrip';
import FilterPanel from './components/FilterPanel';
import FramePanel from './components/FramePanel';
import { deletePhotoSession, isFileSystemSupported } from './utils/fileStorage';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [currentFrame, setCurrentFrame] = useState('default');
  const [showPhotoStrip, setShowPhotoStrip] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoFolder, setPhotoFolder] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [showLayoutSelector, setShowLayoutSelector] = useState(true);

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
          <h1 className="text-4xl font-bold text-white mb-4">
            Picapica Photo Booth
          </h1>
          <p className="text-white text-xl">
            Capture 4 photos and create your custom photo strip
          </p>
          {!isFileSystemSupported() && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 max-w-2xl mx-auto">
              <p className="text-sm">
                <strong>Note:</strong> Your browser doesn't support folder creation. 
                Photos will be saved to browser storage instead.
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
                onRetake={handleRetake}
                onDownload={handleDownload}
              />
            </div>
            <div className="lg:w-80">
              <div className="space-y-6">
                <FilterPanel 
                  currentFilter={currentFilter}
                  onFilterChange={setCurrentFilter}
                />
                <FramePanel 
                  currentFrame={currentFrame}
                  onFrameChange={setCurrentFrame}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
