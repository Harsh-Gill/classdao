# 🎯 Complete Deployment Steps

## Prerequisites ✅
- [x] Private key with Base Sepolia ETH in your wallet
- [x] GitHub account
- [x] Vercel account (free tier works!)

---

## STEP 1: Deploy Smart Contracts to Base Sepolia 🔗

### 1a. Set Up Private Key

**Option A: Secure Import (Recommended)**
```bash
cd packages/hardhat
yarn account:import
```
→ Paste your private key when prompted
→ It will be encrypted in `.env`

**Option B: Manual Setup**
Create `packages/hardhat/.env`:
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### 1b. Get Base Sepolia ETH (if needed)

1. Get Sepolia ETH: https://www.alchemy.com/faucets/ethereum-sepolia
2. Bridge to Base Sepolia: https://bridge.base.org/deposit
3. Wait ~5 minutes for bridge

Check balance: https://sepolia.basescan.org/address/YOUR_ADDRESS

### 1c. Deploy Contracts

```bash
# From root directory
yarn deploy --network baseSepolia
```

**Expected Output:**
```
✅ deploying "StudentNFT" → 0x1234...
✅ deploying "PointsManager" → 0x5678...
✅ deploying "DiscussionForum" → 0x9abc...
✅ deploying "WikipediaManager" → 0xdef0...
✅ deploying "ClassDAO" → 0x1111...
⚡ Setting up contract relationships...
✅ ClassDAO deployment completed!
```

**Save these contract addresses!** They're also saved in:
`packages/nextjs/contracts/deployedContracts.ts`

### 1d. Verify Deployment

Visit BaseScan to confirm:
```
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS
```

---

## STEP 2: Commit Your Changes 📝

```bash
git add .
git commit -m "Deploy to Base Sepolia"
git push origin main
```

---

## STEP 3: Deploy Frontend to Vercel 🚀

### Method A: Vercel Dashboard (Easiest)

1. **Go to https://vercel.com/new**

2. **Import Git Repository**
   - Connect GitHub if not already
   - Select your `classdao` repository
   - Click "Import"

3. **Configure Build Settings** ⚠️ **CRITICAL STEP**
   ```
   Framework Preset: Next.js
   Root Directory: packages/nextjs    ← MUST SET THIS!
   Build Command: yarn build
   Output Directory: .next
   Install Command: yarn install
   ```

4. **Environment Variables (Optional)**
   Add these for production:
   ```
   NEXT_PUBLIC_ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=3a8170812b534d0ff9d794f19a901d64
   ```

5. **Click "Deploy"** 🎉

### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from Next.js directory
cd packages/nextjs
vercel

# Follow prompts, then for production:
vercel --prod
```

---

## STEP 4: Test Your Live DApp 🎮

1. **Visit Your Vercel URL**
   - Example: `https://classdao.vercel.app`
   - Or: `https://classdao-xyz.vercel.app`

2. **Connect Wallet**
   - Click "Connect Wallet"
   - Switch network to "Base Sepolia"
   - MetaMask will prompt to add network if needed

3. **Test Full Flow**
   - ✅ Mint NFT → Pick pet (dog/cat/fox) → Name it
   - ✅ Check NFT displays with Starter Level 1
   - ✅ Go to Discussion → Create post → Pet evolves to Level 2! 🧣
   - ✅ Go to DAO → Create & vote on proposal → Pet evolves to Level 3! 👑
   - ✅ Go to Wiki → Create page → Get 5 likes → Pet evolves to Level 4! 📚✨

---

## ✨ Success Checklist

- [ ] Contracts deployed to Base Sepolia
- [ ] Contract addresses visible on BaseScan
- [ ] Frontend live on Vercel
- [ ] Wallet connects to Base Sepolia
- [ ] Can mint NFT with pet selection
- [ ] Pet evolution works (Level 1 → 2 → 3 → 4)
- [ ] All tabs functional (Profile, Discussion, DAO, Wiki)
- [ ] Search and filters work

---

## 🐛 Troubleshooting

### Contract Deployment Issues

**"Insufficient funds"**
```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url https://sepolia.base.org

# Get more testnet ETH from faucet
```

**"Nonce too high"**
```bash
# Reset your account in MetaMask
# Settings → Advanced → Clear activity tab data
```

### Vercel Build Issues

**"Build failed"**
- Check Root Directory is `packages/nextjs`
- View build logs in Vercel dashboard
- Ensure `yarn build` works locally first

**"Module not found"**
```bash
# Verify dependencies
cd packages/nextjs
yarn install
yarn build
```

### Frontend Connection Issues

**"Wrong Network"**
- Check `scaffold.config.ts` has `chains.baseSepolia`
- Clear browser cache
- Reconnect wallet

**"Contracts not found"**
- Verify `deployedContracts.ts` has chain ID 84532 (Base Sepolia)
- Check contract addresses match BaseScan

---

## 📊 Live URLs

After deployment, save these URLs:

```
🌐 Frontend: https://your-app.vercel.app
🔗 StudentNFT: https://sepolia.basescan.org/address/0x...
🔗 DiscussionForum: https://sepolia.basescan.org/address/0x...
🔗 ClassDAO: https://sepolia.basescan.org/address/0x...
🔗 WikipediaManager: https://sepolia.basescan.org/address/0x...
```

---

## 🎓 Share Your Project

Your ClassDAO is now live! Share it:

- Tweet about it with #BuildOnBase
- Share in Discord/Telegram communities
- Add to your portfolio
- Submit to Base ecosystem showcase

---

## 🚀 Going to Production (Future)

When ready for Base Mainnet:

1. Deploy contracts: `yarn deploy --network base`
2. Update `scaffold.config.ts` to `chains.base`
3. Get mainnet ETH on Base
4. Redeploy to Vercel
5. 🎉 You're live on mainnet!

---

**Good luck with your deployment! 🌟**

Need help? Check:
- Base Docs: https://docs.base.org
- Scaffold-ETH Docs: https://docs.scaffoldeth.io
- Vercel Docs: https://vercel.com/docs
