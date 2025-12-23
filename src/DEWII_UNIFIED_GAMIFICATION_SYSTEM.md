# 🎮 DEWII Unified Gamification System
## Pokemon/GTA-Level Progression & Engagement

---

## 🎯 Vision

Create a **world-class gamification system** that rivals modern games like Pokemon GO, GTA Online, and social networks like LinkedIn/Duolingo, with:

- **Multi-currency economy** (XP, Points, NADA tokens)
- **Prestige system** (Levels 1-100+, with resets)
- **Achievement collections** (500+ achievements across categories)
- **Daily/Weekly/Monthly challenges**
- **Seasonal events** (limited-time rewards)
- **Battle Pass system** (free & premium tracks)
- **Leaderboards** (global, friends, local)
- **Skill trees** (unlock abilities per app/category)
- **Collectibles & badges** (showcase on profile)
- **Social competitions** (guilds, teams, 1v1 challenges)

---

## 📊 Current State Analysis

### ✅ What We Have

#### **1. XP System** (NEW - Home Launcher Migration)
- `user_progress.user_level` (1-100+)
- `user_progress.current_xp` (XP towards next level)
- `user_progress.total_xp` (lifetime XP)
- XP formula: `CEIL(100 * level^1.5 / 50) * 50`
- `award_xp()` function with auto-leveling
- `xp_history` table (transaction log)
- `xp_rewards` table (configurable rewards)

#### **2. Points System** (OLD - Gamification Integration)
- `user_progress.points` (separate from XP)
- Action tracking:
  - Read article: 10 pts
  - Create article: 50 pts
  - Share article: 5 pts
  - Swipe: 1 pt
  - Like: 3 pts (1 swipe + 2 bonus)
- Tracking columns:
  - `articles_read`
  - `articles_created`
  - `articles_shared`
  - `articles_swiped`
  - `articles_liked`

#### **3. Achievements System** (OLD - SQL Developer Brief)
- `achievements` table (master list)
- `user_achievements` table (junction table)
- 35 achievements across 6 categories:
  - Reading (6)
  - Streaks (5)
  - Social (4)
  - Explorer (4)
  - Creation (4)
  - Special (4)

#### **4. Streak System**
- `user_progress.current_streak`
- `user_progress.longest_streak`
- `user_progress.last_read_date`

#### **5. NADA Tokens** (Currency)
- `user_progress.nada_points` (premium currency)

---

## 🔥 PROBLEMS TO SOLVE

### **Duplication & Confusion**
1. ❌ **XP vs Points** - Two separate progression systems
2. ❌ **Achievements column** - `user_progress.achievements` JSONB vs `user_achievements` table
3. ❌ **Inconsistent rewards** - Different points for same actions
4. ❌ **No clear hierarchy** - What's more valuable: XP or Points?

### **Missing Features**
1. ❌ No daily/weekly quests
2. ❌ No seasonal events
3. ❌ No battle pass
4. ❌ No skill trees
5. ❌ No guilds/teams
6. ❌ No collectibles
7. ❌ No prestige system
8. ❌ No title system

---

## ✨ UNIFIED SYSTEM DESIGN

### **1. Three-Currency Economy**

#### **🔵 XP (Experience Points)** - Primary Progression
- **Purpose**: Level up (1-100, then prestige)
- **Earned by**: ALL activities (reading, creating, engaging)
- **Visibility**: Always shown, drives level
- **Can't be spent**: Only for leveling

#### **🟡 HEMP Points** - Secondary Currency
- **Purpose**: Unlock cosmetics, badges, profile themes
- **Earned by**: Achievements, milestones, challenges
- **Visibility**: Profile & shop
- **Can be spent**: Customize profile, buy cosmetics

#### **🟢 NADA Tokens** - Premium Currency
- **Purpose**: Premium themes, exclusive items, skip timers
- **Earned by**: Rare achievements, events, purchases
- **Visibility**: Shop only
- **Can be spent**: Premium store items

---

### **2. Unified Progression Table**

**Consolidate into `user_progress` (already exists!):**

```sql
-- EXISTING COLUMNS (Keep)
user_id UUID PRIMARY KEY
points INTEGER DEFAULT 0              -- Rename to: hemp_points
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
total_articles_read INTEGER DEFAULT 0
last_read_date TIMESTAMPTZ
articles_created INTEGER DEFAULT 0
articles_shared INTEGER DEFAULT 0
articles_swiped INTEGER DEFAULT 0
articles_liked INTEGER DEFAULT 0
nada_points INTEGER DEFAULT 0         -- Keep (premium currency)
user_level INTEGER DEFAULT 1          -- Keep (XP system)
current_xp INTEGER DEFAULT 0          -- Keep (XP system)
total_xp INTEGER DEFAULT 0            -- Keep (XP system)
home_layout_config JSONB              -- Keep (home customization)

-- NEW COLUMNS (Add)
prestige_level INTEGER DEFAULT 0      -- Prestige rank (0-10)
skill_points INTEGER DEFAULT 0        -- Unlock abilities
daily_quests_completed JSONB DEFAULT '[]'::jsonb
weekly_quests_completed JSONB DEFAULT '[]'::jsonb
monthly_challenges_completed JSONB DEFAULT '[]'::jsonb
battle_pass_tier INTEGER DEFAULT 0    -- Current season tier (0-100)
battle_pass_premium BOOLEAN DEFAULT false
season_id TEXT                        -- Current season identifier
titles_unlocked JSONB DEFAULT '[]'::jsonb
active_title TEXT                     -- Currently equipped title
badges_unlocked JSONB DEFAULT '[]'::jsonb
active_badges JSONB DEFAULT '[]'::jsonb  -- Up to 3 equipped
collectibles JSONB DEFAULT '{}'::jsonb    -- {category: [ids]}
guild_id UUID                         -- Team/guild membership
guild_role TEXT                       -- Leader, Officer, Member
lifetime_stats JSONB DEFAULT '{}'::jsonb  -- All-time records

-- REMOVE (Delete - use user_achievements table instead)
achievements JSONB  -- DELETE THIS! Use user_achievements table
```

