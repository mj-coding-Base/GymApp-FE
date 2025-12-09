#!/usr/bin/env node
/**
 * Comprehensive fix for all native binaries
 * Fixes: lightningcss, @tailwindcss/oxide, and other native dependencies
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

const platform = os.platform();
const arch = os.arch();

console.log('🔧 Fixing all native binaries...');
console.log(`Platform: ${platform} (${arch})\n`);

let allFixed = true;

// Fix 1: lightningcss
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1️⃣  Fixing lightningcss...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const lightningcssDir = path.join(process.cwd(), 'node_modules', 'lightningcss');
const lightningcssBinary = `lightningcss.linux-${arch}-gnu.node`;
const lightningcssDst = path.join(lightningcssDir, lightningcssBinary);

if (fs.existsSync(lightningcssDir)) {
  // Find and copy lightningcss binary
  function findLightningcssBinary(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const result = findLightningcssBinary(fullPath);
          if (result) return result;
        } else if (entry.name.endsWith('.node') && entry.name.includes('lightningcss') && entry.name.includes('linux')) {
          return fullPath;
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  }
  
  const foundBinary = findLightningcssBinary(lightningcssDir);
  if (foundBinary) {
    try {
      fs.copyFileSync(foundBinary, lightningcssDst);
      if (platform !== 'win32') {
        fs.chmodSync(lightningcssDst, 0o755);
      }
      console.log(`✅ lightningcss binary fixed`);
      console.log(`   Source: ${path.relative(process.cwd(), foundBinary)}`);
      console.log(`   Target: ${path.relative(process.cwd(), lightningcssDst)}`);
    } catch (e) {
      console.error(`❌ Failed to copy lightningcss: ${e.message}`);
      allFixed = false;
    }
  } else {
    console.log('⚠️  lightningcss binary not found (may be OK if not used)');
  }
} else {
  console.log('⚠️  lightningcss not installed');
}

// Fix 2: @tailwindcss/oxide
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('2️⃣  Fixing @tailwindcss/oxide...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// @tailwindcss/oxide requires platform-specific optional dependencies
// These are packages like @tailwindcss/oxide-linux-x64-gnu
const rootDir = process.cwd();
const oxideDir = path.join(rootDir, 'node_modules', '@tailwindcss', 'oxide');

if (fs.existsSync(oxideDir)) {
  // Determine the correct platform package
  let platformPackage;
  if (platform === 'linux') {
    platformPackage = `@tailwindcss/oxide-linux-${arch}-gnu`;
  } else if (platform === 'win32') {
    platformPackage = `@tailwindcss/oxide-win32-${arch}-msvc`;
  } else if (platform === 'darwin') {
    platformPackage = `@tailwindcss/oxide-darwin-${arch}`;
  } else {
    platformPackage = `@tailwindcss/oxide-linux-${arch}-gnu`; // Default to Linux
  }
  
  // Check if already installed
  const platformPackageDir = path.join(rootDir, 'node_modules', platformPackage);
  if (fs.existsSync(platformPackageDir)) {
    console.log(`✅ ${platformPackage} is already installed`);
  } else {
    console.log(`Installing ${platformPackage}...`);
    
    try {
      // Try installing the specific platform package
      execSync(`npm install --no-save --legacy-peer-deps ${platformPackage} 2>&1`, {
        cwd: rootDir,
        stdio: 'inherit'
      });
      console.log(`✅ ${platformPackage} installed successfully`);
    } catch (e) {
      console.log('⚠️  Direct package install failed, trying with --include=optional...');
      try {
        // Alternative: install all optional dependencies
        execSync('npm install --no-save --legacy-peer-deps --include=optional 2>&1', {
          cwd: rootDir,
          stdio: 'inherit'
        });
        console.log('✅ Optional dependencies installed');
      } catch (e2) {
        console.error('❌ Failed to install @tailwindcss/oxide dependencies');
        console.error('   Error:', e2.message);
        allFixed = false;
      }
    }
    
    // Verify installation
    if (fs.existsSync(platformPackageDir)) {
      console.log(`✅ Verified: ${platformPackage} is installed`);
    } else {
      console.log(`⚠️  Warning: ${platformPackage} directory not found after install`);
      allFixed = false;
    }
  }
} else {
  console.log('⚠️  @tailwindcss/oxide not found (may not be installed)');
}

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (allFixed) {
  console.log('✅ Native binary fixes completed!');
  process.exit(0);
} else {
  console.log('⚠️  Some fixes had issues, but build may still work');
  process.exit(0); // Don't fail - let the build try
}

