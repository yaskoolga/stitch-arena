const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/favicon.svg');
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Created icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to create icon-${size}x${size}.png:`, error.message);
    }
  }

  // Create apple-touch-icon (180x180 is standard for iOS)
  const appleTouchIconPath = path.join(__dirname, '../public/apple-touch-icon.png');
  try {
    await sharp(svgPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appleTouchIconPath);

    console.log(`✅ Created apple-touch-icon.png`);
  } catch (error) {
    console.error(`❌ Failed to create apple-touch-icon.png:`, error.message);
  }

  console.log('\n🎉 Icon generation complete!');
}

generateIcons().catch(console.error);