---

### **3. Achievements System (Enhanced)**

**Keep existing structure but EXPAND:**

#### **Current: 35 achievements → Goal: 500+ achievements**

##### **📚 Reading Achievements** (50 total)
- Volume milestones: 1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500 articles
- Speed reading: Read 3/5/10 articles in 1 day
- Marathon: Read for 30/60/120 consecutive minutes
- Category mastery: Read 10+ articles in each category
- Time-based: Morning reader, Night owl, Weekend warrior
- Quality: Read 10+ "Editor's Pick" articles
- Deep dive: Spend 10+ minutes on single article

##### **🔥 Streak Achievements** (30 total)
- Daily: 3, 7, 14, 30, 50, 100, 365, 500, 1000 days
- Weekly: 4, 8, 12, 26, 52 weeks
- Monthly: 3, 6, 12, 24 months
- Special: Never miss a weekend, Never miss a Monday

##### **🎨 Creation Achievements** (40 total)
- Articles: 1, 3, 5, 10, 25, 50, 100, 250, 500 created
- Views: 100, 500, 1k, 5k, 10k, 50k, 100k views total
- Engagement: 10/50/100 likes on single article
- Multimedia: Publish with image, video, audio
- Consistency: Publish 1/week for 4/8/12 weeks
- Viral: Get shared 10/50/100 times

##### **🤝 Social Achievements** (40 total)
- Shares: 1, 10, 25, 50, 100, 250, 500 shares
- Comments: 10, 50, 100, 250, 500 comments written
- Reactions: 100, 500, 1k, 5k reactions given
- Followers: 10, 50, 100, 500, 1000 followers
- Network: Connect with 5/10/25/50 users
- Influence: Have 10+ articles shared by others

##### **🌍 Explorer Achievements** (40 total)
- Swipes: 10, 50, 100, 500, 1000, 5000 swipes
- Likes: 10, 50, 100, 250, 500, 1000 likes
- Places: Visit 1, 5, 10, 25, 50, 100 locations
- Globe: Trade with 1, 5, 10, 25 countries
- Swap: Complete 1, 5, 10, 25, 50 swaps
- Forum: Post 10, 50, 100, 250 times

##### **💎 Collection Achievements** (50 total)
- Badge collector: Unlock 10/25/50/100 badges
- Title hunter: Unlock 5/10/25/50 titles
- Completionist: 100% achievements in category
- Rare finds: Unlock 5/10/25 rare collectibles
- Seasonal: Complete 1, 3, 5, 10 seasons
- Event master: Participate in 5/10/25 events

##### **🏆 Prestige Achievements** (30 total)
- Reach level 25, 50, 75, 100
- Prestige once, 3x, 5x, 10x
- Max prestige (10)
- Speed run: Reach level 100 in 30/60/90 days
- Skill master: Max all skill trees
- Currency baron: Earn 10k/50k/100k HEMP points

##### **🎯 Challenge Achievements** (40 total)
- Daily quests: Complete 10, 50, 100, 365 daily quests
- Weekly challenges: 4, 12, 26, 52 weekly challenges
- Monthly challenges: 3, 6, 12, 24 monthly
- Battle pass: Reach tier 25, 50, 75, 100 in season
- Perfect weeks: Complete all dailies 7 days in row (x4, x8, x12)
- Guild champion: Complete 10/25/50 guild challenges

##### **👑 Special/Hidden Achievements** (80 total)
- Platform milestones: 1st user, 100th, 1000th
- Time capsule: Read article 1 year after published
- Polyglot: Read articles in 3+ languages
- Globetrotter: Access from 5/10/25 countries
- Night shift: Read at 3 AM local time
- Perfect balance: Equal swipes left/right (1000 total)
- Hemp evangelist: Refer 5/10/25 users
- Beta tester: Report 5/10/25 bugs
- Theme collector: Unlock all themes
- Anniversary: Use platform for 1/2/3 years

##### **🎪 Seasonal/Event Achievements** (100 total)
- Each season: 10-15 unique achievements
- Holiday events: Christmas, New Year, Earth Day, 420, etc.
- Limited-time challenges
- Crossover events: Collaborations with partners

**TOTAL: 500+ ACHIEVEMENTS**

---

### **4. XP Rewards (Unified)**

**Principle: Everything gives XP, but different amounts**

