#!/bin/bash
# Render build script for the Angular static site.
# Render injects API_URL as an environment variable before this runs.
# Set API_URL in the Render dashboard to your backend URL, e.g.:
#   https://logivision-backend.onrender.com/api
set -e

echo "🔧 Injecting API_URL: ${API_URL}"

# Replace the %%API_URL%% placeholder in the production environment file
sed -i "s|%%API_URL%%|${API_URL:-http://localhost:8000/api}|g" \
    src/environments/environment.prod.ts

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building Angular app..."
npm run build

# RenderMode.Client outputs index.csr.html; rename to index.html so Render's
# SPA rewrite (/* → /index.html) serves the Angular shell correctly.
CSR="dist/damage-detection-frontend/browser/index.csr.html"
IDX="dist/damage-detection-frontend/browser/index.html"
if [ -f "$CSR" ] && [ ! -f "$IDX" ]; then
  mv "$CSR" "$IDX"
  echo "✅ Renamed index.csr.html → index.html"
fi

echo "✅ Build complete"
