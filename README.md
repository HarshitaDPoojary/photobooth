# Picapica Photo Booth

## Additional Notes
## Local clone assets

This repository includes a pixel-accurate clone of the Picapica landing page under the route `/clone`.
To make the clone fully offline and exact, the project expects the photostrip image and Montserrat font files to be present under `public/assets` and `public/assets/fonts`.

I've included a small PowerShell helper to download those assets automatically:
1. From the project root run:

```powershell
.\download-assets.ps1
```

This will create:

- `public/assets/picapica-photostrip.png`
- `public/assets/fonts/Montserrat-Regular.ttf`
- `public/assets/fonts/Montserrat-Bold.ttf`

The clone component prefers the local assets at runtime and will fall back to the original remote URLs if the local files are missing.

License / provenance: you confirmed you have permission to use these assets. Keep any required attributions in the UI (the footer credits the original author).
# Picapica Photo Booth

A ReactJS replica of the Picapica Photo Booth website - a web-based photo booth that captures 4 photos and creates custom photo strips with filters and frames.

## Features

- 📸 **Camera Integration**: Uses device camera to capture 4 consecutive photos
- ⏱️ **Countdown Timer**: 3-second countdown before photo sequence
- 🎨 **Photo Filters**: 6 different filters (B&W, Sepia, Vintage, Soft, Noir, Vivid)
- 🖼️ **Frame Options**: 5 different frame styles (Classic, Colorful, Elegant, Fun, Vintage)
- 🏷️ **Themed Stickers**: Preview of sticker options (Girlypop, Cute, Mofusand, Shin Chan, Miffy)
- 💾 **Download Options**: Download as PNG image or PDF
- 🔒 **Privacy First**: All processing happens locally on your device
- 📱 **Responsive Design**: Works on both desktop and mobile devices

## How It Works

1. **Take Photos**: Position yourself and get ready for 4 quick photos with a countdown timer
2. **Customize**: Choose from various filters, frames, and stickers to personalize your photo strip
3. **Download**: Save your photo strip as a PNG image or PDF to share with friends
4. **Privacy**: All photos are processed locally - nothing is uploaded to servers

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Usage

1. **Start Camera**: Click "Start Camera" and allow camera permissions
2. **Take Photos**: Click "Take 4 Photos" and follow the countdown
3. **Customize**: Use the filter and frame panels to style your photo strip
4. **Download**: Click "Download PNG" or "Download PDF" to save your creation
5. **Retake**: Click "Take New Photos" to start over

## Technical Details

- **React 18**: Modern React with hooks
- **Camera API**: Uses `getUserMedia` for camera access
- **Canvas API**: For photo processing and filter application
- **html2canvas**: For converting the photo strip to image
- **jsPDF**: For PDF generation
- **CSS Grid & Flexbox**: For responsive layout
- **Local Processing**: All image processing happens in the browser

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers with camera support

## Privacy

This application processes all photos locally on your device. No images are uploaded to any servers, ensuring complete privacy and security.

## Development

To build for production:

```bash
npm run build
```

This builds the app for production to the `build` folder.

## License

This project is for educational purposes and is a replica of the Picapica Photo Booth website.