#### **Core Actions** (Repeatable)
| Action | XP | Cooldown | Max/Day |
|--------|----|---------|---------| 
| Read article (finish) | 20 | None | ∞ |
| Read article (50%+) | 10 | None | ∞ |
| Create article | 100 | None | 10 |
| Publish article | 50 bonus | Once per article | - |
| Share article | 10 | None | 50 |
| Like/react to article | 5 | None | 100 |
| Comment on article | 15 | 5min | 50 |
| Reply to comment | 8 | 5min | 100 |
| Swipe article | 2 | None | ∞ |
| Match swipe (mutual like) | 5 bonus | None | ∞ |
| Visit place | 15 | 1hr per place | 20 |
| Check-in at place | 25 | 24hr per place | 10 |
| Create swap listing | 30 | None | 10 |
| Complete swap | 75 | None | ∞ |
| Forum post | 20 | 10min | 20 |
| Forum reply | 10 | 5min | 50 |
| Business connection | 50 | None | 10 |
| Daily login | 10 | 24hr | 1 |
| Profile complete 100% | 100 | Once | 1 |

#### **Streak Bonuses** (Multipliers)
- 3-day streak: +10% XP
- 7-day streak: +20% XP
- 14-day streak: +30% XP
- 30-day streak: +50% XP
- 100-day streak: +100% XP (DOUBLE!)

#### **Achievement XP** (One-time)
- Common: 50-100 XP
- Uncommon: 100-250 XP
- Rare: 250-500 XP
- Epic: 500-1000 XP
- Legendary: 1000-2500 XP
- Mythic: 2500-5000 XP

#### **Level-Up Rewards**
- Every 5 levels: 50 HEMP points
- Every 10 levels: 100 HEMP points + 1 skill point
- Every 25 levels: 500 HEMP points + exclusive badge
- Level 100: 5000 HEMP points + prestige unlock

#### **Prestige Rewards**
- Prestige 1: Exclusive title "The Awakened"
- Prestige 5: Gold username color
- Prestige 10: Mythic profile border + "Hemp Legend" title

---

### **5. HEMP Points (Renamed from Points)**

**Purpose: Spendable currency for customization**

#### **How to Earn:**
| Source | HEMP Points |
|--------|-------------|
| Complete achievement | 10-500 (based on rarity) |
| Level up (every 5) | 50 |
| Level up (every 10) | 100 |
| Level up (every 25) | 500 |
| Daily quest complete | 10-25 |
| Weekly challenge complete | 50-100 |
| Monthly challenge complete | 250-500 |
| Battle pass tier (each) | 25-100 |
| Seasonal event | 100-1000 |
| Guild victory | 50-200 |
| Leaderboard reward | 100-5000 |

#### **What to Buy:**
| Item | Cost (HEMP) |
|------|-------------|
| Profile badge | 100-500 |
| Profile title | 250-1000 |
| Profile border | 500-2000 |
| Username color | 1000 |
| Profile animation | 1500 |
| App icon skin | 500-1000 |
| Home layout theme | 750 |
| Custom profile URL | 2500 |
| Skip daily quest | 50 |
| Unlock extra badge slot | 5000 |

---

### **6. NADA Tokens (Premium)**

**Purpose: Rare, valuable currency for premium items**

#### **How to Earn:**
- Purchase with real money
- Rare achievements (Legendary/Mythic)
- Complete entire season (100 NADA)
- Win guild competition (50-200 NADA)
- Special events (10-50 NADA)
- Referral bonus (25 NADA per 5 referrals)

#### **What to Buy:**
| Item | Cost (NADA) |
|------|-------------|
| Premium theme | 50-100 |
| Exclusive badge | 75-150 |
| Legendary title | 100-250 |
| Battle pass (season) | 500 |
| XP boost (7 days) | 100 |
| HEMP boost (7 days) | 100 |
| Skip to next level | 250 |
| Prestige token | 1000 |

---

### **7. Level System (Enhanced)**

