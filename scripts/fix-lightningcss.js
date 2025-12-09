#!/usr/bin/env node
/**
 * Fix native binary locations for lightningcss and @tailwindcss/oxide
 * This script finds and fixes native binaries for packages that require them
 */

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect platform and architecture
const platform = os.platform();
const arch = os.arch();

// For Docker builds, we always need Linux binary
// For local builds, use platform-specific binary
// Check if we're in Docker or building for production (Linux)
const isDockerBuild = process.env.DOCKER_BUILD === '1' || process.env.NODE_ENV === 'production' || platform === 'linux';

// Determine binary name - prioritize Linux for Docker/production
let binaryName;
let targetPlatform = platform;
if (isDockerBuild || platform === 'linux') {
  binaryName = `lightningcss.linux-${arch}-gnu.node`;
  targetPlatform = 'linux';
} else if (platform === 'win32') {
  binaryName = `lightningcss.win32-${arch}-msvc.node`;
} else if (platform === 'darwin') {
  binaryName = `lightningcss.darwin-${arch}.node`;
} else {
  // Default to Linux
  binaryName = `lightningcss.linux-${arch}-gnu.node`;
  targetPlatform = 'linux';
}

const lightningcssDir = path.join(process.cwd(), 'node_modules', 'lightningcss');
const dst = path.join(lightningcssDir, binaryName);

console.log('🔧 Fixing native binaries (lightningcss & @tailwindcss/oxide)...');
console.log(`Platform: ${platform} (${arch})`);
console.log(`Looking for: ${binaryName}`);
console.log('Target location:', dst);

// Also check for @tailwindcss/oxide
const tailwindcssOxideDir = path.join(process.cwd(), 'node_modules', '@tailwindcss', 'oxide');
let tailwindcssOxideFixed = false;

// Check if lightningcss is installed
if (!fs.existsSync(lightningcssDir)) {
  console.error('❌ ERROR: lightningcss not installed!');
  console.error('Run: npm install --legacy-peer-deps');
  process.exit(1);
}

let found = false;
let foundPath = null;

// Strategy 1: Check common locations (try both current platform and Linux)
const possibleSources = [];

// Always try Linux first (for Docker/production)
possibleSources.push(
  path.join(lightningcssDir, `linux-${arch}-gnu`, `lightningcss.linux-${arch}-gnu.node`),
  path.join(lightningcssDir, 'node_modules', `lightningcss-linux-${arch}-gnu`, `lightningcss.linux-${arch}-gnu.node`),
  path.join(lightningcssDir, `lightningcss-linux-${arch}-gnu`, `lightningcss.linux-${arch}-gnu.node`)
);

// Also try current platform
if (platform === 'win32') {
  possibleSources.push(
    path.join(lightningcssDir, `win32-${arch}-msvc`, `lightningcss.win32-${arch}-msvc.node`),
    path.join(lightningcssDir, 'node_modules', `lightningcss-win32-${arch}-msvc`, `lightningcss.win32-${arch}-msvc.node`)
  );
} else if (platform === 'darwin') {
  possibleSources.push(
    path.join(lightningcssDir, `darwin-${arch}`, `lightningcss.darwin-${arch}.node`),
    path.join(lightningcssDir, 'node_modules', `lightningcss-darwin-${arch}`, `lightningcss.darwin-${arch}.node`)
  );
}

console.log('\n📦 Checking common locations...');
for (const src of possibleSources) {
  if (fs.existsSync(src)) {
    console.log(`✓ Found at: ${path.relative(process.cwd(), src)}`);
    foundPath = src;
    found = true;
    break;
  }
}

// Strategy 2: Search recursively using Node.js (cross-platform)
if (!found) {
  console.log('\n🔍 Searching recursively...');
  try {
    function findBinary(dir, targetName) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const result = findBinary(fullPath, targetName);
            if (result) return result;
          } else if (entry.name.endsWith('.node') && entry.name.includes('lightningcss')) {
            // Accept any lightningcss .node file, prioritize Linux
            if (entry.name.includes('linux') || entry.name === targetName) {
              return fullPath;
            }
          }
        }
      } catch (e) {
        // Ignore permission errors
      }
      return null;
    }
    
    const foundPathResult = findBinary(lightningcssDir, binaryName);
    if (foundPathResult && fs.existsSync(foundPathResult)) {
      console.log(`✓ Found at: ${path.relative(process.cwd(), foundPathResult)}`);
      foundPath = foundPathResult;
      found = true;
    }
  } catch (e) {
    console.log('Search failed:', e.message);
  }
}

