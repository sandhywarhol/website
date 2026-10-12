import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function copyAssetsPlugin() {
  return {
    name: 'copy-assets-dir',
    closeBundle() {
      const srcDir = resolve(__dirname, 'assets');
      const destDir = resolve(__dirname, 'dist/assets');
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, destDir, { recursive: true });
        console.log('[copy-assets-dir] Successfully mirrored assets folder to dist/assets');
      }
    }
  };
}

export default defineConfig({
  plugins: [copyAssetsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        brand: resolve(__dirname, 'brand.html'),
        howIWork: resolve(__dirname, 'how-i-work.html')
      }
    }
  }
});
