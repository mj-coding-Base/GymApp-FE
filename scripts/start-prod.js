// Script to load .env and start Next.js production server
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

// Start Next.js production server
const args = ['start', '-p', port];
const child = spawn('npx', ['next', ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: 'production' }
});

child.on('error', (error) => {
  console.error('Error starting Next.js:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

