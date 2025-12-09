// Script to load .env and start Next.js dev server
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load .env file if it exists
const envPath = join(projectRoot, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    }
  });
}

// Get PORT from environment or default to 3002
const port = process.env.PORT || '3002';

// 🔒 SECURITY: Start Next.js dev server with security limits
// Validate port to prevent command injection
const portNum = parseInt(port, 10);
if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
  console.error('Invalid port number:', port);
  process.exit(1);
}

const args = ['dev', '--turbopack', '-p', port];
// Use shell on Windows (required for npx), but validate all inputs to prevent injection
const child = spawn('npx', ['next', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32', // Required on Windows for npx to work
  cwd: projectRoot
});

child.on('error', (error) => {
  console.error('Error starting Next.js:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

