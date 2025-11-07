#!/bin/bash
# Create simple SVG and convert to PNG using base64

# Create 192x192 icon
cat > icon-192.png.svg << 'SVGEOF'
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#16a34a"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PB</text>
</svg>
SVGEOF

# Create 512x512 icon
cat > icon-512.png.svg << 'SVGEOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#16a34a"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="220" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PB</text>
</svg>
SVGEOF

echo "SVG files created. Open generate-icons.html in browser to download PNG versions."
