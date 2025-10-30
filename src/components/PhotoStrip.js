import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import GIF from 'gif.js';
import QRCode from 'qrcode';
import './PhotoStrip.css';

const PhotoStrip = ({ photos, filter, frame, folderName, selectedLayout, selectedSticker, backgroundStickers, onRetake, onDownload }) => {
  const stripRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(filter || 'none');
  const [currentFrame, setCurrentFrame] = useState(frame || null);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [scatteredStickers, setScatteredStickers] = useState([]);

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

  // Generate scattered background stickers when enabled/config changes
  useEffect(() => {
    if (!backgroundStickers?.enabled || !Array.isArray(backgroundStickers?.emojis) || backgroundStickers.emojis.length === 0) {
      setScatteredStickers([]);
      return;
    }
    // Determine how many to render based on density and layout size
    const count = Math.max(5, Math.min(80, Number(backgroundStickers.density || 20)));
    const next = [];
    for (let i = 0; i < count; i++) {
      const emoji = backgroundStickers.emojis[i % backgroundStickers.emojis.length];
      next.push({
        id: `bg-${i}`,
        emoji,
        left: Math.random() * 90 + 5, // 5% to 95%
        top: Math.random() * 90 + 5,
        rotate: Math.random() * 40 - 20,
        size: Math.random() * 12 + 10 // 10px - 22px
      });
    }
    setScatteredStickers(next);
  }, [backgroundStickers]);

  // Handle placing character sticker on click
  const handleCanvasClick = (e) => {
    if (!selectedSticker || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // percent
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const size = 10; // percent width
    const newSticker = {
      id: `placed-${Date.now()}`,
      emoji: selectedSticker.emoji || '⭐',
      x,
      y,
      size,
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
  };

  // Simple drag handling for placed stickers
  const startDrag = (id, startEvent) => {
    startEvent.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const onMove = (e) => {
      setPlacedStickers((prev) => prev.map((s) => {
        if (s.id !== id) return s;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        return { ...s, x, y };
      }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
    const onTouchMove = (te) => {
      if (!te.touches || te.touches.length === 0) return;
      const t = te.touches[0];
      setPlacedStickers((prev) => prev.map((s) => {
        if (s.id !== id) return s;
        const x = ((t.clientX - rect.left) / rect.width) * 100;
        const y = ((t.clientY - rect.top) / rect.height) * 100;
        return { ...s, x, y };
      }));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
  };

  const removeSticker = (id) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const getLayoutName = (layout) => {
    const layoutNames = {
      'layout-a': 'Layout A (6 photos)',
      'layout-b': 'Layout B (3 photos)',
      'layout-c': 'Layout C (2 photos)',
      'layout-d': 'Layout D (4 photos)'
    };
    return layoutNames[layout] || 'Layout A (6 photos)';
  };

  const handleDownload = async () => {
    if (!stripRef.current) return;
    
    setIsDownloading(true);
    try {
      const target = stripRef.current;
      const rect = target.getBoundingClientRect();
      const canvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        windowWidth: Math.ceil(rect.width),
        windowHeight: Math.ceil(rect.height)
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
      const target = stripRef.current;
      const rect = target.getBoundingClientRect();
      const canvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        windowWidth: Math.ceil(rect.width),
        windowHeight: Math.ceil(rect.height)
      });
      
      const link = document.createElement('a');
      link.download = 'picapica-photostrip.png';
      link.href = canvas.toDataURL();
      link.click();

      // Generate QR code for the downloaded image
      const qrData = await QRCode.toDataURL(link.href);
      setQrCodeUrl(qrData);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGifDownload = async () => {
    if (!photos || photos.length === 0) return;
    
    setIsDownloading(true);
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: 320,
        height: 240
      });

      // Convert each photo URL to an image element
      const images = await Promise.all(
        photos.map(photoUrl => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.src = photoUrl;
          });
        })
      );

      // Add each image to the GIF
      images.forEach(image => {
        gif.addFrame(image, { delay: 500 }); // 500ms delay between frames
      });

      gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'picapica-animation.gif';
        link.click();
        
        URL.revokeObjectURL(url);
      });

      gif.render();
    } catch (error) {
      console.error('Error creating GIF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="photo-strip-container">
      <div className="photo-strip-wrapper">
        <div 
          ref={stripRef}
          className={`photo-strip ${getLayoutClass(selectedLayout)}`}
          data-layout={selectedLayout}
        >
          <div className={`polaroid-frame ${getFrameClass(frame)}`}>
            <div
              ref={canvasRef}
              className="polaroid-canvas"
              onClick={handleCanvasClick}
            >
              {/* Background scattered stickers */}
              {scatteredStickers.length > 0 && (
                <div className="sticker-bg-layer" aria-hidden="true">
                  {scatteredStickers.map((s) => (
                    <span
                      key={s.id}
                      className="bg-sticker"
                      style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        transform: `rotate(${s.rotate}deg)`,
                        fontSize: `${s.size}px`
                      }}
                    >
                      {s.emoji}
                    </span>
                  ))}
                </div>
              )}

              <div className="photos-container">
                <div className="photos-grid">
              {photos && photos.length > 0 ? (
                photos.map((photo, index) => (
                  <div key={index} className="photo-container">
                    <div className="photo-wrapper">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="photo"
                        onError={(e) => {
                          console.error(`Failed to load photo ${index + 1}:`, photo);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded photo ${index + 1}:`, photo);
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-photos">
                  <p>No photos captured</p>
                </div>
              )}
                </div>
              </div>

              {/* Placed character stickers */}
              {placedStickers.length > 0 && (
                <div className="sticker-char-layer">
                  {placedStickers.map((s) => (
                    <div
                      key={s.id}
                      className="char-sticker"
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                      onMouseDown={(e) => startDrag(s.id, e)}
                      onTouchStart={(e) => startDrag(s.id, e)}
                    >
                      <span className="char-emoji" style={{ fontSize: `${s.size}vmin` }}>{s.emoji}</span>
                      <button className="sticker-remove" onClick={(e) => { e.stopPropagation(); removeSticker(s.id); }} aria-label="Remove sticker">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="polaroid-bottom-space" />
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

          <button 
            onClick={handleGifDownload}
            className="download-btn"
            disabled={isDownloading || !photos || photos.length === 0}
          >
            {isDownloading ? 'Creating GIF...' : 'Download GIF'}
          </button>
        </div>

        {qrCodeUrl && (
          <div className="qr-code-container">
            <h4>Scan to Download</h4>
            <img src={qrCodeUrl} alt="QR Code for download" className="qr-code" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoStrip;
