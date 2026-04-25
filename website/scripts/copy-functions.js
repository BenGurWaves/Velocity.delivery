/**
 * copy-functions.js — runs AFTER next build
 * Copies functions/ directory to dist/functions/ for Cloudflare Pages
 * 
 * This MUST run after Next.js build because next build overwrites dist/
 */
const fs   = require('fs');
const path = require('path');

// When run from `cd website && npm run build`, __dirname is website/scripts/
// So we go up ONE level to website/, then to functions/
const websiteRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(websiteRoot, '..');

const functionsSrc = path.join(projectRoot, 'functions');
const functionsDest = path.join(websiteRoot, 'dist', 'functions');

if (fs.existsSync(functionsSrc)) {
  console.log('[copy-functions] Copying functions/ to dist/functions/...');
  copyDirSync(functionsSrc, functionsDest);
  console.log('[copy-functions] ✓ Functions directory synced to dist/');
} else {
  console.error('[copy-functions] ERROR: functions/ directory not found at:', functionsSrc);
  process.exit(1);
}

// Helper: recursively copy directory
function copyDirSync(src, dest) {
  // Remove existing dest to clean up old files
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  fs.mkdirSync(dest, { recursive: true });
  
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
