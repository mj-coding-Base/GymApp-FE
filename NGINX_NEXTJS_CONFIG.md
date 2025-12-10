# Nginx Configuration for Next.js with PM2

## Problem
Static files returning 404 and wrong MIME types (`text/plain` instead of `application/javascript`).

## Root Cause
Nginx is not properly configured to:
1. Proxy requests to Next.js (port 3002)
2. Serve static files with correct MIME types
3. Handle Next.js special routes (`/_next/static/*`)

## Nginx Configuration

Create or update `/etc/nginx/sites-available/payzhe.fit`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name payzhe.fit www.payzhe.fit;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name payzhe.fit www.payzhe.fit;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/payzhe.fit.access.log;
    error_log /var/log/nginx/payzhe.fit.error.log;

    # Increase body size for file uploads
    client_max_body_size 10M;

    # Proxy settings
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

    # Serve static files directly from Next.js (IMPORTANT!)
    # Next.js serves static files from /_next/static/
    location /_next/static/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        add_header Cache-Control "public, max-age=31536000, immutable";
        
        # Ensure correct MIME types
        types {
            application/javascript js;
            text/css css;
            image/svg+xml svg;
            application/json json;
        }
    }

    # Serve other static files
    location /static/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Serve images
    location /images/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Serve favicon and other root static files
    location ~* \.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy all other requests to Next.js
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Apply Configuration

```bash
# Create symlink if needed
sudo ln -s /etc/nginx/sites-available/payzhe.fit /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Alternative: Simpler Configuration

If the above doesn't work, try this simpler version:

```nginx
server {
    listen 443 ssl http2;
    server_name payzhe.fit www.payzhe.fit;

    ssl_certificate /path/to/cert.crt;
    ssl_certificate_key /path/to/key.key;

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
    }
}
```

## Verify Static Files Are Being Served

After configuring Nginx:

```bash
# Test static file access
curl -I https://payzhe.fit/_next/static/chunks/framework-b9fd9bcc3ecde907.js

# Should return:
# HTTP/2 200
# Content-Type: application/javascript
```

## Troubleshooting

### Static files still 404

1. **Check if Next.js is serving them**:
   ```bash
   curl http://localhost:3002/_next/static/chunks/framework-b9fd9bcc3ecde907.js
   ```

2. **Check if .next/static exists**:
   ```bash
   ls -la /srv/gymapp-fe/.next/static/
   ```

3. **Rebuild if needed**:
   ```bash
   cd /srv/gymapp-fe
   npm run build
   ```

### Wrong MIME types

The issue is usually Nginx not recognizing the file types. The configuration above should fix this.

### 500 Internal Server Error

Check PM2 logs:
```bash
pm2 logs gymapp-fe --lines 50
```

Check if app is running:
```bash
pm2 status
curl http://localhost:3002
```

