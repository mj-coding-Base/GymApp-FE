# Quick Nginx Fix for Static Files 404 and MIME Type Issues

## The Problem
- Static files return 404
- JavaScript files have MIME type `text/plain` instead of `application/javascript`
- This is an **Nginx configuration issue**, not a Next.js issue

## Quick Fix

### Step 1: Check Current Nginx Config

```bash
sudo cat /etc/nginx/sites-available/payzhe.fit
# OR
sudo cat /etc/nginx/sites-enabled/payzhe.fit
```

### Step 2: Update Nginx Configuration

Edit the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/payzhe.fit
```

Use this configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name payzhe.fit www.payzhe.fit;

    ssl_certificate /path/to/your/cert.crt;
    ssl_certificate_key /path/to/your/key.key;

    # Important: Proxy everything to Next.js
    # Next.js will handle static files correctly
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Step 3: Test and Reload

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

## Why This Works

Next.js automatically serves static files with correct MIME types. By proxying everything to Next.js (including `/_next/static/*`), Nginx doesn't need to handle MIME types - Next.js does it correctly.

## Verify Fix

```bash
# Test static file
curl -I https://payzhe.fit/_next/static/chunks/framework-*.js

# Should return:
# HTTP/2 200
# Content-Type: application/javascript; charset=utf-8
```

## If Still Not Working

1. **Check if Next.js is serving files locally**:
   ```bash
   curl http://localhost:3002/_next/static/chunks/framework-*.js
   ```

2. **Check if build exists**:
   ```bash
   ls -la /srv/gymapp-fe/.next/static/
   ```

3. **Rebuild if needed**:
   ```bash
   cd /srv/gymapp-fe
   npm run build
   pm2 restart gymapp-fe
   ```

