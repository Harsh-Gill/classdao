# 🚀 Vercel Deployment Configuration Guide

## CRITICAL: Root Directory Setting

Your Next.js app is in a monorepo structure. You **MUST** configure Vercel correctly:

### Step 1: Configure Root Directory in Vercel Dashboard

1. Go to your Vercel project settings: https://vercel.com/[your-username]/[project-name]/settings
2. Go to **"General"** settings
3. Find **"Root Directory"** section
4. Click **"Edit"**
5. Enter: `packages/nextjs`
6. Click **"Save"**

### Step 2: Configure Build Settings

In the same settings page, under **"Build & Development Settings"**:

**Framework Preset:** Next.js
**Build Command:** Leave as default (or use: `yarn build`)
**Output Directory:** Leave as default (`.next`)
**Install Command:** Leave as default (or use: `yarn install`)

### Alternative: Deploy via CLI with Correct Settings

If you prefer to use Vercel CLI:

```bash
cd packages/nextjs
vercel --prod
```

This automatically uses the correct directory.

## Current Configuration Files

### `packages/nextjs/vercel.json`
```json
{
  "buildCommand": "cd ../.. && yarn install --mode update-lockfile && yarn build",
  "installCommand": "cd ../.. && yarn install --mode update-lockfile"
}
```

This tells Vercel to:
1. Go to the root directory (`../..`)
2. Install all dependencies with `yarn install --mode update-lockfile`
3. Build the entire monorepo (which includes the Next.js app)

### `.yarnrc.yml` (root)
```yaml
enableImmutableInstalls: false
```

This allows Yarn to update the lockfile during install (needed for Vercel).

## Troubleshooting

### Error: "No Next.js version detected"
**Cause:** Vercel is looking in the wrong directory
**Solution:** Set Root Directory to `packages/nextjs` in Vercel dashboard

### Error: "Command yarn install exited with 1"
**Cause:** Yarn lockfile is immutable by default
**Solution:** Already fixed with `enableImmutableInstalls: false` and `--mode update-lockfile`

### Error: "Module not found"
**Cause:** Dependencies not installed or wrong working directory
**Solution:** Ensure Root Directory is set correctly

## Recommended Vercel Project Settings

```
Framework Preset: Next.js
Root Directory: packages/nextjs  ⚠️ MOST IMPORTANT
Node.js Version: 18.x (or 20.x)
Install Command: yarn install
Build Command: yarn build
Output Directory: .next
```

## Environment Variables (Optional)

Add these in Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id_here
```

## After Configuration

1. **Redeploy**: Go to Deployments → click "..." → "Redeploy"
2. **Watch logs**: Check build logs for any errors
3. **Test**: Once deployed, test the app thoroughly

## Quick Check

Your Vercel deployment URL structure should be:
```
https://your-project.vercel.app
```

And it should:
- ✅ Connect to Base Sepolia network
- ✅ Show your deployed contracts
- ✅ Allow wallet connection
- ✅ Display pixel pets and NFTs

---

**Need help?** Check the Vercel build logs for specific errors!
