/**
 * sync-public.js — runs as prebuild and can be run standalone
 * Copies all non-Next.js static app shells into BOTH public/ and dist/
 *
 * WHY BOTH:
 * - public/ feeds Next.js build, ensuring files land in dist/ on Cloudflare
 * - dist/  is committed to git, so it works even if Cloudflare skips the build
 *
 * PROTECTION RULE (enforced in Windsurf rules):
 * Only Claude may modify _onboard.html, _dashboard.html, admin/, functions/
 * This script must never be removed or bypassed.
 */
const fs   = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const SINGLE_FILES = [
  '_onboard.html',
  '_dashboard.html',
  'admin/index.html',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  '404.html',
  '_headers',
  'previews/maciej-misnik/index.html',
  'previews/maciej-misnik/styles.css',
  'previews/maciej-misnik/script.js',
  'previews/maciej-misnik/robots.txt',
  'previews/maciej-misnik/assets/hero.png',
  'previews/maciej-misnik/assets/physicist.png',
  'previews/maciej-misnik/assets/chronometer.png',
  'previews/ballouard/index.html',
  'previews/ballouard/js/main.js',
  'previews/ballouard/styles/main.css',
  'previews/ballouard/styles/main.scss',
];

let count = 0;

for (const file of SINGLE_FILES) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    console.warn('[sync-public] WARNING: source not found:', file);
    continue;
  }
  for (const destDir of ['public', 'dist']) {
    const dst = path.join(root, destDir, file);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
  count++;
}

// Copy functions/ directory to dist/ for Cloudflare Pages Functions
const functionsSrc = path.join(root, '..', 'functions');
const functionsDest = path.join(root, 'dist', 'functions');
if (fs.existsSync(functionsSrc)) {
  console.log('[sync-public] Copying functions/ to dist/functions/...');
  copyDirSync(functionsSrc, functionsDest);
  console.log('[sync-public] ✓ Functions directory synced');
} else {
  console.warn('[sync-public] WARNING: functions/ directory not found at:', functionsSrc);
}

// Copy ballouard assets directory to both public/ and dist/
const ballouardAssetsSrc = path.join(root, 'previews', 'ballouard', 'assets');
if (fs.existsSync(ballouardAssetsSrc)) {
  console.log('[sync-public] Copying ballouard/assets/ to public/ and dist/...');
  for (const destDir of ['public', 'dist']) {
    const ballouardAssetsDest = path.join(root, destDir, 'previews', 'ballouard', 'assets');
    copyDirSync(ballouardAssetsSrc, ballouardAssetsDest);
  }
  console.log('[sync-public] ✓ Ballouard assets directory synced');
} else {
  console.warn('[sync-public] WARNING: ballouard/assets/ directory not found at:', ballouardAssetsSrc);
}

console.log('[sync-public] Synced', count, 'files to public/ and dist/');

// Helper: recursively copy directory
function copyDirSync(src, dest) {
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