#### **Formula:**
```sql
-- XP required for next level
FUNCTION calculate_next_level_xp(level INTEGER) RETURNS INTEGER AS $$
BEGIN
  IF level >= 100 THEN
    -- Post-prestige: exponential growth
    RETURN CEIL(10000 * (1.1 ^ (level - 100)));
  ELSE
    -- Standard growth
    RETURN CEIL(100 * (level ^ 1.5) / 50) * 50;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

#### **Level Tiers:**
- **1-10**: Beginner (Bronze)
- **11-25**: Apprentice (Silver)
- **26-50**: Expert (Gold)
- **51-75**: Master (Platinum)
- **76-99**: Legend (Diamond)
- **100**: Prestige Ready (Mythic)

#### **Prestige System:**
- At level 100, option to "Prestige"
- Resets to level 1 but keeps:
  - Total XP count
  - All achievements
  - HEMP points
  - NADA tokens
  - Unlocked items
  - Titles & badges
- Gains:
  - Prestige rank (1-10)
  - Exclusive prestige badge
  - Name color/glow
  - +10% XP permanently
  - Prestige-only titles
- Max: Prestige 10 (Level 1-100 eleven times!)

---

### **8. Daily/Weekly/Monthly Challenges**

#### **Daily Quests** (3 per day, refreshes 00:00 UTC)
**Pool of 50+ possible quests, randomly assigned:**

**Reading Quests:**
- Read 3/5/10 articles today
- Read 1 article from category X
- Spend 30 minutes reading
- Read 1 "Editor's Pick" article

**Social Quests:**
- Like 5 articles
- Comment on 3 articles
- Share 2 articles
- Follow 2 new users

**Creation Quests:**
- Write 1 article
- Upload 1 image
- Add 1 location
- Create 1 swap listing

**Explorer Quests:**
- Swipe 10 articles
- Like 5 swipes
- Visit 1 place
- Complete 1 trade

**Engagement Quests:**
- Post in forum 2 times
- Reply to 5 comments
- React to 10 posts
- Check in daily

**Rewards:**
- Each quest: 15-25 HEMP points + 50-100 XP
- Complete all 3: Bonus 25 HEMP + 100 XP

---

#### **Weekly Challenges** (5 per week, refreshes Monday 00:00 UTC)

**More demanding, higher rewards:**
- Read 25 articles this week
- Create 3 articles this week
- Complete 5 swaps
- Visit 10 different places
- Maintain 7-day streak
- Earn 500 XP this week
- Complete 15 daily quests (from this week)
- Get 50 likes on your articles
- Share 10 articles
- Post in forum 15 times

**Rewards:**
- Each challenge: 50-100 HEMP + 250-500 XP
- Complete all 5: Bonus 250 HEMP + 1000 XP + 1 Loot Box

---

#### **Monthly Challenges** (10 per month)

**Epic challenges:**
- Read 100 articles this month
- Create 10 articles this month
- Maintain 30-day streak
- Reach level X (personalized goal)
- Earn 5000 XP this month
- Complete 60 daily quests
- Complete 12 weekly challenges
- Get 200 total reactions
- Visit 25 different places
- Unlock 5 new achievements

**Rewards:**
- Each challenge: 250-500 HEMP + 1000-2500 XP
- Complete all 10: 2500 HEMP + 5000 XP + Legendary Loot Box + Exclusive Title

---

### **9. Battle Pass System** (Seasonal)

**Season Duration:** 90 days (4 seasons/year)

**Structure:**
- 100 tiers (both free & premium tracks)
- XP to level up tier: 1000 XP per tier (100k XP total)
- All seasonal XP counts toward tiers
- Can purchase individual tiers (100 NADA each)

#### **Free Track Rewards:**
| Tier | Reward |
|------|--------|
| 1 | 50 HEMP |
| 5 | Common Badge |
| 10 | 100 HEMP |
| 15 | Uncommon Title |
| 20 | 200 HEMP |
| 25 | Rare Badge |
| 30 | 300 HEMP |
| 40 | Epic Title |
| 50 | 500 HEMP + Rare Loot Box |
| 60 | Legendary Badge |
| 75 | 750 HEMP |
| 90 | Epic Loot Box |
| 100 | 1000 HEMP + Legendary Title + 100 NADA |

#### **Premium Track Rewards** (500 NADA to unlock)
| Tier | Reward |
|------|--------|
| 1 | Exclusive Premium Badge |
| 5 | 100 HEMP |
| 10 | Premium Title |
| 15 | 250 HEMP |
| 20 | Exclusive Profile Border |
| 25 | Premium Theme |
| 30 | 500 HEMP |
| 40 | XP Boost (7 days) |
| 50 | Legendary Loot Box + Exclusive Skin |
| 60 | 1000 HEMP |
| 75 | Mythic Badge |
| 90 | 2500 HEMP |
| 100 | Mythic Title + Exclusive Prestige Token + 500 NADA |

#### **Seasonal Themes:**
- **Season 1 (Q1)**: "New Beginnings" - Spring/Growth theme
- **Season 2 (Q2)**: "Summer Vibes" - Beach/Festival theme
- **Season 3 (Q3)**: "Harvest Moon" - Autumn/Sustainability theme
- **Season 4 (Q4)**: "Solarpunk Winter" - Eco-tech holiday theme

---

### **10. Skill Trees** (NEW!)

**5 skill points awarded:** Every 10 levels (L10, L20, L30... L100)

**6 Skill Trees** (one per app + universal):

#### **🏠 Universal Skills**
1. **XP Multiplier I-V** (5% / 10% / 15% / 20% / 25%)
2. **HEMP Bonus I-III** (+10% / +20% / +30% HEMP earned)
3. **Daily Quest Slots** (Unlock 4th/5th daily quest)
4. **Lucky Looter** (Better loot box odds)
5. **Streak Insurance** (1 missed day forgiven/week)

#### **📚 MAG Skills**
1. **Speed Reader** (Read faster, earn XP quicker)
2. **Deep Thinker** (Bonus XP for time spent)
3. **Category Master** (Extra XP in favorite category)
4. **Editor's Eye** (Find hidden achievements easier)
5. **Bookmark Master** (Save unlimited articles)

#### **❤️ SWIPE Skills**
1. **Matchmaker** (Higher match rate)
2. **Taste Maker** (Better recommendations)
3. **Swipe Efficiency** (More XP per swipe)
4. **Lucky Swipe** (Chance for bonus rewards)
5. **Collector** (Find rare items easier)

#### **📍 PLACES Skills**
1. **Explorer** (Bonus XP for new places)
2. **Local Legend** (Higher check-in rewards)
3. **Cartographer** (Unlock map features)
4. **Traveler** (Visit bonus rewards)
5. **Hidden Gems** (Find secret locations)

#### **🔄 SWAP Skills**
1. **Negotiator** (Better trade offers)
2. **Merchant** (Lower listing fees)
3. **Quality Eye** (Better item recommendations)
4. **Trade Master** (Bonus XP per trade)
5. **Market Insight** (See trending items)

#### **💬 FORUM Skills**
1. **Influencer** (More visibility on posts)
2. **Debater** (Bonus XP for replies)
3. **Community Star** (Extra reactions)
4. **Thread Master** (Unlock pinned posts)
5. **Moderator** (Access to mod tools)

#### **🌐 GLOBE Skills**
1. **Business Tycoon** (B2B bonus XP)
2. **Network Builder** (More connection slots)
3. **Deal Maker** (Unlock RFP features)
4. **Global Reach** (Cross-border bonuses)
5. **Enterprise** (Advanced business tools)

---

### **11. Guilds/Teams System** (NEW!)

**Purpose:** Social competition and cooperative challenges

#### **Structure:**
- Create or join guild (max 50 members)
- Guild roles: Leader, Officer, Member
- Guild level (1-50, based on member XP)
- Guild treasury (pooled HEMP points)
- Guild hall (customizable space)

#### **Guild Features:**
- **Guild Challenges:** Weekly cooperative goals
- **Guild vs Guild:** Compete in events
- **Guild Shop:** Exclusive items for members
- **Guild Chat:** Private communication
- **Guild Achievements:** Special badges for group accomplishments
- **Guild Leaderboard:** Top guilds ranked globally

#### **Guild Rewards:**
- Completion of guild challenges: Everyone gets HEMP + XP
- Guild level up: Unlock perks (XP boost, exclusive items)
- Top 10 guild monthly: Legendary loot boxes for all members
- Guild war victories: Special titles and badges

---

### **12. Leaderboards** (Enhanced)

#### **Global Leaderboards:**
1. **Total XP** (all-time)
2. **Monthly XP** (resets 1st of month)
3. **Current Level** (highest level)
4. **Total Achievements** (most unlocked)
5. **HEMP Points** (current balance)
6. **Longest Streak** (all-time record)
7. **Articles Read** (total)
8. **Articles Created** (total)
9. **Guild Ranking** (top guilds)

#### **Friend Leaderboards:**
- Same categories but only friends
- See who's ahead this week/month

#### **Local Leaderboards:**
- By country
- By city (if location enabled)

#### **Seasonal Leaderboards:**
- Battle pass tiers
- Season-specific challenges
- Event participation

**Rewards:**
- Top 10 global monthly: 1000-5000 HEMP + Exclusive Title
- Top 100 global monthly: 250-500 HEMP + Badge
- Top 10 friends: 100 HEMP
- Guild top 10: 500 HEMP for all members

---

### **13. Loot Boxes** (Random Rewards)

**Earned from:**
- Weekly challenge completion
- Monthly challenge completion
- Battle pass tiers
- Rare achievements
- Guild victories
- Seasonal events

#### **Loot Box Tiers:**

**Common Box:**
- 50-100 HEMP
- 100-250 XP
- 1 Common Badge (10% chance)
- 1 Common Title (5% chance)

**Rare Box:**
- 100-250 HEMP
- 250-500 XP
- 1 Uncommon Badge (25% chance)
- 1 Rare Badge (10% chance)
- 1 Rare Title (10% chance)
- 10 NADA (5% chance)

**Epic Box:**
- 250-500 HEMP
- 500-1000 XP
- 1 Rare Badge (40% chance)
- 1 Epic Badge (20% chance)
- 1 Epic Title (15% chance)
- 25 NADA (10% chance)
- 1 Skill Point (5% chance)

**Legendary Box:**
- 500-1000 HEMP
- 1000-2500 XP
- 1 Epic Badge (50% chance)
- 1 Legendary Badge (25% chance)
- 1 Legendary Title (20% chance)
- 50 NADA (20% chance)
- 2 Skill Points (10% chance)
- 1 Prestige Token (1% chance)

**Mythic Box:** (Extremely rare)
- 1000-2500 HEMP
- 2500-5000 XP
- 1 Legendary Badge (guaranteed)
- 1 Mythic Badge (50% chance)
- 1 Mythic Title (40% chance)
- 100 NADA (50% chance)
- 3 Skill Points (25% chance)
- 1 Prestige Token (10% chance)
- Exclusive Collectible (5% chance)

---

### **14. Titles System** (NEW!)

**Equipped above username on profile & leaderboards**

#### **How to Earn:**
- Achievements
- Levels reached
- Prestige ranks
- Battle pass
- Seasonal events
- Guild victories
- Leaderboards

#### **Example Titles:**

**Common:**
- "The Reader"
- "Explorer"
- "Creator"
- "Social Butterfly"

**Uncommon:**
- "Article Enthusiast"
- "Community Member"
- "Swipe Master"
- "Place Hunter"

**Rare:**
- "Knowledge Seeker"
- "Content Maestro"
- "Trade Expert"
- "Forum Regular"

**Epic:**
- "Hemp Scholar"
- "Viral Creator"
- "Networking Pro"
- "Streak Champion"

**Legendary:**
- "The Enlightened"
- "Content Titan"
- "Social Influencer"
- "Market Legend"

**Mythic:**
- "Hemp Legend"
- "The Awakened" (Prestige 1)
- "The Transcendent" (Prestige 5)
- "The Eternal" (Prestige 10)

**Seasonal:**
- "Spring Champion" (Season 1 complete)
- "Summer Legend" (Season 2 complete)
- "Harvest King" (Season 3 complete)
- "Winter Solarpunk" (Season 4 complete)

---

### **15. Badges System** (Enhanced)

**Display on profile (3 active slots, unlock more with HEMP)**

#### **Categories:**

**Achievement Badges:**
- Reading milestones
- Streak records
- Creation achievements
- Social accomplishments

**Prestige Badges:**
- Prestige 1-10 unique badges
- Level tier badges (Bronze, Silver, Gold, etc.)

**Seasonal Badges:**
- Each season: 5-10 unique badges
- Event-specific badges

**Guild Badges:**
- Guild level badges
- Guild war victories
- Top guild member

**Special Badges:**
- Beta tester
- Early adopter
- Platform contributor
- Bug hunter
- Referral master

**Rarity Levels:**
- Common (gray)
- Uncommon (green)
- Rare (blue)
- Epic (purple)
- Legendary (gold)
- Mythic (rainbow shimmer)

---

## 🗄️ Database Schema Updates

### **Migration Plan:**

```sql
-- ========================================
-- STEP 1: Rename & Update user_progress
-- ========================================

