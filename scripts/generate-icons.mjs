import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Creates a simple emerald green icon with "M" text
// Replace with your actual logo SVG
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#065f46"/>
  <text x="256" y="340" 
    font-family="Georgia, serif" 
    font-size="300" 
    font-weight="900"
    text-anchor="middle" 
    fill="white"
    font-style="italic">M</text>
</svg>`;

const iconBuffer = Buffer.from(svgIcon);

for (const size of sizes) {
  await sharp(iconBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated ${size}x${size}`);
}

console.log('All icons generated in public/icons/');