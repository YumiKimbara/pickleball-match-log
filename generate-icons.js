const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size / 2.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PB', size / 2, size / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

createIcon(192, 'public/icon-192.png');
createIcon(512, 'public/icon-512.png');

