# PWA Icon Generation

The app requires two PNG icons for PWA installation:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Quick Option: Use the HTML Generator

1. Open `public/generate-icons.html` in your browser
2. Click "Download icon-192.png" and "Download icon-512.png"
3. Save both files to the `public/` directory
4. Done!

## Alternative: Custom Design

If you want a custom icon design:

1. **Online Tools:**
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/

2. **Design Tools:**
   - Figma/Sketch/Photoshop: Create 512x512px design, export as PNG
   - Scale down to 192x192px for the smaller version

3. **ImageMagick (if installed):**
   ```bash
   convert -size 192x192 xc:#16a34a -pointsize 60 -fill white -gravity center -annotate +0+0 "PB" public/icon-192.png
   convert -size 512x512 xc:#16a34a -pointsize 180 -fill white -gravity center -annotate +0+0 "PB" public/icon-512.png
   ```

## Color Scheme

Use the app's theme color: `#16a34a` (green)

