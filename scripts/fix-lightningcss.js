#!/usr/bin/env node
/**
 * Fix lightningcss binary location
 * This script finds the lightningcss native binary and copies it to the expected location
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const lightningcssDir = path.join(process.cwd(), 'node_modules', 'lightningcss');
const dst = path.join(lightningcssDir, 'lightningcss.linux-x64-gnu.node');

console.log('🔧 Fixing lightningcss binary...');
console.log('Target location:', dst);

// Check if lightningcss is installed
if (!fs.existsSync(lightningcssDir)) {
  console.log('⚠️  lightningcss not installed, skipping fix');
  process.exit(0);
}

let found = false;

// Strategy 1: Check common locations
const possibleSources = [
  path.join(lightningcssDir, 'linux-x64-gnu', 'lightningcss.linux-x64-gnu.node'),
  path.join(lightningcssDir, 'node_modules', 'lightningcss-linux-x64-gnu', 'lightningcss.linux-x64-gnu.node'),
  path.join(lightningcssDir, 'lightningcss.linux-x64-gnu.node'), // Already in place
];

for (const src of possibleSources) {
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dst) || fs.statSync(src).mtime > fs.statSync(dst).mtime) {
      // Ensure destination directory exists
      const dstDir = path.dirname(dst);
      if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
      }
      fs.copyFileSync(src, dst);
      fs.chmodSync(dst, 0o755);
      console.log('✓ Fixed lightningcss binary from:', path.relative(process.cwd(), src));
      found = true;
      break;
    } else {
      console.log('✓ lightningcss binary already in place');
      found = true;
      break;
    }
  }
}

// Strategy 2: Search recursively for the binary
if (!found) {
  try {
    const result = execSync(
      'find node_modules/lightningcss -name "lightningcss.linux-x64-gnu.node" -type f 2>/dev/null | head -1',
      { encoding: 'utf8', cwd: process.cwd() }
    );
    const foundPath = result.trim();
    if (foundPath && fs.existsSync(foundPath)) {
      const dstDir = path.dirname(dst);
      if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
      }
      fs.copyFileSync(foundPath, dst);
      fs.chmodSync(dst, 0o755);
      console.log('✓ Fixed lightningcss binary from:', foundPath);
      found = true;
    }
  } catch (e) {
    // find command failed, continue to next strategy
  }
}

// Strategy 3: Try reinstalling lightningcss-linux-x64-gnu
if (!found) {
  console.log('⚠️  Binary not found, trying to reinstall lightningcss native package...');
  try {
    const lightningcssPkgPath = path.join(lightningcssDir, 'package.json');
    if (fs.existsSync(lightningcssPkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(lightningcssPkgPath, 'utf8'));
      const optionalDeps = pkg.optionalDependencies || {};
      
      // Try installing the platform-specific package
      execSync('npm install --no-save --legacy-peer-deps lightningcss-linux-x64-gnu', {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      // Check again
      const newBinaryPath = path.join(
        lightningcssDir,
        'node_modules',
        'lightningcss-linux-x64-gnu',
        'lightningcss.linux-x64-gnu.node'
      );
      
      if (fs.existsSync(newBinaryPath)) {
        const dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) {
          fs.mkdirSync(dstDir, { recursive: true });
        }
        fs.copyFileSync(newBinaryPath, dst);
        fs.chmodSync(dst, 0o755);
        console.log('✓ Fixed lightningcss binary after reinstall');
        found = true;
      }
    }
  } catch (e) {
    console.log('⚠️  Reinstall attempt failed:', e.message);
  }
}

// Strategy 4: Check if binary exists but in wrong location structure
if (!found) {
  try {
    // List all .node files in lightningcss
    const allNodeFiles = execSync(
      'find node_modules/lightningcss -name "*.node" -type f 2>/dev/null',
      { encoding: 'utf8', cwd: process.cwd() }
    ).trim().split('\n').filter(Boolean);
    
    if (allNodeFiles.length > 0) {
      console.log('Found .node files:', allNodeFiles);
      // Try the first one
      const firstNode = allNodeFiles[0];
      if (firstNode.includes('linux-x64')) {
        const dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) {
          fs.mkdirSync(dstDir, { recursive: true });
        }
        fs.copyFileSync(firstNode, dst);
        fs.chmodSync(dst, 0o755);
        console.log('✓ Fixed lightningcss binary from:', firstNode);
        found = true;
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

if (!found) {
  console.log('❌ ERROR: lightningcss binary not found!');
  console.log('Lightningcss directory structure:');
  try {
    execSync('ls -la node_modules/lightningcss/ 2>/dev/null | head -20', { stdio: 'inherit' });
  } catch (e) {
    // Ignore
  }
  console.log('\nTrying to find any .node files:');
  try {
    execSync('find node_modules/lightningcss -name "*.node" -ls 2>/dev/null', { stdio: 'inherit' });
  } catch (e) {
    // Ignore
  }
  process.exit(1);
} else {
  // Verify the binary exists and is executable
  if (fs.existsSync(dst)) {
    const stats = fs.statSync(dst);
    console.log('✅ lightningcss binary verified at:', dst);
    console.log('   Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
  } else {
    console.log('❌ ERROR: Binary was supposed to be copied but file not found!');
    process.exit(1);
  }
}

