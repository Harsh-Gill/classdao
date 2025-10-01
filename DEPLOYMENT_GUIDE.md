# 🚀 Deployment Guide: Base Sepolia + Vercel

## Part 1: Deploy Smart Contracts to Base Sepolia Testnet

### Step 1: Set Up Your Private Key

You mentioned you have a testnet account with funds. Let's import it securely:

```bash
cd packages/hardhat
yarn account:import
```

When prompted, paste your private key. This will encrypt it and store it in `.env`.

**Alternative: Manual Setup**

If you prefer to set it manually, create/edit `packages/hardhat/.env`:

```bash
# packages/hardhat/.env
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF
```

⚠️ **Important**: Never commit your `.env` file! It's already in `.gitignore`.

### Step 2: Verify You Have Base Sepolia ETH

Check your balance at: https://sepolia.basescan.org/address/YOUR_ADDRESS

If you need testnet ETH:
- Get Sepolia ETH from https://www.alchemy.com/faucets/ethereum-sepolia
- Bridge to Base Sepolia at https://bridge.base.org/deposit

### Step 3: Deploy Contracts to Base Sepolia

From the root directory:

```bash
yarn deploy --network baseSepolia
```

This will:
1. ✅ Compile all contracts
2. ✅ Deploy StudentNFT, PointsManager, DiscussionForum, WikipediaManager, ClassDAO
3. ✅ Set up all contract relationships and authorizations
4. ✅ Generate TypeScript ABIs
5. ✅ Update `packages/nextjs/contracts/deployedContracts.ts` with Base Sepolia addresses

### Step 4: Verify Deployment

After deployment completes, you'll see contract addresses. Example:
```
📝 Contract Addresses:
   StudentNFT: 0x1234...
   PointsManager: 0x5678...
   DiscussionForum: 0x9abc...
   WikipediaManager: 0xdef0...
   ClassDAO: 0x1111...
```

Check them on Base Sepolia Explorer: https://sepolia.basescan.org/

### Step 5: (Optional) Verify Contracts on BaseScan

To verify your contracts for transparency:

1. Get a BaseScan API key from https://basescan.org/myapikey

2. Add to `packages/hardhat/.env`:
```bash
ETHERSCAN_V2_API_KEY=YOUR_BASESCAN_API_KEY
```

3. Verify contracts:
```bash
cd packages/hardhat
yarn hardhat verify --network baseSepolia DEPLOYED_CONTRACT_ADDRESS
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

Edit `packages/nextjs/scaffold.config.ts`:

```typescript
import * as chains from "viem/chains";

const scaffoldConfig = {
  // Change from hardhat to baseSepolia
  targetNetworks: [chains.baseSepolia],
  
  pollingInterval: 30000,
  
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
  
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  
  // Allow burner wallet on testnet too (optional)
  onlyLocalBurnerWallet: false,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
```

### Step 2: Test Locally with Base Sepolia

Before deploying, test that everything works:

```bash
yarn start
```

- Connect your wallet (MetaMask/Rainbow)
- Switch to Base Sepolia network
- Mint an NFT and test all features

### Step 3: Commit Your Changes

```bash
git add .
git commit -m "Configure for Base Sepolia deployment"
git push origin main
```

### Step 4: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. **Go to https://vercel.com and sign in**

2. **Click "Add New" → "Project"**

3. **Import your Git repository**
   - Connect GitHub account
   - Select your `classdao` repository

4. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: `packages/nextjs` ⚠️ **IMPORTANT!**
   - Build Command: `yarn build`
   - Output Directory: `.next`
   - Install Command: `yarn install`

5. **Environment Variables (Optional but recommended)**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
   ```

6. **Click "Deploy"** 🚀

#### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the nextjs directory
cd packages/nextjs
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? classdao (or your choice)
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

### Step 5: Configure Custom Domain (Optional)

In Vercel Dashboard:
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 🎉 Post-Deployment Checklist

### Verify Everything Works

- [ ] Visit your Vercel URL (e.g., `classdao.vercel.app`)
- [ ] Check that it connects to Base Sepolia
- [ ] Mint a test NFT with your pet
- [ ] Create a discussion post (triggers evolution to Level 2)
- [ ] Create and vote on a DAO proposal (triggers evolution to Level 3)
- [ ] Create a wiki page and get 5 likes (triggers evolution to Level 4)

### Share Your DApp

- [ ] Contract addresses on BaseScan
- [ ] Frontend URL on Vercel
- [ ] GitHub repository (make it public!)

---

## 🐛 Troubleshooting

### "Insufficient funds" error
- Check Base Sepolia balance
- Get more from faucet

### "Network mismatch" in frontend
- Make sure `scaffold.config.ts` has `chains.baseSepolia`
- Clear browser cache and reconnect wallet

### Vercel build fails
- Ensure Root Directory is set to `packages/nextjs`
- Check build logs for specific errors
- Verify all dependencies are in `package.json`

### Contracts not showing in frontend
- Check `deployedContracts.ts` has Base Sepolia (chain ID: 84532)
- Redeploy contracts if addresses are wrong

---

## 📚 Useful Links

- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Base Sepolia Bridge**: https://bridge.base.org/deposit
- **Base Docs**: https://docs.base.org/
- **Vercel Docs**: https://vercel.com/docs
- **Scaffold-ETH-2 Docs**: https://docs.scaffoldeth.io/

---

## 🎮 Next Steps

After successful deployment:

1. **Test thoroughly** - Have friends test all features
2. **Monitor contracts** - Watch BaseScan for transactions
3. **Gather feedback** - Improve based on user experience
4. **Add features** - Build more gamification elements
5. **Go to mainnet** - Deploy to Base mainnet when ready!

Good luck with your deployment! 🚀✨