-- Rename points to hemp_points
ALTER TABLE user_progress 
RENAME COLUMN points TO hemp_points;

-- Remove duplicate achievements column (use user_achievements table)
ALTER TABLE user_progress 
DROP COLUMN IF EXISTS achievements;

-- Add new progression columns
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS prestige_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skill_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_quests_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS weekly_quests_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS monthly_challenges_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS battle_pass_tier INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS battle_pass_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS season_id TEXT,
ADD COLUMN IF NOT EXISTS titles_unlocked JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS active_title TEXT,
ADD COLUMN IF NOT EXISTS badges_unlocked JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS active_badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS collectibles JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS guild_id UUID,
ADD COLUMN IF NOT EXISTS guild_role TEXT,
ADD COLUMN IF NOT EXISTS lifetime_stats JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS skill_tree_progress JSONB DEFAULT '{}'::jsonb;

-- ========================================
-- STEP 2: Create new tables
-- ========================================

-- Daily Quests
CREATE TABLE IF NOT EXISTS daily_quests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  hemp_reward INTEGER DEFAULT 15,
  requirement JSONB NOT NULL, -- {type: 'read', count: 3}
  active BOOLEAN DEFAULT true
);

-- Weekly Challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 250,
  hemp_reward INTEGER DEFAULT 50,
  requirement JSONB NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Monthly Challenges
