# Mind F**ked - System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         GAME FLOW                            │
└─────────────────────────────────────────────────────────────┘

User Opens Game
       │
       ↓
┌──────────────┐
│ App.jsx      │ ← Root Component
└──────────────┘
       │
       ├─→ UserProvider (Authentication & Currency)
       │        │
       │        ├─→ Firebase Auth (Anonymous)
       │        ├─→ User Profile Creation
       │        └─→ Currency Management (Coins + Tokens)
       │
       └─→ GameProvider (Game State)
                │
                └─→ GameBoard.jsx
                     │
                     ├─→ Main Menu
                     ├─→ Shop (Cosmetics)
                     ├─→ Daily Rewards
                     ├─→ Game Area
                     └─→ Currency Display
```

---

## 💾 Data Flow

```
┌────────────────────────────────────────────────────────────┐
│                     USER DATA STRUCTURE                     │
└────────────────────────────────────────────────────────────┘

Firebase Firestore: /users/{userId}
{
  displayName: "Player1234",
  
  // Currency
  coins: 1000,
  tokens: 50,
  
  // Progression
  xp: 0,
  level: 1,
  
  // Stats
  gamesPlayed: 0,
  gamesWon: 0,
  winStreak: 0,
  bestStreak: 0,
  
  // Daily Rewards
  dailyRewardDay: 0,
  lastDailyReward: "2026-01-02T10:00:00",
  
  // Cosmetics
  ownedCosmetics: ["default_card_back"],
  equippedCosmetics: {
    cardBack: "default_card_back",
    tableTheme: "default_table",
    avatar: "default_avatar"
  },
  
  // VIP
  vipExpiry: null,
  
  // Timestamps
  createdAt: "2026-01-01T12:00:00",
  lastLogin: "2026-01-02T10:00:00"
}
```

---

## 🎮 Game Rewards Flow

```
┌────────────────────────────────────────────────────────────┐
│                   GAMEPLAY → REWARDS                        │
└────────────────────────────────────────────────────────────┘

Player Starts Game
       ↓
Game Logic (GameContext)
       ↓
Game Ends (Win/Loss)
       ↓
GameContext triggers:
  ├─→ recordGameResult(won, stats)
  │
UserContext processes:
  ├─→ Calculate Rewards
  │    ├─→ Base: Win=100 coins+100 XP, Loss=50+50
  │    ├─→ Bonus: Perfect Memory=200 coins+150 XP
  │    └─→ VIP Multiplier: 2x if active
  │
  ├─→ Update Currency (+coins)
  ├─→ Award XP (+xp)
  ├─→ Check Level Up
  │    └─→ If level milestone → Award Bonus (coins+tokens)
  │
  ├─→ Update Stats (gamesPlayed++, winStreak, etc)
  │
  └─→ Save to Firebase
       ↓
UI Updates Automatically (React state)
  ├─→ Currency display updates
  ├─→ XP bar fills
  ├─→ Level up animation (if applicable)
  └─→ Stats refresh
```

---

## 🛍️ Shop Purchase Flow

```
┌────────────────────────────────────────────────────────────┐
│                   SHOP INTERACTION                          │
└────────────────────────────────────────────────────────────┘

User Opens Shop
       ↓
Shop.jsx displays items from cosmetics.js
       ↓
User selects item
       ↓
Check: Already owned?
  ├─→ YES: Show "Equip" button
  └─→ NO: Continue to purchase
       ↓
Check: Can afford?
  ├─→ NO: Show error "Not enough coins/tokens"
  └─→ YES: Show "Purchase" button
       ↓
User clicks Purchase
       ↓
UserContext.buyItem()
  ├─→ Validate currency balance
  ├─→ Deduct cost from balance
  ├─→ Add item to ownedCosmetics[]
  └─→ Update Firebase
       ↓
UI updates
  ├─→ Currency decreases
  ├─→ Item marked as "Owned"
  └─→ Success notification
       ↓
User clicks Equip
       ↓
UserContext.equipItem()
  ├─→ Update equippedCosmetics.{type}
  └─→ Save to Firebase
       ↓
Cosmetic applies to game
```

---

## 📅 Daily Rewards Flow

```
┌────────────────────────────────────────────────────────────┐
│                   DAILY LOGIN SYSTEM                        │
└────────────────────────────────────────────────────────────┘

User Opens Game
       ↓
UserContext loads userData
       ↓
DailyRewards.jsx checks:
  │
  ├─→ lastDailyReward exists?
  │    ├─→ NO: Show modal (first time)
  │    └─→ YES: Check time difference
  │              ├─→ < 24h: Hide modal
  │              ├─→ 24-48h: Show modal (next day)
  │              └─→ > 48h: Reset streak to Day 1
  │
