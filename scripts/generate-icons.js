const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SPLASH_SIZES = [
  { width: 1125, height: 2436 }, // iPhone X
  { width: 1242, height: 2688 }, // iPhone XS Max
];

// Ensure directories exist
const iconsDir = path.join(__dirname, '../public/icons');
const splashDir = path.join(__dirname, '../public/splash');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(splashDir)) fs.mkdirSync(splashDir, { recursive: true });

// Generate app icons
async function generateIcons() {
  for (const size of ICON_SIZES) {
    const baseIcon = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 122, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${size}" height="${size}" fill="none"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="white"/>
          <path d="M${size/2} ${size*0.25} L${size/2} ${size/2} L${size*0.7} ${size/2}" stroke="white" stroke-width="${size*0.08}" fill="none" stroke-linecap="round"/>
        </svg>`),
      top: 0,
      left: 0,
    }]);

    await baseIcon.toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
  }
}

// Generate splash screens
async function generateSplashScreens() {
  for (const size of SPLASH_SIZES) {
    const splashScreen = sharp({
      create: {
        width: size.width,
        height: size.height,
        channels: 4,
        background: { r: 0, g: 122, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${size.width}" height="${size.height}" fill="none"/>
          <circle cx="${size.width/2}" cy="${size.height/2}" r="200" fill="white"/>
          <path d="M${size.width/2} ${size.height/2-136} L${size.width/2} ${size.height/2} L${size.width/2+104} ${size.height/2}" stroke="white" stroke-width="40" fill="none" stroke-linecap="round"/>
        </svg>`),
      top: 0,
      left: 0,
    }]);

    await splashScreen.toFile(path.join(splashDir, `launch-${size.width}x${size.height}.png`));
  }
}

Promise.all([generateIcons(), generateSplashScreens()])
  .then(() => console.log('Generated all icons and splash screens'))
  .catch(console.error); 