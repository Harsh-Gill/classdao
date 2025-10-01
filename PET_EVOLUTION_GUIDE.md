# 🐾 ClassDAO Pet Evolution System

## Overview
Your ClassDAO student NFT comes with a **pixel art companion** that evolves through 4 stages as you contribute to the community!

## Evolution Stages

### 🥚 Level 1: Starter (Default)
**What you get:**
- Your chosen companion (Cat, Fox, or Dog)
- Custom scarf color
- Base size: 16x16 pixels

**How to get it:**
- Mint your student NFT
- Choose your pet from the spin wheel
- Pick your favorite scarf color

---

### 🐣 Level 2: Explorer 
**Visual upgrades:**
- Pet grows to 20x20 pixels
- Enhanced scarf with fringe details
- Slight idle animation begins

**Quest to unlock:**
✅ **Create your first discussion post**
- Go to the **Discussion** tab
- Share your thoughts, ask questions, or start a conversation
- Submit the post
- **Your pet instantly evolves!** 🎉

---

### 👑 Level 3: Scholar
**Visual upgrades:**
- Pet grows to 22x22 pixels
- **Royal golden crown** appears on head
- Gentle bouncing animation
- More detailed features (whiskers, patterns, etc.)

**Quest to unlock:**
✅ **Vote on any DAO proposal**
- Go to the **DAO** tab
- Find an active proposal
- Cast your vote (for or against)
- **Crown appears immediately!** 👑

---

### 📚 Level 4: Legend (Max Evolution)
**Visual upgrades:**
- Pet grows to 24x24 pixels (largest!)
- Keeps the crown
- **Floating magical book** appears
- ✨ **Sparkle particles** surround your pet
- **Glowing aura** pulsates in background
- Maximum cuteness achieved!

**Quest to unlock:**
✅ **Get 5 likes on a wiki page you created**
- Go to the **Wiki** tab
- Create a valuable wiki entry about a transaction or concept
- Wait for community members to like your edit
- Once you hit 5 likes total, your pet reaches max evolution! 🌟

---

## How to Track Your Progress

1. **On Your Profile Tab:**
   - View your current pet in the holographic NFT card
   - Check the "Pet Evolution Quests" panel below
   - See which quests are complete (✅) and which are next
   - Preview what your pet will look like at the next level!

2. **Quest Progress Indicators:**
   - 🔵 **Blue highlight** = Current active quest
   - ✅ **Green checkmark** = Quest completed
   - ⚪ **Gray/Dim** = Future quest (locked until previous ones complete)

3. **Quick Links:**
   - Each active quest has a "Start quest →" link
   - Clicking takes you directly to the right tab to complete it

---

## Pet Species Comparison

### 🐱 Cat
- **Colors:** Orange tabby with pink nose
- **Special features:** Pointy ears, tabby stripes at level 3+
- **Personality:** Curious and independent

### 🦊 Fox
- **Colors:** Red-orange with white chest and tail tip
- **Special features:** Pointed ears, bushy tail
- **Personality:** Clever and playful

### 🐶 Dog
- **Colors:** Blue with lighter belly
- **Special features:** Floppy ears, wagging tail, collar
- **Personality:** Loyal and friendly

All three pets evolve equally and gain the same accessories!

---

## Tips for Fast Evolution

### Speed Run Strategy:
1. **Mint your NFT** (30 seconds)
   - Pick any pet, any color - they all evolve the same way!

2. **First post** → Level 2 (2 minutes)
   - Go to Discussion tab
   - Post something simple like "Hello ClassDAO!" or ask a question
   - Submit → Watch your pet evolve instantly!

3. **First vote** → Level 3 (1 minute)
   - Go to DAO tab
   - Vote on any proposal (doesn't matter which side)
   - Submit → Crown appears! 👑

4. **Get wiki likes** → Level 4 (Varies)
   - Create a wiki page with useful content
   - Share with classmates to get upvotes
   - Once you hit 5 likes → Legendary status! ✨

**Total time to max evolution:** ~10-30 minutes if you have engaged community members!

---

## Technical Details

### Contract Functions
The evolution system uses three contract functions:
- `StudentNFT.evolvePetFromPost()` - Called when you make first post
- `StudentNFT.evolvePetFromVote()` - Called when you cast first vote  
- `StudentNFT.evolvePetFromWikiLikes()` - Called when your wiki hits 5 likes

### Data Stored On-Chain
Each Student NFT stores:
```solidity
struct Student {
    uint256 totalPoints;      // XP earned from likes
    uint256 level;            // Account level (separate from pet level)
    uint256 lastLevelUp;      // Timestamp
    string petName;           // Name you chose
    string petType;           // "cat", "fox", or "dog"
    string scarfColor;        // "red", "blue", "green", "purple", "yellow"
    uint256 petLevel;         // 1-4 visual evolution level
    bool hasPosted;           // Unlocks level 2
    bool hasVoted;            // Unlocks level 3
    bool hasWikiLikes;        // Unlocks level 4 (5+ likes)
}
```

### Frontend Components
- `PixelPet.tsx` - Renders the SVG pixel art
- `SpinWheel.tsx` - Pet selection during mint
- Quest tracker UI in `ClassDAOApp.tsx`

---

## FAQ

**Q: Can I change my pet species after minting?**
A: No, your pet choice is permanent! Choose wisely during the spin wheel.

**Q: Can I change my scarf color?**
A: Not currently, but this could be added as a future feature!

**Q: Do I lose evolution progress if I change accounts?**
A: No! Evolution progress is stored on-chain with your NFT.

**Q: What if I complete quests out of order?**
A: The contract ensures you reach the highest level you've qualified for. If you vote before posting, you'll still get level 2 when you post, then immediately jump to level 3.

**Q: Can my pet de-evolve?**
A: Never! Once you unlock a level, it's permanent.

**Q: Is there a level 5 or higher?**
A: Level 4 is the max for now. Future expansions could add more stages!

**Q: Do XP points affect pet evolution?**
A: No! XP points (from getting likes) affect your **account level** (1, 2, 3...). Pet evolution is separate and based on completing specific quests.

---

## Future Features (Potential)

Ideas for expanding the pet system:
- 🎨 Unlockable accessories (hats, glasses, etc.)
- 🏠 Pet housing/backgrounds  
- 🎮 Mini-games with pets
- 🤝 Pet interactions/trading accessories
- 🎭 Seasonal skins
- 🌈 Achievement badges

---

**Happy evolving! 🚀**

Made with ❤️ by the ClassDAO team