User clicks "Claim Reward"
       ↓
UserContext.claimDaily()
  ├─→ Calculate reward (based on dailyRewardDay)
  │    └─→ DAILY_REWARDS[day - 1] = {coins, tokens}
  │
  ├─→ Update currency (+coins, +tokens)
  ├─→ Increment dailyRewardDay (max 7, then reset)
  ├─→ Set lastDailyReward = now
  └─→ Save to Firebase
       ↓
Show reward animation
  ├─→ Gift box opens
  ├─→ +X coins animation
  ├─→ +X tokens animation
  └─→ Auto-close after 3 seconds
```

---

## 🎯 Leveling System

```
┌────────────────────────────────────────────────────────────┐
│                    XP & LEVELING                            │
└────────────────────────────────────────────────────────────┘

Player earns XP (from games, quests, etc)
       ↓
UserContext.awardXP(amount)
  ├─→ Add XP to user.xp
  ├─→ Calculate new level
  │    └─→ Level = floor(sqrt(xp / 100)) + 1
  │         Examples:
  │         0-99 XP = Level 1
  │         100-399 XP = Level 2
  │         400-899 XP = Level 3
  │         900-1599 XP = Level 4
  │
  ├─→ Did level increase?
  │    ├─→ YES:
  │    │    ├─→ Check LEVEL_REWARDS[newLevel]
  │    │    ├─→ If exists: Award bonus coins+tokens
  │    │    └─→ Return {leveledUp: true, reward}
  │    └─→ NO: Just update XP
  │
  └─→ Save to Firebase
       ↓
UI shows level up animation
  ├─→ Flash effect
  ├─→ "LEVEL UP!" text
  └─→ Display rewards earned

XP Required for Levels:
Level 1: 0 XP
Level 2: 100 XP
Level 3: 400 XP
Level 4: 900 XP
Level 5: 1,600 XP (get 500 coins + 10 tokens)
Level 10: 8,100 XP (get 1,000 coins + 25 tokens)
...
Level 100: 980,100 XP (get 10,000 coins + 500 tokens)
```

---

## 🔄 State Management

```
┌────────────────────────────────────────────────────────────┐
│                  CONTEXT PROVIDERS                          │
└────────────────────────────────────────────────────────────┘

App.jsx
  │
  ├─→ UserProvider (Global User State)
  │    │
  │    ├─ State:
  │    │   ├─ user (Firebase Auth user)
  │    │   ├─ userData (Firestore document)
  │    │   └─ loading
  │    │
  │    └─ Methods:
  │        ├─ awardCoins(amount)
  │        ├─ awardTokens(amount)
  │        ├─ awardXP(amount)
  │        ├─ recordGameResult(won, stats)
  │        ├─ claimDaily()
  │        ├─ buyItem(id, price, currency)
  │        ├─ equipItem(type, id)
  │        └─ refreshUserData()
  │
  └─→ GameProvider (Game State)
       │
       ├─ State:
       │   ├─ status (MENU, PRE_GAME, PLAYING, GAME_OVER)
       │   ├─ players[]
       │   ├─ deck[]
       │   ├─ discardPile[]
       │   ├─ turnIndex
       │   ├─ turnPhase
       │   └─ notification
       │
       └─ Methods:
           ├─ startGameSolo()
           ├─ handleCardClick(playerId, cardIndex)
           └─ dispatch(action)
```

---

## 📦 File Structure

```
src/
├── context/
│   ├── UserContext.jsx       ← User & currency management
│   └── GameContext.jsx        ← Game logic & state
│
├── components/
│   ├── GameBoard.jsx          ← Main game container
│   ├── MainMenu.jsx           ← Start screen
│   ├── PlayerHand.jsx         ← Player card display
│   ├── Card.jsx               ← Single card component
│   ├── Shop.jsx               ← Shop UI ✨ NEW
│   ├── DailyRewards.jsx       ← Login rewards ✨ NEW
│   └── Lobby.jsx              ← Multiplayer lobby
│
├── utils/
│   ├── gameLogic.js           ← Card game rules
│   ├── economy.js             ← Pricing & rewards ✨ NEW
│   ├── userService.js         ← Firebase operations ✨ NEW
│   └── cosmetics.js           ← Item catalog ✨ NEW
│
└── App.jsx                    ← Root component

docs/
├── MONETIZATION_STRATEGY.md   ← Business plan
├── IMPLEMENTATION_GUIDE.md    ← Setup & usage
├── LAUNCH_CHECKLIST.md        ← Development roadmap
└── QUICK_START.md             ← This summary
```

---

## 🔐 Firebase Security

```
Firestore Security Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
                        && request.auth.uid == userId;
    }
    
    // Leaderboard (read-only for all)
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if false; // Server-side only
    }
  }
}
```

---

## 🎨 Cosmetics System

```
┌────────────────────────────────────────────────────────────┐
│                COSMETICS ARCHITECTURE                       │
└────────────────────────────────────────────────────────────┘

