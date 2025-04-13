#!/bin/bash

# Deploy script for The Estate Academy PWA

echo "Building application..."
npm run build

echo "Preparing deployment..."

# Create distribution directory if it doesn't exist
mkdir -p dist

# Ensure service worker and manifest are correctly copied
echo "Copying PWA files..."
cp public/service-worker.js dist/
cp public/manifest.json dist/
cp public/icon-192x192.png dist/
cp public/icon-512x512.png dist/

# Copy .htaccess file for proper routing on Apache servers
cp public/.htaccess dist/

echo "Deployment package prepared successfully!"
echo "Ready to deploy to Debian server. Use: scp -r dist/* user@server:/path/to/webroot/"