// Strategy 3: Check all subdirectories for any .node file
if (!found) {
  console.log('\n🔍 Checking all subdirectories...');
  try {
    const files = fs.readdirSync(lightningcssDir);
    for (const file of files) {
      const filePath = path.join(lightningcssDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        const binaryPath = path.join(filePath, binaryName);
        if (fs.existsSync(binaryPath)) {
          console.log(`✓ Found at: ${path.relative(process.cwd(), binaryPath)}`);
          foundPath = binaryPath;
          found = true;
          break;
        }
        // Also check for any .node file in subdirectories (prioritize Linux)
        try {
          const subFiles = fs.readdirSync(filePath);
          // First pass: look for Linux binary
          for (const subFile of subFiles) {
            if (subFile.endsWith('.node') && subFile.includes('lightningcss') && subFile.includes('linux')) {
              const subBinaryPath = path.join(filePath, subFile);
              console.log(`✓ Found Linux binary at: ${path.relative(process.cwd(), subBinaryPath)}`);
              foundPath = subBinaryPath;
              found = true;
              break;
            }
          }
          // Second pass: any lightningcss binary if Linux not found
          if (!found) {
            for (const subFile of subFiles) {
              if (subFile.endsWith('.node') && subFile.includes('lightningcss')) {
                const subBinaryPath = path.join(filePath, subFile);
                console.log(`✓ Found binary at: ${path.relative(process.cwd(), subBinaryPath)}`);
                foundPath = subBinaryPath;
                found = true;
                break;
              }
            }
          }
          if (found) break;
        } catch (e) {
          // Ignore subdirectory read errors
        }
      }
    }
  } catch (e) {
    console.error('Error reading directory:', e.message);
  }
}

// Strategy 4: Try reinstalling lightningcss optional dependencies
if (!found) {
  console.log('\n⚠️  Binary not found. Attempting to install optional dependencies...');
  try {
    process.chdir(path.join(lightningcssDir));
    execSync('npm install --no-save --legacy-peer-deps --include=optional 2>&1', {
      stdio: 'inherit',
      cwd: lightningcssDir
    });
    process.chdir(process.cwd());
    
    // Search again after reinstall using Node.js (cross-platform)
    function findBinaryAfterReinstall(dir, targetName) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const result = findBinaryAfterReinstall(fullPath, targetName);
            if (result) return result;
          } else if (entry.name.endsWith('.node') && entry.name.includes('lightningcss')) {
            // Prioritize Linux binary
            if (entry.name.includes('linux') || entry.name === targetName) {
              return fullPath;
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
      return null;
    }
    
    const foundPathResult = findBinaryAfterReinstall(lightningcssDir, binaryName);
    if (foundPathResult && fs.existsSync(foundPathResult)) {
      console.log(`✓ Found after reinstall at: ${path.relative(process.cwd(), foundPathResult)}`);
      foundPath = foundPathResult;
      found = true;
    }
  } catch (e) {
    console.error('Reinstall failed:', e.message);
  }
}

// Copy binary to expected location
if (found && foundPath) {
  try {
    // Determine final destination - always use Linux binary name for Docker compatibility
    // But on Windows, we might copy Windows binary to Linux name for Docker prep
    const finalDst = isDockerBuild || platform === 'linux' 
      ? path.join(lightningcssDir, `lightningcss.linux-${arch}-gnu.node`)
      : dst;
    
    // Ensure destination directory exists
    const dstDir = path.dirname(finalDst);
    if (!fs.existsSync(dstDir)) {
      fs.mkdirSync(dstDir, { recursive: true });
    }

    // Copy the binary
    fs.copyFileSync(foundPath, finalDst);
    // chmod only works on Unix systems
    if (platform !== 'win32') {
      try {
        fs.chmodSync(finalDst, 0o755);
      } catch (e) {
        // Ignore chmod errors on Windows
      }
    }
    
    console.log(`\n✅ Successfully copied binary to: ${path.relative(process.cwd(), finalDst)}`);
    console.log(`   Source: ${path.relative(process.cwd(), foundPath)}`);
    
    // Verify it exists
    if (fs.existsSync(finalDst)) {
      const stats = fs.statSync(finalDst);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ lightningcss binary is ready!');
      process.exit(0);
    } else {
      console.error('❌ ERROR: Copy failed - file not found at destination');
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ ERROR copying binary:', e.message);
    process.exit(1);
  }
} else {
  // On Windows, if binary not found, it's OK for local dev (Docker will handle it)
  if (platform === 'win32') {
    console.warn('\n⚠️  WARNING: lightningcss binary not found on Windows.');
    console.warn('This is OK for local development. Docker build will install Linux binary.');
    console.warn('If you need it locally, run: npm install --legacy-peer-deps --include=optional');
    process.exit(0); // Don't fail on Windows
  } else {
    console.error('\n❌ ERROR: lightningcss binary not found!');
    console.error('\nTroubleshooting:');
    console.error('1. Make sure you ran: npm install --legacy-peer-deps --include=optional');
    console.error('2. Check if lightningcss is in package.json dependencies');
    console.error('3. Try: cd node_modules/lightningcss && npm install --include=optional');
    console.error('4. Check lightningcss directory structure:');
    console.error(`   ls -la ${lightningcssDir}`);
    process.exit(1);
  }
}

