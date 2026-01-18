# GitHub Pages Deployment

This webapp is configured to deploy to GitHub Pages.

## Quick Start - Manual Deployment

If you're getting a 404 error, follow these steps to deploy manually:

### Step 1: Merge to Main Branch
First, merge this PR to the `main` branch (or create a main branch if it doesn't exist).

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub: https://github.com/the-lucky-clover/zro-day
2. Click **Settings** (top navigation)
3. Click **Pages** (left sidebar)
4. Under **Build and deployment**:
   - Set **Source** to: **GitHub Actions**
5. Save the settings

### Step 3: Trigger Deployment
Once the PR is merged to `main`, the workflow will automatically run. Or you can:
1. Go to the **Actions** tab
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select the branch and click "Run workflow"

The deployment will take 2-3 minutes. Once complete, your site will be live at:
```
https://the-lucky-clover.github.io/zro-day/
```

## Alternative: Deploy from Any Branch

If you want to deploy from this branch without merging:

1. Go to Settings → Pages on GitHub
2. Set **Source** to: **GitHub Actions**
3. The workflow is already configured to deploy from `copilot/debug-and-test-iterations`
4. Push any change to trigger the workflow, or manually trigger it from Actions tab

## Automatic Deployment

The webapp will be automatically deployed to GitHub Pages when you:
- Push to the `main` or `copilot/debug-and-test-iterations` branch
- Manually trigger the workflow from the Actions tab

## Local Development

To run the app locally:
```bash
cd "Zro-Day Research Labs/webapp/zro-day-webapp"
pnpm install
pnpm dev
```

To build for production:
```bash
pnpm build
```

To preview the production build:
```bash
pnpm preview
```

## Configuration

The app is configured with:
- **Base URL**: `/zro-day/` (for GitHub Pages)
- **Build output**: `dist/` directory
- **No Jekyll processing**: `.nojekyll` file included

## Workflow

The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) will:
1. Checkout the code
2. Setup Node.js and pnpm
3. Install dependencies
4. Build the production bundle
5. Deploy to GitHub Pages

## Troubleshooting

### 404 Error
If you see "There isn't a GitHub Pages site here":
- ✅ Ensure GitHub Pages is enabled in Settings → Pages
- ✅ Set Source to "GitHub Actions" (not "Deploy from a branch")
- ✅ Check that the workflow has run successfully in the Actions tab
- ✅ Wait 2-3 minutes after the workflow completes

### Other Issues
1. Check the Actions tab for error logs
2. Ensure the repository has Pages permissions
3. Verify the base URL in `vite.config.js` matches your repository name (`/zro-day/`)
