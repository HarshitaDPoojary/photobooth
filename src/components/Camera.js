import React, { useRef, useState, useCallback } from 'react';
import { createFolderName, createFolderAndSavePhotos, deletePhotoSession } from '../utils/fileStorage';
import './Camera.css';

const Camera = ({ onPhotosTaken, isCapturing, setIsCapturing, selectedLayout }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [photoBlobs, setPhotoBlobs] = useState([]);

  // Get photo count based on selected layout
  const getPhotoCount = useCallback(() => {
    const layoutCounts = {
      'layout-a': 4,
      'layout-b': 3,
      'layout-c': 2,
      'layout-d': 6
    };
    return layoutCounts[selectedLayout] || 4;
  }, [selectedLayout]);

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
      
      // Countdown for each photo: 4-3-2-1
      for (let i = 4; i > 0; i--) {
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

  // Auto-start camera on mount
  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      // Clean up object URLs
      photos.forEach(url => URL.revokeObjectURL(url));
    };
  }, [startCamera, stopCamera, photos]);

  return (
    <div className="camera-container">
      <div className="camera-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`camera-video ${!cameraReady ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!cameraReady && !error && !cameraLoading && (
          <div className="camera-placeholder">
            <div className="camera-icon">📷</div>
            <p className="text-white text-lg mb-4">Camera not started</p>
            <button 
              onClick={startCamera}
              className="start-camera-btn"
            >
              Start Camera
            </button>
          </div>
        )}

        {cameraLoading && (
          <div className="camera-loading">
            <div className="loading-spinner"></div>
            <p className="text-white text-lg mb-4">Starting camera...</p>
            <p className="text-white text-sm">Please allow camera access when prompted</p>
          </div>
        )}

        {error && (
          <div className="camera-error">
            <div className="error-icon">⚠️</div>
            <p className="text-white text-lg mb-4">{error}</p>
            <button 
              onClick={startCamera}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        )}

        {cameraReady && (
          <div className="camera-overlay">
            {countdown > 0 && (
              <div className="countdown">
                <div className="countdown-number">{countdown}</div>
                <div className="countdown-text">
                  Photo {currentPhotoIndex} - Get ready!
                </div>
              </div>
            )}
            
            {isCapturing && countdown === 0 && (
              <div className="capturing">
                <div className="capturing-text">Say Cheese! 📸</div>
                <div className="photo-counter">
                  Photo {currentPhotoIndex} of {getPhotoCount()}
                </div>
                <div className="photo-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(currentPhotoIndex / getPhotoCount()) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {!isCapturing && countdown === 0 && photos.length === 0 && cameraReady && (
              <div className="camera-controls">
                <button 
                  onClick={startPhotoSequence}
                  className="capture-btn"
                  disabled={isCapturing}
                >
                  Take {getPhotoCount()} Photos
                </button>
              </div>
            )}

            {photos.length > 0 && photos.length < getPhotoCount() && !isCapturing && !savingPhotos && (
              <div className="camera-controls">
                <button 
                  onClick={retakePhotos}
                  className="retake-btn"
                >
                  Retake
                </button>
              </div>
            )}

            {savingPhotos && (
              <div className="saving-photos">
                <div className="loading-spinner"></div>
                <div className="saving-text">Saving photos...</div>
              </div>
            )}
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="photo-preview">
          <h3 className="text-white text-lg mb-2">Captured Photos:</h3>
          <div className="preview-grid">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                className="preview-photo"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
