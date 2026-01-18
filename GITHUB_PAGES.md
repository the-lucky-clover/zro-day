# GitHub Pages Deployment

This webapp is configured to deploy to GitHub Pages automatically.

## Automatic Deployment

The webapp will be automatically deployed to GitHub Pages when you:
- Push to the `main` or `copilot/debug-and-test-iterations` branch
- Manually trigger the workflow from the Actions tab

## Setup Instructions

To enable GitHub Pages for this repository:

1. Go to your repository settings on GitHub
2. Navigate to **Pages** in the left sidebar
3. Under **Build and deployment**, set:
   - **Source**: GitHub Actions
4. The workflow will automatically build and deploy the app

## Accessing the Deployed App

Once deployed, your app will be available at:
```
https://the-lucky-clover.github.io/zro-day/
```

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

If the deployment fails:
1. Check the Actions tab for error logs
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the repository has Pages permissions
4. Check that the base URL in `vite.config.js` matches your repository name
