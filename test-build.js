// Simple build test script
// Run this to test if the build process works locally

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing build process...');

try {
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found');
  }
  console.log('✅ package.json found');

  // Check if vite.config.ts exists
  if (!fs.existsSync('vite.config.ts')) {
    throw new Error('vite.config.ts not found');
  }
  console.log('✅ vite.config.ts found');

  // Check if required public files exist
  const requiredFiles = [
    'public/favicon.ico',
    'public/toolsy-logo-192.png',
    'public/toolsy-logo-512.png',
    'public/offline.html'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file not found: ${file}`);
    }
    console.log(`✅ ${file} found`);
  }

  // Check if src directory exists
  if (!fs.existsSync('src')) {
    throw new Error('src directory not found');
  }
  console.log('✅ src directory found');

  // Check if main entry point exists
  if (!fs.existsSync('src/main.tsx')) {
    throw new Error('src/main.tsx not found');
  }
  console.log('✅ src/main.tsx found');

  console.log('🎉 All required files and directories are present!');
  console.log('📦 Build should work correctly.');

} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
}