CREATE TABLE IF NOT EXISTS monthly_challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 1000,
  hemp_reward INTEGER DEFAULT 250,
  requirement JSONB NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Battle Pass Tiers
CREATE TABLE IF NOT EXISTS battle_pass_tiers (
  season_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  reward_type TEXT NOT NULL, -- hemp, xp, badge, title, nada, etc.
  reward_value TEXT NOT NULL, -- amount or item ID
  PRIMARY KEY (season_id, tier, is_premium)
);

-- Seasons
CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Titles
CREATE TABLE IF NOT EXISTS titles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL, -- common, uncommon, rare, epic, legendary, mythic
  unlock_condition TEXT,
  hemp_cost INTEGER DEFAULT 0,
  nada_cost INTEGER DEFAULT 0,
  seasonal BOOLEAN DEFAULT false,
  season_id TEXT
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  rarity TEXT NOT NULL,
  category TEXT NOT NULL,
  unlock_condition TEXT,
  hemp_cost INTEGER DEFAULT 0,
  nada_cost INTEGER DEFAULT 0
);

-- Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  tag TEXT, -- 3-4 letter tag
  level INTEGER DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  hemp_treasury INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  leader_id UUID REFERENCES auth.users(id),
  customization JSONB DEFAULT '{}'::jsonb
);

-- Skill Trees
CREATE TABLE IF NOT EXISTS skill_tree_nodes (
  id TEXT PRIMARY KEY,
  tree_category TEXT NOT NULL, -- universal, mag, swipe, places, swap, forum, globe
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  max_level INTEGER DEFAULT 5,
  cost_per_level INTEGER DEFAULT 1,
  prerequisite_node TEXT, -- parent skill ID
  effect JSONB NOT NULL -- {type: 'xp_multiplier', value: 0.05}
);

-- Loot Boxes
CREATE TABLE IF NOT EXISTS loot_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  box_type TEXT NOT NULL, -- common, rare, epic, legendary, mythic
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  rewards JSONB -- Populated when opened
);

-- User Quest Progress (instance tracking)
CREATE TABLE IF NOT EXISTS user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_type TEXT NOT NULL, -- daily, weekly, monthly
  quest_id TEXT NOT NULL,
  progress JSONB NOT NULL, -- {current: 2, required: 5}
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, quest_id, expires_at)
);

-- ========================================
-- STEP 3: Update achievements table
-- ========================================

-- Add new columns to existing achievements
ALTER TABLE achievements
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common',
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hemp_reward INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seasonal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS season_id TEXT,
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prerequisite_achievement TEXT;

-- Update existing achievements with new structure
UPDATE achievements SET 
  category = 'reading',
  rarity = CASE 
    WHEN points < 100 THEN 'common'
    WHEN points < 250 THEN 'uncommon'
    WHEN points < 500 THEN 'rare'
    WHEN points < 1000 THEN 'epic'
    WHEN points < 2500 THEN 'legendary'
    ELSE 'mythic'
  END,
  xp_reward = points * 5,
  hemp_reward = points
WHERE id LIKE 'reader-%' OR id = 'first-read';

