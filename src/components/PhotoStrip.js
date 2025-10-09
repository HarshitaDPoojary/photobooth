import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './PhotoStrip.css';

const PhotoStrip = ({ photos, filter, frame, folderName, selectedLayout, onRetake, onDownload }) => {
  const stripRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  console.log('PhotoStrip received photos:', photos);
  console.log('PhotoStrip photos length:', photos.length);

  const applyFilter = (imageUrl, filterType) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply filter
        switch (filterType) {
          case 'bw':
            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              data[i] = gray;
              data[i + 1] = gray;
              data[i + 2] = gray;
            }
            break;
          case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
              data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
              data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            break;
          case 'vintage':
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.min(255, data[i] * 1.2);
              data[i + 1] = Math.min(255, data[i + 1] * 1.1);
              data[i + 2] = Math.min(255, data[i + 2] * 0.9);
            }
            break;
          case 'soft':
            // Soft blur effect
            ctx.filter = 'blur(1px) brightness(1.1) contrast(0.9)';
            ctx.drawImage(img, 0, 0);
            break;
          case 'noir':
            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              data[i] = gray * 0.8;
              data[i + 1] = gray * 0.8;
              data[i + 2] = gray * 0.8;
            }
            break;
          case 'vivid':
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.min(255, data[i] * 1.3);
              data[i + 1] = Math.min(255, data[i + 1] * 1.2);
              data[i + 2] = Math.min(255, data[i + 2] * 1.1);
            }
            break;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageUrl;
    });
  };

  const getFrameClass = (frameType) => {
    const frameClasses = {
      default: 'frame-default',
      colorful: 'frame-colorful',
      elegant: 'frame-elegant',
      fun: 'frame-fun',
      vintage: 'frame-vintage'
    };
    return frameClasses[frameType] || 'frame-default';
  };

  const getLayoutClass = (layout) => {
    const layoutClasses = {
      'layout-a': 'layout-vertical-strip',
      'layout-b': 'layout-vertical-strip',
      'layout-c': 'layout-vertical-wide',
      'layout-d': 'layout-grid'
    };
    return layoutClasses[layout] || 'layout-vertical-strip';
  };

  const getLayoutName = (layout) => {
    const layoutNames = {
      'layout-a': 'Layout A (4 photos)',
      'layout-b': 'Layout B (3 photos)',
      'layout-c': 'Layout C (2 photos)',
      'layout-d': 'Layout D (6 photos)'
    };
    return layoutNames[layout] || 'Layout A (4 photos)';
  };

  const handleDownload = async () => {
    if (!stripRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(stripRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297] // A4 size
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('picapica-photostrip.pdf');
    } catch (error) {
      console.error('Error downloading photo strip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImageDownload = async () => {
    if (!stripRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(stripRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = 'picapica-photostrip.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="photo-strip-container">
      <div className="photo-strip-wrapper">
        <div 
          ref={stripRef}
          className={`photo-strip ${getFrameClass(frame)} ${getLayoutClass(selectedLayout)}`}
          data-layout={selectedLayout}
        >
          <div className="strip-header">
            <h2 className="strip-title">Picapica Photo Booth</h2>
            <div className="strip-date">{new Date().toLocaleDateString()}</div>
          </div>
          
          <div className="photos-container">
            <div className="layout-info">
              <span className="layout-name">{getLayoutName(selectedLayout)}</span>
            </div>
            <div className="photos-grid">
              {photos && photos.length > 0 ? (
                photos.map((photo, index) => (
                  <div key={index} className="photo-container">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className={`photo ${filter !== 'none' ? `filter-${filter}` : ''}`}
                      onError={(e) => {
                        console.error(`Failed to load photo ${index + 1}:`, photo);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log(`Successfully loaded photo ${index + 1}:`, photo);
                      }}
                    />
                    <div className="photo-number">{index + 1}</div>
                  </div>
                ))
              ) : (
                <div className="no-photos">
                  <p>No photos captured</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="strip-footer">
            <div className="strip-url">picapicabooth.com</div>
            {folderName && (
              <div className="strip-folder">Saved as: {folderName}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="strip-controls">
        <button 
          onClick={onRetake}
          className="cancel-btn"
        >
          Cancel & Delete Photos
        </button>
        
        <div className="download-buttons">
          <button 
            onClick={handleImageDownload}
            className="download-btn"
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download PNG'}
          </button>
          
          <button 
            onClick={handleDownload}
            className="download-btn"
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoStrip;
