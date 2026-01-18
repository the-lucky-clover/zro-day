#!/bin/bash
# Manual deployment script for GitHub Pages
# This script builds the app and can be used if the GitHub Actions workflow isn't working

set -e

echo "🚀 Building Zro-Day webapp for GitHub Pages deployment..."

# Navigate to webapp directory
cd "Zro-Day Research Labs/webapp/zro-day-webapp"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install --frozen-lockfile
fi

# Build the app
echo "🔨 Building production bundle..."
pnpm build

echo "✅ Build complete! Output is in dist/ folder"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Go to Settings → Pages on GitHub"
echo "2. Set Source to 'GitHub Actions'"
echo "3. The workflow will deploy automatically on next push"
echo ""
echo "Or manually trigger the workflow:"
echo "1. Go to Actions tab"
echo "2. Select 'Deploy to GitHub Pages'"
echo "3. Click 'Run workflow'"
echo ""
echo "Your site will be available at: https://the-lucky-clover.github.io/zro-day/"
