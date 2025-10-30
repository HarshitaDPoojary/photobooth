import React, { useRef, useState, useCallback } from 'react';
import { createFolderName, createFolderAndSavePhotos, deletePhotoSession } from '../utils/fileStorage';
import { applyFilter } from '../utils/filters';
import './Camera.css';

const Camera = ({ onPhotosTaken, isCapturing, setIsCapturing, selectedLayout, currentFilter = 'none', timerDuration = 3, onFilterChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimer, setSelectedTimer] = useState(timerDuration);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [photoBlobs, setPhotoBlobs] = useState([]);

  // Get photo count based on selected layout
  const getPhotoCount = useCallback(() => {
    const layoutCounts = {
        'layout-a': 6,
      'layout-b': 3,
      'layout-c': 2,
        'layout-d': 4
    };
    return layoutCounts[selectedLayout] || 4;
  }, [selectedLayout]);

  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    const photoCount = getPhotoCount();
    
    if (files.length !== photoCount) {
      alert(`Please select exactly ${photoCount} images for this layout.`);
      return;
    }

    const uploadedBlobs = [];
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files.');
        return;
      }

      // Create a blob from the file
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      uploadedBlobs.push(blob);
      uploadedUrls.push(URL.createObjectURL(blob));
    }

    setPhotos(uploadedUrls);
    const folderName = createFolderName();
    const savedPhotos = await createFolderAndSavePhotos(uploadedBlobs, folderName);
    
    if (savedPhotos) {
      onPhotosTaken(uploadedBlobs, folderName);
    } else {
      onPhotosTaken(uploadedBlobs);
    }
  }, [getPhotoCount, onPhotosTaken]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCameraLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        setCameraReady(true);
        setCameraLoading(false);
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      setCameraLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Video or canvas not available');
      return Promise.resolve(null);
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Ensure video is ready and has dimensions
    if (video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready for capture', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        duration: video.duration
      });
      return Promise.resolve(null);
    }

    console.log('Video ready for capture:', {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime
    });

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame to canvas (mirrored for selfie effect)
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    // Apply selected filter
    applyFilter(context, canvas, currentFilter);

    // Convert to blob
    return new Promise((resolve) => {
      try {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            console.log('Photo captured successfully', blob.size, 'bytes');
            resolve(blob);
          } else {
            console.error('Failed to create blob from canvas - blob is null or empty');
            resolve(null);
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        console.error('Error creating blob from canvas:', error);
        resolve(null);
      }
    });
  }, []);

  const startPhotoSequence = useCallback(async () => {
    const photoCount = getPhotoCount();
    if (isCapturing || photos.length >= photoCount) return;

    setIsCapturing(true);
    setPhotos([]);
    setPhotoBlobs([]);
    setCurrentPhotoIndex(0);

    const capturedPhotos = [];
    const capturedBlobs = [];

    // Capture photos with individual countdowns based on layout
    for (let photoIndex = 0; photoIndex < photoCount; photoIndex++) {
      setCurrentPhotoIndex(photoIndex + 1);
      
      // Countdown based on selected timer duration
      for (let i = selectedTimer; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Show "Say Cheese!" for this photo
      setCountdown(0);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Longer delay to ensure video frame is stable and ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the photo
      const photoBlob = await capturePhoto();
      if (photoBlob && photoBlob.size > 0) {
        const photoUrl = URL.createObjectURL(photoBlob);
        capturedPhotos.push(photoUrl);
        capturedBlobs.push(photoBlob);
        setPhotos(prev => {
          const newPhotos = [...prev, photoUrl];
          console.log(`Updated photos array:`, newPhotos);
          return newPhotos;
        });
        setPhotoBlobs(prev => {
          const newBlobs = [...prev, photoBlob];
          console.log(`Updated blobs array:`, newBlobs);
          return newBlobs;
        });
        console.log(`Photo ${photoIndex + 1} captured successfully - ${photoBlob.size} bytes`);
        console.log(`Photo URL created: ${photoUrl}`);
      } else {
        console.error(`Failed to capture photo ${photoIndex + 1} - blob is null or empty`);
        // Try to capture again with a longer delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryBlob = await capturePhoto();
        if (retryBlob && retryBlob.size > 0) {
          const photoUrl = URL.createObjectURL(retryBlob);
          capturedPhotos.push(photoUrl);
          capturedBlobs.push(retryBlob);
          setPhotos(prev => {
            const newPhotos = [...prev, photoUrl];
            console.log(`Updated photos array (retry):`, newPhotos);
            return newPhotos;
          });
          setPhotoBlobs(prev => {
            const newBlobs = [...prev, retryBlob];
            console.log(`Updated blobs array (retry):`, newBlobs);
            return newBlobs;
          });
          console.log(`Photo ${photoIndex + 1} captured on retry - ${retryBlob.size} bytes`);
          console.log(`Photo URL created (retry): ${photoUrl}`);
        } else {
          console.error(`Failed to capture photo ${photoIndex + 1} even on retry`);
        }
      }

      // Brief pause between photos (except for the last one)
      if (photoIndex < photoCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsCapturing(false);
    setCountdown(0);
    
    console.log(`Photo sequence complete. Captured ${capturedPhotos.length} photos`);
    console.log('Captured blobs:', capturedBlobs.map((blob, i) => `Photo ${i + 1}: ${blob.size} bytes`));
    console.log('Photo URLs:', capturedPhotos);
    
    if (capturedPhotos.length === photoCount) {
      // Save photos to folder
      setSavingPhotos(true);
      const folderName = createFolderName();
      const savedPhotos = await createFolderAndSavePhotos(capturedBlobs, folderName);
      setSavingPhotos(false);
      
      if (savedPhotos) {
        console.log(`Photos saved to folder: ${folderName}`);
        console.log('Passing blobs to onPhotosTaken:', capturedBlobs);
        onPhotosTaken(capturedBlobs, folderName);
      } else {
        console.error('Failed to save photos to folder');
        console.log('Passing blobs to onPhotosTaken (fallback):', capturedBlobs);
        onPhotosTaken(capturedBlobs);
      }
    } else {
      console.error(`Expected ${photoCount} photos but only captured ${capturedPhotos.length}`);
      console.log('Passing partial blobs to onPhotosTaken:', capturedBlobs);
      // Still proceed with whatever we captured
      onPhotosTaken(capturedBlobs);
    }
  }, [isCapturing, photos.length, capturePhoto, onPhotosTaken, getPhotoCount]);

  const retakePhotos = useCallback(() => {
    setPhotos([]);
    setCountdown(0);
    setCurrentPhotoIndex(0);
  }, []);

  // Handle camera based on mode
  React.useEffect(() => {
    if (!isUploadMode) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      // Clean up object URLs
      photos.forEach(url => URL.revokeObjectURL(url));
    };
  }, [startCamera, stopCamera, photos, isUploadMode]);

  const filters = [
    { id: 'none', name: 'No Filter' },
    { id: 'grayscale', name: 'B&W' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'soft', name: 'Soft' },
    { id: 'noir', name: 'Noir' },
    { id: 'vivid', name: 'Vivid' }
  ];

  return (
    <div className="camera-page">
      <div className="mode-switcher">
        <button
          className={`mode-btn ${!isUploadMode ? 'active' : ''}`}
          onClick={() => setIsUploadMode(false)}
        >
          Camera
        </button>
        <button
          className={`mode-btn ${isUploadMode ? 'active' : ''}`}
          onClick={() => setIsUploadMode(true)}
        >
          Upload Images
        </button>
      </div>

      <div className="layout-info">
        Selected layout: Layout {selectedLayout?.replace('layout-', '').toUpperCase()} ({getPhotoCount()} photos)
      </div>

      <div className="camera-section">
        {/* Camera feed */}
        <div className="camera-container">
          {!isUploadMode ? (
            <div className="camera-view">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video ${!cameraReady ? 'hidden' : ''} ${currentFilter}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlays inside camera */}
              {!cameraReady && !error && !cameraLoading && (
                <div className="camera-placeholder">
                  <div className="camera-icon">📷</div>
                  <p className="text-white text-lg mb-4">Camera not started</p>
                  <button onClick={startCamera} className="start-camera-btn">Start Camera</button>
                </div>
              )}

              {cameraLoading && (
                <div className="camera-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}

              {error && (
                <div className="camera-error">
                  <div className="error-icon">⚠️</div>
                  <p className="text-white">{error}</p>
                </div>
              )}

              {countdown > 0 && (
                <div className="countdown">
                  <div className="countdown-number">{countdown}</div>
                </div>
              )}

              {isCapturing && countdown === 0 && (
                <div className="capturing">
                  <div className="capturing-text">Say Cheese! 📸</div>
                </div>
              )}
            </div>
          ) : (
            <div className="upload-section">
              <label htmlFor="photo-upload" className="upload-btn">
                📤 Select {getPhotoCount()} Photos to Upload
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Controls below the camera */}
        <div className="controls-section">
          <div className="timer-selector">
            <label htmlFor="timer-select" className="timer-label">Timer (seconds):</label>
            <select id="timer-select" value={selectedTimer} onChange={(e) => setSelectedTimer(Number(e.target.value))} className="timer-select">
              <option value="3">3s</option>
              <option value="5">5s</option>
              <option value="7">7s</option>
              <option value="10">10s</option>
            </select>
          </div>

          <div className="filter-strip">
            {filters.map(filter => (
              <button key={filter.id} className={`filter-option ${currentFilter === filter.id ? 'active' : ''}`} onClick={() => onFilterChange(filter.id)}>
                <div className={`filter-preview ${filter.id}`}><span className="filter-icon">📷</span></div>
                <span className="filter-name">{filter.name}</span>
              </button>
            ))}
          </div>

          <div className="action-buttons">
            {photos.length > 0 && photos.length < getPhotoCount() ? (
              <button onClick={retakePhotos} className="retake-btn">Retake Photos</button>
            ) : (
              <button onClick={startPhotoSequence} className="capture-btn" disabled={isCapturing || !cameraReady}>Take {getPhotoCount()} Photos</button>
            )}
          </div>

          {savingPhotos && (
            <div className="saving-photos">
              <div className="loading-spinner"></div>
              <div className="saving-text">Saving photos...</div>
            </div>
          )}
        </div>

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="photo-preview">
            <h3 className="text-white text-lg mb-2">Captured Photos:</h3>
            <div className="preview-grid">
              {photos.map((photo, index) => (
                <img key={index} src={photo} alt={`Photo ${index + 1}`} className={`preview-photo ${currentFilter}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
