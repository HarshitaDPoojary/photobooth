// Generate a simple device hash based on user agent and screen properties
export const generateDeviceHash = () => {
  const userAgent = navigator.userAgent;
  const screenInfo = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a simple hash from device info
  let hash = 0;
  const str = userAgent + screenInfo + timezone;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).substring(0, 8);
};

// Generate timestamp for folder naming
export const generateTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '-');
};

// Create folder name with device hash and timestamp
export const createFolderName = () => {
  const deviceHash = generateDeviceHash();
  const timestamp = generateTimestamp();
  return `photobooth_${deviceHash}_${timestamp}`;
};

// Check if File System Access API is supported
export const isFileSystemSupported = () => {
  return 'showDirectoryPicker' in window && 'showSaveFilePicker' in window;
};

// Create a folder and save photos to it
export const createFolderAndSavePhotos = async (photoBlobs, folderName) => {
  // For now, always use localStorage since File System Access API requires user gesture
  console.log('Using localStorage for photo storage (File System API requires user gesture)');
  return await savePhotosToStorage(photoBlobs, folderName);
};

// Delete folder and all photos
export const deletePhotoSession = async (folderName) => {
  try {
    // Get session data
    const sessionKey = `photobooth_session_${folderName}`;
    const sessionData = sessionStorage.getItem(sessionKey);
    
    if (!sessionData) {
      console.log('No session data found for cleanup');
      return;
    }

    const { directoryHandle, folderHandle } = JSON.parse(sessionData);
    
    if (folderHandle && directoryHandle) {
      // Remove the folder
      await directoryHandle.removeEntry(folderName, { recursive: true });
      console.log(`Deleted folder: ${folderName}`);
    }

    // Clean up session storage
    sessionStorage.removeItem(sessionKey);
    localStorage.removeItem(`photobooth_${folderName}`);
    
    console.log(`Photo session ${folderName} cleaned up successfully`);
  } catch (error) {
    console.error('Error deleting photo session:', error);
  }
};

// Get all active photo sessions
export const getActivePhotoSessions = () => {
  const sessions = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('photobooth_session_')) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key));
        sessions.push(data);
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
  }
  return sessions;
};

// Save blob as file (for download)
export const saveBlobAsFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Convert blob to base64 for storage
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Save photos to localStorage with folder structure
export const savePhotosToStorage = async (photoBlobs, folderName) => {
  try {
    const photoData = [];
    
    console.log(`Saving ${photoBlobs.length} photo blobs to folder: ${folderName}`);
    
    for (let i = 0; i < photoBlobs.length; i++) {
      try {
        const blob = photoBlobs[i];
        if (!blob || blob.size === 0) {
          throw new Error(`Photo ${i + 1} blob is null or empty`);
        }
        
        const base64 = await blobToBase64(blob);
        
        photoData.push({
          id: i + 1,
          data: base64,
          timestamp: new Date().toISOString(),
          filename: `photo_${i + 1}.jpg`,
          size: blob.size
        });
        
        console.log(`Photo ${i + 1} saved successfully - ${blob.size} bytes`);
      } catch (error) {
        console.error(`Error processing photo ${i + 1}:`, error);
        // Continue with other photos even if one fails
      }
    }
    
    if (photoData.length === 0) {
      console.error('No photos were successfully processed');
      return null;
    }
    
    const storageKey = `photobooth_${folderName}`;
    const sessionData = {
      folderName,
      photos: photoData,
      createdAt: new Date().toISOString(),
      totalPhotos: photoData.length
    };
    
    localStorage.setItem(storageKey, JSON.stringify(sessionData));
    console.log(`Photo session saved to storage: ${folderName} with ${photoData.length} photos`);
    
    return photoData;
  } catch (error) {
    console.error('Error saving photos to storage:', error);
    return null;
  }
};

// Get saved photos from localStorage
export const getSavedPhotos = (folderName) => {
  const storageKey = `photobooth_${folderName}`;
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
};

// Get all saved photo sessions
export const getAllPhotoSessions = () => {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('photobooth_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        sessions.push(data);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }
  return sessions;
};