-- ========================================
-- STEP 4: Create indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_progress_prestige ON user_progress(prestige_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_season ON user_progress(season_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_guild ON user_progress(guild_id);
CREATE INDEX IF NOT EXISTS idx_guilds_level ON guilds(level DESC);
CREATE INDEX IF NOT EXISTS idx_guilds_xp ON guilds(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_loot_boxes_user ON loot_boxes(user_id) WHERE opened_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quest_progress_user ON user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_expires ON user_quest_progress(expires_at);

-- ========================================
-- STEP 5: Update functions
-- ========================================

-- Enhanced award_xp with streak multipliers
CREATE OR REPLACE FUNCTION award_xp_with_bonus(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_action_key TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN;
  v_streak INTEGER;
  v_streak_multiplier NUMERIC;
  v_final_xp INTEGER;
BEGIN
  -- Get current streak
  SELECT current_streak INTO v_streak
  FROM user_progress
  WHERE user_id = p_user_id;
  
  -- Calculate streak multiplier
  v_streak_multiplier := CASE
    WHEN v_streak >= 100 THEN 2.0
    WHEN v_streak >= 30 THEN 1.5
    WHEN v_streak >= 14 THEN 1.3
    WHEN v_streak >= 7 THEN 1.2
    WHEN v_streak >= 3 THEN 1.1
    ELSE 1.0
  END;
  
  -- Apply multiplier
  v_final_xp := FLOOR(p_xp_amount * v_streak_multiplier);
  
  -- Get current level
  SELECT user_level INTO v_old_level
  FROM user_progress
  WHERE user_id = p_user_id;
  
  -- Award XP
  UPDATE user_progress
  SET 
    current_xp = current_xp + v_final_xp,
    total_xp = total_xp + v_final_xp,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING user_level INTO v_new_level;
  
  -- Log to history
  INSERT INTO xp_history (user_id, action_key, xp_amount, reason)
  VALUES (p_user_id, p_action_key, v_final_xp, 
    COALESCE(p_reason, '') || 
    CASE WHEN v_streak_multiplier > 1.0 
      THEN ' (Streak bonus: ' || v_streak_multiplier || 'x)' 
      ELSE '' 
    END
  );
  
  -- Check if leveled up
  v_leveled_up := v_new_level > v_old_level;
  
  RETURN json_build_object(
    'success', true,
    'xp_awarded', v_final_xp,
    'base_xp', p_xp_amount,
    'streak_multiplier', v_streak_multiplier,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and assign daily quests
CREATE OR REPLACE FUNCTION assign_daily_quests(p_user_id UUID) RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_tomorrow DATE := v_today + INTERVAL '1 day';
BEGIN
  -- Check if user already has today's quests
  IF EXISTS (
    SELECT 1 FROM user_quest_progress
    WHERE user_id = p_user_id
      AND quest_type = 'daily'
      AND expires_at > NOW()
  ) THEN
    RETURN;
  END IF;
  
  -- Assign 3 random daily quests
  INSERT INTO user_quest_progress (user_id, quest_type, quest_id, progress, expires_at)
  SELECT 
    p_user_id,
    'daily',
    id,
    '{"current": 0}'::jsonb,
    v_tomorrow
  FROM daily_quests
  WHERE active = true
  ORDER BY RANDOM()
  LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to open loot box
CREATE OR REPLACE FUNCTION open_loot_box(p_box_id UUID) RETURNS JSON AS $$
DECLARE
  v_box_type TEXT;
  v_rewards JSONB;
  v_hemp INTEGER;
  v_xp INTEGER;
  v_user_id UUID;
BEGIN
  -- Get box details
  SELECT box_type, user_id INTO v_box_type, v_user_id
  FROM loot_boxes
  WHERE id = p_box_id AND opened_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Box not found or already opened');
  END IF;
  
  -- Generate rewards based on box type
  -- (This is simplified - would be more complex in production)
  v_rewards := CASE v_box_type
    WHEN 'common' THEN json_build_object(
      'hemp', 50 + FLOOR(RANDOM() * 50),
      'xp', 100 + FLOOR(RANDOM() * 150)
    )
    WHEN 'rare' THEN json_build_object(
      'hemp', 100 + FLOOR(RANDOM() * 150),
      'xp', 250 + FLOOR(RANDOM() * 250)
    )
    -- ... other tiers
  END;
  
  -- Mark box as opened
  UPDATE loot_boxes
  SET opened_at = NOW(), rewards = v_rewards
  WHERE id = p_box_id;
  
  -- Grant rewards
  UPDATE user_progress
  SET 
    hemp_points = hemp_points + (v_rewards->>'hemp')::INTEGER,
    current_xp = current_xp + (v_rewards->>'xp')::INTEGER,
    total_xp = total_xp + (v_rewards->>'xp')::INTEGER
  WHERE user_id = v_user_id;
  
  RETURN v_rewards;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation** (Week 1-2)
- ✅ Run database migration
- ✅ Rename `points` → `hemp_points`
- ✅ Remove duplicate `achievements` column
- ✅ Add new progression columns
- ✅ Update XP formula with streak bonuses
- ✅ Create daily/weekly/monthly quest tables
- ✅ Update server endpoints

### **Phase 2: Quests System** (Week 3-4)
- ⏳ Build daily quest UI component
- ⏳ Build weekly challenge UI component
- ⏳ Build monthly challenge UI component
- ⏳ Quest progress tracking
- ⏳ Quest completion notifications
- ⏳ Quest rewards distribution

### **Phase 3: Achievements Expansion** (Week 5-6)
- ⏳ Expand achievements from 35 → 100+
- ⏳ Add achievement categories
- ⏳ Add achievement rarity
- ⏳ Build achievement showcase UI
- ⏳ Achievement notification toasts

### **Phase 4: Battle Pass** (Week 7-8)
- ⏳ Create season table & tiers
- ⏳ Build battle pass UI
- ⏳ Tier progression system
- ⏳ Reward distribution
- ⏳ Premium track purchase flow

### **Phase 5: Skill Trees** (Week 9-10)
- ⏳ Create skill tree nodes
- ⏳ Build skill tree UI (6 trees)
- ⏳ Skill unlock logic
- ⏳ Apply skill effects (XP boost, etc.)

### **Phase 6: Guilds** (Week 11-12)
- ⏳ Create guild system
- ⏳ Guild creation/joining UI
- ⏳ Guild chat
- ⏳ Guild challenges
- ⏳ Guild leaderboards

### **Phase 7: Titles & Badges** (Week 13-14)
- ⏳ Titles system
- ⏳ Badge showcase (3 active slots)
- ⏳ Profile display integration
- ⏳ Unlock animations

### **Phase 8: Loot Boxes** (Week 15-16)
- ⏳ Loot box opening animation
- ⏳ Reward RNG system
- ⏳ Inventory management
- ⏳ Loot box shop

### **Phase 9: Leaderboards** (Week 17-18)
- ⏳ Global leaderboards (9 categories)
- ⏳ Friend leaderboards
- ⏳ Local leaderboards
- ⏳ Seasonal leaderboards
- ⏳ Leaderboard rewards

### **Phase 10: Polish & Events** (Week 19-20)
- ⏳ Seasonal events system
- ⏳ Limited-time challenges
- ⏳ Prestige UI & animations
- ⏳ Notification center
- ⏳ Analytics dashboard

---

## 📱 UI/UX Components Needed

### **Home Launcher Updates:**
- ✅ XP progress bar (done)
- ⏳ Daily quests widget (3 quests, compact)
- ⏳ Streak counter with flame icon
- ⏳ Level tier badge
- ⏳ Quick stats (HEMP, NADA, Skill Points)

### **New Screens:**
1. **Quest Hub** - Daily/Weekly/Monthly tabs
2. **Battle Pass** - Free & Premium tracks, 100 tiers
3. **Skill Trees** - 6 trees with node connections
4. **Achievements Gallery** - Grid view with categories
5. **Guilds** - Create/Browse/Manage
6. **Leaderboards** - Multiple categories with filters
7. **Profile Showcase** - Titles, Badges, Stats
8. **Loot Box Opening** - Animated reveal
9. **Shop** - HEMP & NADA stores
10. **Seasonal Events** - Limited-time challenges

### **Modals/Overlays:**
- Level up celebration
- Achievement unlock toast
- Quest completion popup
- Loot box opening animation
- Prestige confirmation
- Skill tree unlock effect

---

## 🎨 Visual Identity

### **Rarity Colors:**
- **Common**: Gray (#9CA3AF)
- **Uncommon**: Green (#10B981)
- **Rare**: Blue (#3B82F6)
- **Epic**: Purple (#A855F7)
- **Legendary**: Gold (#F59E0B)
- **Mythic**: Rainbow gradient shimmer

### **Icons:**
- XP: Lightning bolt ⚡
- HEMP: Hemp leaf 🌿
- NADA: Diamond 💎
- Streak: Flame 🔥
- Level: Star ⭐
- Prestige: Crown 👑
- Skill Point: Brain 🧠
- Guild: Shield 🛡️
- Achievement: Trophy 🏆
- Quest: Scroll 📜
- Battle Pass: Ticket 🎫

---

## 🎉 Success Metrics

### **Engagement KPIs:**
- Daily Active Users (DAU)
- Average session duration
- Quests completed/day
- Achievement unlock rate
- Battle pass purchase rate
- Guild participation rate
- Retention (D1, D7, D30)

### **Progression KPIs:**
- Average user level
- Prestige rate
- Skill points spent
- HEMP earned vs spent
- NADA purchases
- Loot boxes opened

### **Social KPIs:**
- Guild member count
- Guild challenges completed
- Leaderboard engagement
- Friend connections
- Competition participation

---

## 🔮 Future Expansions

### **Year 2 Features:**
- PvP challenges (1v1 competitions)
- Clan wars (guild vs guild events)
- Trading system (items/collectibles)
- Cosmetic shop (avatar customization)
- Profile themes (animated backgrounds)
- Minigames (earn bonus XP)
- NFT integration (limited collectibles)
- Cross-platform progression
- Esports tournaments
- Creator tools (custom challenges)

---

## ✅ Summary

This unified gamification system transforms DEWII from a simple reading app into a **world-class engagement platform** rivaling Pokemon GO, GTA Online, and modern social networks.

**Key Differentiators:**
1. **Three-currency economy** (XP, HEMP, NADA)
2. **500+ achievements** (vs current 35)
3. **Prestige system** (11 levels total)
4. **Battle pass** (seasonal content)
5. **Skill trees** (6 trees, 30+ skills)
6. **Guilds** (50-member teams)
7. **Daily/Weekly/Monthly** quests
8. **Loot boxes** (5 tiers)
9. **Titles & Badges** (showcase system)
10. **Leaderboards** (9+ categories)

**Next Steps:**
1. Review & approve this design
2. Run Phase 1 migration (database)
3. Update server endpoints
4. Build quest system UI
5. Expand achievements
6. Launch Season 1 battle pass

Ready to build the most engaging hemp platform on the planet? 🚀🌿
