import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetUrl = process.argv[2] || 'https://www.gressandhy.com/';
const outputDir = path.resolve(__dirname, '../assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateQRCodes() {
  console.log(`Generating permanent QR codes for: ${targetUrl}`);

  // 1. Classic High-Res PNG (1024x1024 px, Level H - 30% error correction)
  const classicPngPath = path.join(outputDir, 'qr-code.png');
  await QRCode.toFile(classicPngPath, targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 1024,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  console.log(`Created: ${classicPngPath}`);

  // 2. Vector SVG (Infinite scalability for print, cards, CV)
  const classicSvgPath = path.join(outputDir, 'qr-code.svg');
  await QRCode.toFile(classicSvgPath, targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  console.log(`Created: ${classicSvgPath}`);

  // 3. Dark Theme High-Res PNG (Aesthetic dark mode #0d0d0d with white code)
  const darkPngPath = path.join(outputDir, 'qr-code-dark.png');
  await QRCode.toFile(darkPngPath, targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 1024,
    margin: 2,
    color: {
      dark: '#ffffff',
      light: '#0d0d0d'
    }
  });
  console.log(`Created: ${darkPngPath}`);

  // 4. Dark Theme Vector SVG
  const darkSvgPath = path.join(outputDir, 'qr-code-dark.svg');
  await QRCode.toFile(darkSvgPath, targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    color: {
      dark: '#ffffff',
      light: '#0d0d0d'
    }
  });
  console.log(`Created: ${darkSvgPath}`);

  // 5. Transparent Background PNG (Useful for overlaying on mockups or backgrounds)
  const transparentPngPath = path.join(outputDir, 'qr-code-transparent.png');
  await QRCode.toFile(transparentPngPath, targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 1024,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#00000000'
    }
  });
  console.log(`Created: ${transparentPngPath}`);

  console.log('All permanent QR codes generated successfully!');
}

generateQRCodes().catch(err => {
  console.error('Error generating QR codes:', err);
  process.exit(1);
});
