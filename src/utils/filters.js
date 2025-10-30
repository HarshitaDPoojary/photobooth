// Filter effects for the camera
export const applyFilter = (context, canvas, filter) => {
  switch (filter) {
    case 'grayscale':
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
      }
      context.putImageData(imageData, 0, 0);
      break;

    case 'sepia':
      const sepiaData = context.getImageData(0, 0, canvas.width, canvas.height);
      const sepiaPixels = sepiaData.data;
      for (let i = 0; i < sepiaPixels.length; i += 4) {
        const r = sepiaPixels[i];
        const g = sepiaPixels[i + 1];
        const b = sepiaPixels[i + 2];
        
        sepiaPixels[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        sepiaPixels[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        sepiaPixels[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
      context.putImageData(sepiaData, 0, 0);
      break;

    case 'vintage':
      context.filter = 'saturate(80%) brightness(110%) contrast(85%)';
      context.drawImage(canvas, 0, 0);
      context.filter = 'none';
      break;

    case 'warm':
      const warmData = context.getImageData(0, 0, canvas.width, canvas.height);
      const warmPixels = warmData.data;
      for (let i = 0; i < warmPixels.length; i += 4) {
        warmPixels[i] = Math.min(255, warmPixels[i] + 20);     // Increase red
        warmPixels[i + 1] = warmPixels[i + 1];                 // Keep green
        warmPixels[i + 2] = Math.max(0, warmPixels[i + 2] - 10); // Decrease blue
      }
      context.putImageData(warmData, 0, 0);
      break;

    case 'cool':
      const coolData = context.getImageData(0, 0, canvas.width, canvas.height);
      const coolPixels = coolData.data;
      for (let i = 0; i < coolPixels.length; i += 4) {
        coolPixels[i] = Math.max(0, coolPixels[i] - 10);     // Decrease red
        coolPixels[i + 1] = coolPixels[i + 1];               // Keep green
        coolPixels[i + 2] = Math.min(255, coolPixels[i + 2] + 20); // Increase blue
      }
      context.putImageData(coolData, 0, 0);
      break;

    case 'none':
    default:
      // No filter applied
      break;
  }
};