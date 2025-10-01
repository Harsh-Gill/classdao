# 🚀 Quick Deployment Commands

## Deploy to Base Sepolia

### 1. Import Your Private Key (One-time setup)
```bash
cd packages/hardhat
yarn account:import
# Paste your private key when prompted
```

### 2. Deploy Contracts
```bash
# From root directory
yarn deploy --network baseSepolia
```

### 3. Verify Contracts (Optional)
```bash
cd packages/hardhat
yarn hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

---

## Deploy to Vercel

### Option 1: Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your repo
4. **Set Root Directory to: `packages/nextjs`** ⚠️
5. Click "Deploy"

### Option 2: Vercel CLI
```bash
# Install CLI
npm i -g vercel

# Deploy
cd packages/nextjs
vercel --prod
```

---

## Important Files Already Updated ✅

- ✅ `packages/nextjs/scaffold.config.ts` - Set to `chains.baseSepolia`
- ✅ `packages/nextjs/scaffold.config.ts` - Burner wallet enabled for testnet

---

## What You Need

### For Base Sepolia Deployment:
- ✅ Private key with Base Sepolia ETH
- ⚠️ Get testnet ETH: https://www.alchemy.com/faucets/ethereum-sepolia
- ⚠️ Bridge to Base: https://bridge.base.org/deposit

### For Vercel Deployment:
- ✅ GitHub account connected to Vercel
- ✅ Repository pushed to GitHub

---

## After Deployment

Check your contracts at:
```
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS
```

Your app will be live at:
```
https://your-project-name.vercel.app
```

---

## 🎮 Test Your Deployment

1. Visit your Vercel URL
2. Connect wallet (switch to Base Sepolia)
3. Mint NFT → Pick pet → Name it
4. Create discussion post → Pet evolves to Level 2! 🎉
5. Vote on DAO proposal → Pet evolves to Level 3! 👑
6. Get 5 wiki likes → Pet evolves to Level 4! 📚✨