cosmetics.js defines items:
  ├─→ CARD_BACKS[] (12 items)
  ├─→ TABLE_THEMES[] (4 items)
  ├─→ AVATARS[] (5 items)
  └─→ EMOTES[] (5 items)

Each item has:
{
  id: "unique_id",
  name: "Display Name",
  description: "Item description",
  rarity: "common|rare|epic|legendary",
  price: 200,
  currency: "coins|tokens",
  unlockMethod: "shop|achievement|level",
  pattern: "texture-name",
  animated: true/false,
  glowEffect: true/false
}

User owns items:
  userData.ownedCosmetics[] = ["id1", "id2", ...]

User equips items:
  userData.equippedCosmetics = {
    cardBack: "id1",
    tableTheme: "id2",
    avatar: "id3"
  }

Card.jsx applies equippedCosmetics.cardBack:
  ├─→ Changes back-face texture
  ├─→ Applies animations if item.animated
  └─→ Adds glow effects if item.glowEffect
```

---

## 💰 Monetization Flow

```
┌────────────────────────────────────────────────────────────┐
│                  PAYMENT INTEGRATION                        │
└────────────────────────────────────────────────────────────┘

User wants to buy tokens
       ↓
Clicks "Buy Tokens" in shop
       ↓
Shows token bundle options:
  ├─→ $0.99 = 100 tokens
  ├─→ $4.99 = 525 tokens (5% bonus)
  ├─→ $9.99 = 1,200 tokens (20% bonus)
  ├─→ $19.99 = 2,600 tokens (30% bonus)
  └─→ $49.99 = 5,500 tokens (50% bonus)
       ↓
User selects bundle
       ↓
Redirect to Stripe Checkout
  ├─→ User enters payment info
  └─→ Stripe processes payment
       ↓
Stripe webhook → Firebase Function
  ├─→ Verify payment
  ├─→ Award tokens to user
  ├─→ Log transaction
  └─→ Send confirmation email
       ↓
User redirected back to game
  ├─→ Tokens updated in UI
  └─→ Success notification
```

---

## 📊 Analytics Events

```
Track these events for optimization:

// User Events
- user_signup
- user_login
- user_level_up (level: 2)

// Game Events
- game_start
- game_complete (result: "win|loss", duration: 180)
- power_up_used (type: "peek|swap|spy")
- call_show (success: true|false)

// Economy Events
- coins_earned (amount: 100, source: "game_win")
- tokens_earned (amount: 50, source: "daily_reward")
- item_purchased (item_id: "card_back_1", price: 200, currency: "coins")
- item_equipped (item_id: "card_back_1", type: "cardBack")

// Monetization Events
- purchase_initiated (product_id: "token_bundle_small")
- purchase_completed (product_id: "token_bundle_small", revenue: 4.99)
- ad_viewed (placement: "post_game")
- ad_rewarded (reward: "double_xp")

// Engagement Events
- daily_reward_claimed (day: 3, coins: 200)
- achievement_unlocked (achievement_id: "first_win")
- quest_completed (quest_id: "daily_win_2")
- shop_visited
```

---

## 🚀 Performance Optimization

```
┌────────────────────────────────────────────────────────────┐
│                 OPTIMIZATION STRATEGY                       │
└────────────────────────────────────────────────────────────┘

1. Code Splitting
   ├─→ Lazy load Shop.jsx (only when opened)
   ├─→ Lazy load DailyRewards.jsx (only when available)
   └─→ Lazy load Lobby.jsx (multiplayer)

2. Firebase Optimization
   ├─→ Cache user data in localStorage
   ├─→ Only fetch on login or major changes
   ├─→ Use Firebase offline persistence
   └─→ Batch writes when possible

3. Asset Optimization
   ├─→ Use WebP for images
   ├─→ Lazy load cosmetic previews
   ├─→ Sprite sheets for card backs
   └─→ CDN for static assets

4. State Management
   ├─→ Minimize re-renders (React.memo)
   ├─→ Use useCallback for stable functions
   ├─→ Debounce Firebase updates
   └─→ Virtualize long lists (cosmetics)
```

---

**This architecture is designed for:**
- ✅ Scalability (millions of users)
- ✅ Maintainability (clean separation of concerns)
- ✅ Performance (optimized data flow)
- ✅ Security (Firebase rules, validation)
- ✅ Monetization (multiple revenue streams)

**Ready to build a top-grossing game! 🚀**
