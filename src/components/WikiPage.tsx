import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Home, BookOpen, ArrowLeft, Sparkles, ShoppingBag, Trophy, Globe, Newspaper, Palette, Network } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { threeRailsContent } from './wiki/ThreeRailsContent'

// Markdown Renderer Component
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let currentList: { type: 'ul' | 'ol', items: string[] } | null = null
  
  const flushList = () => {
    if (currentList) {
      const key = `list-${elements.length}`
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={key} className="my-4 ml-6 list-disc space-y-2">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-7" dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ul>
        )
      } else {
        elements.push(
          <ol key={key} className="my-4 ml-6 list-decimal space-y-2">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-7" dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ol>
        )
      }
      currentList = null
    }
  }
  
  const parseInline = (text: string): string => {
    // Handle bold text **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
    
    // Handle italic text *text*
    text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    
    // Handle inline code `code`
    text = text.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    
    // Handle links [text](url)
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    return text
  }
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Handle headings
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      flushList()
      elements.push(
        <h1 key={index} className="text-4xl font-bold text-primary mb-4 mt-8 first:mt-0">
          {line.slice(2)}
        </h1>
      )
      return
    }
    
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      flushList()
      elements.push(
        <h2 key={index} className="text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2">
          {line.slice(3)}
        </h2>
      )
      return
    }
    
    if (line.startsWith('### ') && !line.startsWith('#### ')) {
      flushList()
      elements.push(
        <h3 key={index} className="text-2xl font-bold mt-6 mb-3">
          {line.slice(4)}
        </h3>
      )
      return
    }
    
    if (line.startsWith('#### ')) {
      flushList()
      elements.push(
        <h4 key={index} className="text-xl font-bold mt-4 mb-2">
          {line.slice(5)}
        </h4>
      )
      return
    }
    
    // Handle horizontal rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList()
      elements.push(<hr key={index} className="my-8 border-border/50" />)
      return
    }
    
    // Handle unordered list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const item = trimmed.slice(2)
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(item)
      return
    }
    
    // Handle ordered list items
    if (trimmed.match(/^\d+\.\s/)) {
      const item = trimmed.replace(/^\d+\.\s/, '')
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(item)
      return
    }
    
    // Handle blockquotes
    if (trimmed.startsWith('> ')) {
      flushList()
      elements.push(
        <blockquote key={index} className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground">
          {trimmed.slice(2)}
        </blockquote>
      )
      return
    }
    
    // Handle empty lines
    if (trimmed === '') {
      flushList()
      elements.push(<div key={index} className="h-2" />)
      return
    }
    
    // Handle italic emphasis lines (lines starting with *)
    if (trimmed.startsWith('*') && !trimmed.startsWith('**') && trimmed.endsWith('*')) {
      flushList()
      elements.push(
        <p key={index} className="my-2 leading-7 italic text-muted-foreground">
          {trimmed.slice(1, -1)}
        </p>
      )
      return
    }
    
    // Regular paragraph with inline formatting
    flushList()
    elements.push(
      <p 
        key={index} 
        className="my-2 leading-7"
        dangerouslySetInnerHTML={{ __html: parseInline(line) }}
      />
    )
  })
  
  // Flush any remaining list
  flushList()
  
  return <div className="markdown-content space-y-1">{elements}</div>
}

interface WikiPageProps {
  isOpen: boolean
  onClose: () => void
}

interface WikiDocument {
  id: string
  title: string
  content: string
  description: string
  category: 'getting-started' | 'features' | 'marketplace' | 'gamification' | 'company' | 'updates'
  icon: any
}

export function WikiPage({ isOpen, onClose }: WikiPageProps) {
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'document'>('home')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<WikiDocument | null>(null)

  // Wiki categories
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics and start your journey',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'features',
      title: 'Features & Customization',
      description: 'Themes, profiles, globe customization',
      icon: Palette,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'marketplace',
      title: 'Marketplace & Shop',
      description: 'Browse products and manage your shop',
      icon: ShoppingBag,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'gamification',
      title: 'Points & Gamification',
      description: 'Earn NADA points, unlock achievements',
      icon: Trophy,
      color: 'from-sky-500 to-cyan-500'
    },
    {
      id: 'company',
      title: 'Company Directory',
      description: 'Hemp Atlas, 3D globe, organization management',
      icon: Globe,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'updates',
      title: 'What\'s New',
      description: 'Release notes, roadmap, and announcements',
      icon: Newspaper,
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  // All wiki documents organized by category
  const documents: WikiDocument[] = [
    // GETTING STARTED
    {
      id: 'welcome-to-dewii',
      title: 'Welcome to Hemp\'in Universe',
      description: 'Your complete introduction to the platform',
      category: 'getting-started',
      icon: BookOpen,
      content: `# 🌿 Welcome to Hemp'in Universe

Welcome to the world's first solarpunk hemp magazine and community platform!

---

## 🎯 What is Hemp'in Universe?

Hemp'in Universe (DEWII) is your gateway to the global hemp community. We're building a platform where you can:

- 📰 **Read** cutting-edge articles about hemp, sustainability, and innovation
- 🎮 **Earn** power points that convert to NADA currency
- 🛍️ **Discover** hemp products from verified organizations
- 🌍 **Explore** the Hemp Atlas - our interactive 3D globe of hemp companies worldwide
- 🎨 **Create** and publish your own articles
- 🏆 **Unlock** achievements, badges, and themes

---

## 🚀 Getting Started in 5 Minutes

### Step 1: Sign Up
1. Click the **Sign In** button in the top navigation
2. Create your account with email and password
3. Start exploring immediately!

### Step 2: Explore Content
1. Browse articles in the **Explore** tab (home button)
2. Read articles to earn **power points**
3. Swipe through articles for quick discoveries

### Step 3: Customize Your Profile
1. Click the **ME** button in bottom navbar
2. View your stats, points, and streaks
3. Equip badges and change themes
4. Track your achievements

### Step 4: Discover the Marketplace
1. Navigate to **Market** tab
2. Browse hemp products from verified organizations
3. Earn bonus NADA from conscious purchases

### Step 5: Join the Community
1. Explore the **Hemp Atlas** 3D globe
2. Discover hemp companies worldwide
3. Read organization profiles and stories

---

## 💰 Understanding the Points System

Hemp'in Universe has **TWO types of points**:

### ⚡ Power Points (Action Rewards)
Power points are earned through platform actions:

- **Reading articles:** 10 power points each
- **Swiping articles:** 1-3 power points
- **Sharing articles:** 5 power points
- **Daily login streaks:** Bonus multipliers

**Power points can be converted to NADA** in your wallet.

### 💎 NADA Points (Currency)
NADA is our sustainable currency that you can spend:

**How to Get NADA:**
- **Convert power points** to NADA in your wallet
- **Conscious purchases:** Earn NADA from marketplace shopping

**How to Spend NADA:**
- Premium themes (50-75 NADA)
- Badge collections (25-100 NADA)
- Profile banners (150 NADA)
- Priority support (250 NADA)

---

## 🔥 Daily Streaks

Login every day to build your streak and unlock multipliers:

- **Days 1-6:** Base rewards
- **Day 7+:** 2x multiplier
- **Day 30+:** 3x multiplier

---

## 🌍 Explore the Hemp Atlas

Our interactive 3D globe shows hemp organizations worldwide:

1. Visit the **Globe** from the navigation
2. Spin the Earth and zoom in
3. Click markers to see company details
4. Customize colors and visual effects
5. Toggle data layers (Organizations, Products)

---

## 📱 Navigation Guide

### Bottom Navigation Bar:
- **🏠 Explore** - Browse and read articles
- **👤 Me** - Your profile, stats, and settings
- **➕ Create** - Write and publish articles

### Top Navigation:
- **Theme Button** - Switch between different themes
- **Profile Menu** - Access organizations and settings
- **Wiki Button** - You're here!

---

## 🎨 Themes & Customization

Hemp'in Universe comes with 4 beautiful themes:

1. **Default** - Clean and professional
2. **Solarpunk Dreams** - Emerald and gold (FREE)
3. **Midnight Hemp** - Purple bioluminescent (50 NADA)
4. **Golden Hour** - Warm sunset tones (50 NADA)

Purchase themes in the **Plugins Shop** (ME → Plugins Shop)

---

## 🏆 Achievements System

Unlock achievements for collection and bragging rights:

- **Common** achievements
- **Uncommon** achievements
- **Rare** achievements
- **Epic** achievements
- **Legendary** achievements
- **Mythic** achievements

Track your progress in your profile dashboard!

---

## 💡 Pro Tips for New Users

### Maximize Your Experience:
1. **Read daily** to maintain your streak and earn power points
2. **Convert power points** to NADA regularly
3. **Complete your profile** with a badge and theme
4. **Explore the globe** to discover companies
5. **Join organizations** to access exclusive badges

### Best Practices:
- Check in daily for streak bonuses
- Read articles that interest you
- Convert accumulated power points to NADA
- Share content with your network
- Engage with the community
- Explore different themes

---

## 🆘 Need Help?

- Visit the **Wiki** for detailed guides
- Check individual feature guides in other sections
- Contact support (available with Priority Support badge)
- Join community discussions

---

## 🎉 Welcome to the Community!

You're now part of the global hemp movement. Explore, learn, earn, and contribute to building a sustainable future together.

**Built with 💚 for the global hemp community**`
    },
    {
      id: 'how-to-read-and-earn',
      title: 'How to Read Articles & Earn Points',
      description: 'Master the basics of content consumption and rewards',
      category: 'getting-started',
      icon: Trophy,
      content: `# 📖 How to Read Articles & Earn Points

Learn how to navigate content and maximize your power points and NADA earnings!

---

## 📰 Finding Articles to Read

### Explore Tab (Home)
The **Explore** tab is your main content feed:

1. Click the **🏠 Home button** in bottom navbar
2. Browse the article feed
3. Scroll through featured and recent articles
4. Use **Swipe Mode** for quick browsing

### Article Feed Features:
- **Cover images** for visual appeal
- **Reading time** estimates
- **Author information**
- **Preview excerpts**
- **Category tags**

---

## 📚 Reading Articles

### How to Open an Article:
1. Click on any article card
2. Article opens in full-screen reader
3. Read at your own pace
4. Earn **10 power points** automatically

### Reader Features:
- Clean, distraction-free layout
- Responsive text sizing
- Theme support
- Share buttons
- Author information

---

## 🎮 Swipe Mode

Quick browsing with game-like controls:

### How It Works:
1. Enable **Swipe Mode** in Explore
2. Swipe **RIGHT** to like an article (3 power points)
3. Swipe **LEFT** to skip (1 power point)
4. Articles you like are saved to your reading list

### Swipe Mode Benefits:
- Fast content discovery
- Earn power points while browsing
- Find articles that interest you
- Build your reading list

---

## 💰 Understanding the Points System

### ⚡ Power Points (Reading Rewards)
Reading activities earn power points:
- **Read an article:** 10 power points
- **Swipe through article:** 1 power point
- **Like an article (swipe right):** 3 power points
- **Share an article:** 5 power points

### 💎 Converting to NADA
- **Power points convert to NADA** in your wallet
- Use NADA to buy themes, badges, and features

### Daily Streak Bonus:
Login every day to multiply your rewards:
- Days 1-6: Standard rewards
- Day 7+: **2x multiplier**
- Day 30+: **3x multiplier**

---

## 📊 Track Your Reading Stats

### View Your Progress:
1. Click **ME** button
2. See your dashboard with:
   - Total articles read
   - Total power points earned
   - Current streak
   - Longest streak
   - Reading achievements

### Reading Achievements:
Unlock badges by hitting reading milestones:
- Read 1 article: First Reader badge
- Read 10 articles: Curious Mind badge
- Read 50 articles: Bookworm badge
- Read 100 articles: Scholar badge

---

## 💡 Maximize Your Points

### Daily Routine:
1. **Login daily** - Maintain streak
2. **Read 3-5 articles** - 30-50 power points
3. **Use Swipe Mode** - Quick power points
4. **Share interesting articles** - 5 power points each
5. **Convert power points** to NADA regularly

### Weekly Goals:
- Read 20+ articles: 200+ power points
- Maintain 7-day streak: 2x multiplier unlocked
- Complete reading achievements: Unlock badges

### Monthly Targets:
- Read 100+ articles: 1000+ power points
- Maintain 30-day streak: 3x multiplier unlocked
- Unlock all reading achievements

---

## 🎯 Reading Achievements

### Achievement Badges:

**First Reader:**
- Read your first article: Unlock First Reader badge

**Curious Mind:**
- Read 10 articles: Unlock Curious Mind badge

**Bookworm:**
- Read 50 articles: Unlock Bookworm badge

**Scholar:**
- Read 100 articles: Unlock Scholar badge

**Knowledge Seeker:**
- Read 500 articles: Unlock Knowledge Seeker badge (Legendary!)

---

## 🚀 Level Up Your Reading

### Advanced Tips:
1. **Follow organizations** to see their latest articles
2. **Build reading lists** with Swipe Mode
3. **Share articles** to earn extra power points
4. **Convert power points** to NADA in your wallet

### Community Engagement:
- Read and learn
- Share knowledge
- Support creators
- Build your reputation

---

## 🎉 Happy Reading!

Start exploring content, earning NADA, and learning about hemp and sustainability!

**Every article you read contributes to your knowledge and rewards.**`
    },

    // FEATURES & CUSTOMIZATION
    {
      id: 'theme-system',
      title: 'Theme System Guide',
      description: 'Learn about themes and customization options',
      category: 'features',
      icon: Palette,
      content: `# 🌓 Theme System

## Overview

Hemp'in Universe features a **complete theme system** with 4 beautiful themes!

---

## 🎨 Available Themes

### **Default (Light)**
- Clean white background
- Hemp green accents
- Professional and crisp

### **Solarpunk Dreams (Emerald/Gold)**
- Deep forest greens
- Emerald and gold accents
- Nature-inspired palette
- **DEFAULT for new users**

### **Midnight Hemp (Purple/Bioluminescent)**
- Dark purple background
- Bioluminescent accents
- Futuristic and mystical

### **Golden Hour (Warm Sunset)**
- Warm amber tones
- Sunset gradients
- Cozy and inviting

---

## 🎯 Theme Features

- ✅ Smooth animated transitions
- ✅ Remembers your preference (localStorage)
- ✅ Instant theme switching
- ✅ Beautiful gradients and effects
- ✅ Mobile-optimized
- ✅ All components theme-aware

---

## 🛍️ Unlock Premium Themes

**Where to Get Themes:**
- Visit the **Plugins Shop** (ME → Plugins Shop)
- Purchase themes with NADA points
- Instant activation after purchase

**Theme Prices:**
- Solarpunk Dreams: FREE (default)
- Midnight Hemp: 50 NADA
- Golden Hour: 50 NADA

---

## 🔧 How to Switch Themes

1. Click the **Theme Button** in top navbar (sun/moon icon)
2. Select your desired theme
3. Theme applies instantly!
4. Your choice is saved automatically

---

## 🎨 Theme Button Location

The theme selector appears in the **top navigation bar** on most pages:
- Landing page
- Article reader
- Browse page
- User dashboard
- Wiki (you're here!)

---

## 💡 Pro Tips

### Color Variables
All themes use CSS variables, so every component automatically adapts to your chosen theme.

### Accessibility
All themes meet WCAG contrast requirements for maximum readability.

### Mobile Experience
Themes look great on all screen sizes with optimized gradients and effects.`
    },
    {
      id: 'profile-system',
      title: 'Profile System',
      description: 'Customize your profile, badges, and settings',
      category: 'features',
      icon: Palette,
      content: `# 🌿 Profile System Guide

## 📋 Overview

Your profile is your identity in Hemp'in Universe. Customize it with badges, themes, and more!

---

## ✅ Current Profile Features

### **Badge Persistence**

Your active badge is persistent across sessions!

#### How It Works:
1. Click badge in Market Profile Panel
2. Backend saves to database
3. Local state updates immediately
4. Success toast shows confirmation
5. Badge persists across sessions!

---

## 🎯 How to Manage Your Profile

### Access Your Profile
1. Click the **ME** button in bottom navbar
2. Your profile panel opens with:
   - NADA balance
   - Current streak
   - Total points
   - Badge collection
   - Theme selector
   - Profile customization

### Equip Badges
1. **Open Market Profile** (click ME button)
2. **Click any badge** you own to equip it
3. **See success toast** confirming save
4. **Badge persists** across sessions!

---

## 🗄️ Profile Data Storage

### Saved to Database:
- Selected badge
- Selected theme
- Profile banner
- Nickname
- Total articles read
- Points and streaks
- Priority support status
- Market unlock status

---

## 🚀 Future: Public Profile System

### Coming Soon:
1. **Public Profile Toggle** - Make profile public/private
2. **Privacy Controls** - Hide/show email, stats, badges
3. **Display Name** - Custom name instead of email
4. **Profile Bio** - Personal description
5. **Profile Views** - Track who viewed your profile
6. **Featured Achievement** - Pin a favorite achievement
7. **Public Profile URL** - Shareable link

---

## 💡 Profile Customization Tips

### Badges
- Earn badges through achievements
- Purchase badge packs in Plugins Shop
- Equip your favorite to show off

### Themes
- Purchase premium themes
- Switch anytime in profile panel
- Theme persists across devices

### Banners
- Upload custom profile banner
- Showcase your personality
- Updates instantly`
    },
    {
      id: 'globe-system',
      title: 'Hemp Atlas - 3D Globe',
      description: 'Interactive world map with company directory',
      category: 'features',
      icon: Globe,
      content: `# 🌍 Hemp Atlas - 3D Globe System

## 🎯 Overview

The Hemp Atlas is a **public, interactive 3D Earth visualization** with a layered data system. Browse hemp companies around the world!

### Key Features:
- 🌍 **Public Access** - Globe viewable by everyone
- 🎨 **Full Customization** - Color pickers for ocean, land, atmosphere
- 🗂️ **Layer System** - Toggle different data layers
- 🔐 **Auth-Gated Data** - Layers unlock when signed in
- 💾 **Persistent Preferences** - Custom styles save automatically

---

## 🗂️ Layer System

### Currently Available Layers:

#### **1. Organizations**
- **Color:** Emerald green
- **Shows:** Hemp companies worldwide
- **Requires Auth:** Yes
- **Status:** ✅ Functional

#### **2. Shops & Products**
- **Color:** Amber
- **Shows:** Product locations
- **Requires Auth:** Yes
- **Status:** ✅ Functional

### Future Layers (Coming Soon):
- Events & Meetups
- Cultivation Sites
- Street Addresses (city-level zoom)

---

## 🎨 Customization Options

### Color Controls:
- **Ocean Color** - Water color
- **Land Color** - Terrain color
- **Atmosphere Color** - Glow around Earth
- **Atmosphere Intensity** - Brightness of glow
- **Star Color** - Background stars
- **Star Density** - How many stars
- **Rotation Speed** - Globe auto-rotation

### Visual Effects:
- Grid Lines - Show lat/long grid
- Cel-Shaded - Comic book style
- Holographic - Futuristic shimmer
- Particle Effects - Floating particles

---

## 🎨 Preset Themes

### **Solarpunk**
- Emerald ocean
- Dark forest land
- Golden atmosphere
- Classic Hemp'in look

### **Midnight**
- Deep blue ocean
- Dark purple land
- Cyan atmosphere
- Night mode aesthetic

### **Golden Hour**
- Warm amber ocean
- Desert tan land
- Orange atmosphere
- Sunset vibes

### **Retro Game**
- Bright cyan ocean
- Lime green land
- Magenta atmosphere
- 1980s arcade nostalgia

---

## 🚀 How to Use

1. Visit the Globe from navigation
2. Customize colors and effects
3. Toggle data layers on/off
4. Click markers to view details
5. Zoom and rotate to explore

---

## 💡 Pro Tips

### For Best Experience:
- Use desktop for full controls
- Sign in to unlock data layers
- Save your favorite preset
- Experiment with particle effects

### Navigation:
- **Click + Drag** - Rotate globe
- **Scroll** - Zoom in/out
- **Click Marker** - View company details
- **Layer Toggle** - Show/hide data`
    },

    // MARKETPLACE & SHOP
    {
      id: 'browse-marketplace',
      title: 'Browse the Marketplace',
      description: 'Discover hemp products from verified organizations',
      category: 'marketplace',
      icon: ShoppingBag,
      content: `# 🛍️ Browse the Hemp'in Marketplace

## 🎯 Overview

The Hemp'in Marketplace is your gateway to discovering verified hemp products from organizations around the world.

---

## 🚀 How to Access

1. Click the **BUD** icon in bottom navigation
2. Navigate to **Browse Marketplace** section
3. Explore products from verified hemp companies

---

## 🔍 Finding Products

### Browse by Category:
- **Apparel** - Hemp clothing and fashion
- **Accessories** - Bags, wallets, jewelry
- **Food & Wellness** - CBD products, hemp seeds, supplements
- **Seeds** - Hemp seeds for cultivation
- **Education** - Books, courses, resources
- **Other** - Miscellaneous hemp products

### Search Features:
- Search by product name
- Filter by category
- Sort by price
- View featured products

---

## 💰 Conscious Shopping & NADA Rewards

### Earn NADA Points from Purchases:
- **Base reward:** 50 NADA per purchase
- **Verified provenance:** +25 NADA
- **High conscious score (90+):** +25 NADA
- **Regenerative certification:** +50 NADA
- **Maximum:** 150 NADA per purchase!

### Conscious Score Explained:
Products receive a 0-100 score based on:
- Hemp quality and certifications
- Fair trade practices
- Environmental impact
- Transparency and verification

---

## 🌿 Hemp Provenance Tracking

Learn the story behind each product:
- **Hemp Source** - Where the hemp was grown
- **Country of Origin** - Geographic location
- **Certifications** - Organic, Fair Trade, Regenerative, etc.
- **Carbon Footprint** - Environmental impact
- **Processing Method** - How it was made
- **Fair Trade Verification** - Ethical sourcing

---

## 🛒 How to Purchase

### Purchase Flow:
1. **Browse** products in marketplace
2. **Click** on a product card to view details
3. **Review** hemp provenance information
4. **See** NADA rewards calculation
5. **Click** "Purchase Product" button
6. **Earn** NADA points instantly
7. **Complete** purchase on external shop (Shopify, Lazada, etc.)

### External Shop Integration:
- Hemp'in Universe acts as a discovery platform
- Purchases are completed on the organization's shop
- We redirect you to Shopify, Lazada, Shopee, or custom stores
- NADA points are awarded when you click through

---

## 🏆 Featured Products

Look for the **⭐ Featured** badge on special products:
- Curated by organizations
- Highest quality items
- Best conscious scores
- Limited edition offerings

---

## 🔐 Badge-Gated Products

Some products require special badges to access:
- **Members Only** - Organization membership badges
- **Exclusive Access** - Limited to badge holders
- **Loyalty Rewards** - For active community members

How to get badges:
- Join organizations
- Purchase badge packs in Plugins Shop
- Complete achievements
- Participate in community events

---

## 💡 Pro Tips

### Maximize Your Rewards:
1. **Look for high conscious scores** (90+) for bonus NADA
2. **Prioritize regenerative products** (+50 NADA)
3. **Check hemp provenance** for quality assurance
4. **Support verified organizations** for best deals

### Smart Shopping:
- Compare products across organizations
- Read full descriptions
- Check certifications
- View hemp source locations on the globe

---

## 🌍 Connect with Organizations

### Discover Sellers:
- View organization profiles
- Read their story and mission
- See all their products
- Contact them directly
- Follow for updates

### Organization Features:
- Company verification status
- Location on Hemp Atlas
- Product catalog
- Articles and publications
- Team members

---

## 🆘 Support

### Need Help?
- Product questions: Contact the organization directly
- Technical issues: Use Priority Support (if purchased)
- General questions: Check the Wiki

---

## 🎉 Happy Shopping!

Discover quality hemp products, support verified organizations, and earn NADA points while building a sustainable future!

**Every purchase supports the global hemp community.**`
    },
    {
      id: 'add-products',
      title: 'How to Add Products',
      description: 'Complete guide for organization owners',
      category: 'marketplace',
      icon: ShoppingBag,
      content: `# 📦 How to Add Products as an Organization Owner

## 🎯 Quick Answer

As an organization owner, you can add products to the Hempin Swag Supermarket through your Organization Dashboard's **Swag Tab**.

---

## 📍 Navigation Path

\`\`\`
MARKET → Profile (top right) → Organizations Button → 
Select Your Company → Swag Tab → Add Product Button
\`\`\`

---

## 🛤️ Step-by-Step Guide

### Step 1: Access Your Organization Dashboard
1. Click the **BUD** icon in bottom navigation to enter **MARKET**
2. Click your **Profile icon** in top right corner
3. Look for the **"Organizations"** button on your profile page
4. Click it to access the Organization Dashboard

### Step 2: Select Your Organization
- You'll see a list of all organizations you own
- Click on the organization card where you want to add products
- This opens the **CompanyManager** interface

### Step 3: Navigate to the Swag Tab
The CompanyManager has 6 tabs:
- **Overview** - Company information summary
- **Profile** - Edit company details
- **Swag Shop** ← This is where you manage products!
- **Publications** - Company articles
- **Badges** - Company badges
- **Members** - Team management

Click the **Swag Shop** tab to open the product management interface.

### Step 4: Add a New Product
1. Click the green **"Add Product"** button
2. Fill out the product form
3. Click **"Create Product"** to submit

---

## 📝 Product Form Fields

### Required Fields
- **Product Name** - The name of your product

### Product Details
- **Description** - Full detailed product description
- **Short Description** - Brief summary for product cards

### Pricing
- **Price** - Numeric value (e.g., 29.99)
- **Currency** - Currency code (e.g., USD, EUR, PHP)

### Images
- **Product Image URL** - Direct link to product image
  - Recommended size: 800x800px or larger

### Organization & Stock
- **Category** - Apparel, Accessories, Seeds, Education, Other
- **Inventory** - Number of items in stock (leave empty for unlimited)

### External Shop Integration
- **External Shop URL** - Link to your Shopify, Lazada, Shopee, or custom shop
- **Platform** - Select platform type

### Product Flags (Checkboxes)
- ✅ **In Stock** - Product is currently available
- ✅ **Requires Badge** - Badge-gated product
- ✅ **Active** - Product is active in catalog
- ✅ **Featured Product** - Highlighted with star badge
- ✅ **Published** - Product is visible to public (IMPORTANT!)

---

## 🚀 Publishing Your Product

### ⚠️ IMPORTANT: Products must be **Published** to appear in the marketplace!

By default, new products are created as **drafts**. To make them visible:

**Option A: Publish during creation**
- Check the **"Published"** checkbox when creating the product

**Option B: Publish after creation**
- Find the product in your Swag tab
- Click the **Eye icon** in quick actions
- Product toggles from draft to published

---

## 💡 Pro Tips

### For Best Results:
1. **Add high-quality images** - Clear, well-lit photos
2. **Write compelling descriptions** - Tell your product's story
3. **Use the excerpt field** - Appears on product cards
4. **Set competitive pricing** - Research similar products
5. **Feature your best products** - Use the star for top items

### External Shop Integration:
- Link to your existing online store
- Users complete purchases on your platform
- Hemp'in Universe acts as a discovery hub

### Badge-Gated Products:
- Create exclusive member offerings
- Only users with your badge can access
- Great for loyalty programs

---

## 🎉 Success!

Your products will now appear in the marketplace for hemp enthusiasts worldwide to discover!`
    },

    // GAMIFICATION
    {
      id: 'gamification-guide',
      title: 'Points & Gamification',
      description: 'Learn how to earn NADA points and unlock achievements',
      category: 'gamification',
      icon: Trophy,
      content: `# 🎮 Points & Gamification Guide

## 📊 Point System Summary

Hemp'in Universe has **TWO types of points**:

### ⚡ Power Points (Action Rewards):
- 📖 **Read Article:** 10 power points
- 🔄 **Share Article:** 5 power points
- 👆 **Swipe Article:** 1 power point
- ❤️ **Like Article:** 3 power points (1 swipe + 2 bonus)

### 💎 NADA Points (Currency):
- 💰 **Convert Power Points:** Exchange in wallet
- 🛍️ **Conscious Purchases:** Earn bonus NADA

---

## 🎯 How to Earn Points

### Reading Articles (Power Points)
- Browse articles in **Explore** tab
- Open any article to read
- Earn **10 power points** per article
- Convert power points to NADA in wallet
- Track your reading history in dashboard

### Sharing Articles (Power Points)
- Click share button on any article
- Share to social media
- Earn **5 power points** per share
- Spread the hemp knowledge!

### Swiping in Explore (Power Points)
- Use **Swipe Mode** in Explore page
- Swipe right (like) or left (skip)
- Earn **1-3 power points** per swipe
- Fun, quick points!

---

## 🏆 Achievement System

Unlock achievements for collection and bragging rights:

- **Common** achievements
- **Uncommon** achievements
- **Rare** achievements
- **Epic** achievements
- **Legendary** achievements
- **Mythic** achievements

Track your progress in your profile dashboard!

---

## 🔥 Streak System

### How Streaks Work:
- Login daily to maintain streak
- Miss a day = streak resets
- Longer streaks = bigger bonuses

### Streak Multipliers:
- **Day 1-6:** Base power point rewards
- **Day 7+:** 2x power point multiplier
- **Day 30+:** 3x power point multiplier
- Maximum engagement incentive!

---

## 🛍️ Spending NADA Points

### Plugins Shop
Visit **ME → Plugins Shop** to purchase:
- **Themes** (50-75 NADA)
- **Badge Collections** (25-100 NADA)
- **Priority Support** (250 NADA)
- **Profile Banners** (150 NADA)

### Swag Marketplace
- Earn bonus NADA from purchases
- Conscious products give more NADA
- Regenerative items = highest NADA rewards

---

## 📊 Track Your Progress

### Dashboard Stats:
- Total power points earned
- Total NADA balance
- Current streak count
- Longest streak record
- Articles read/created
- Achievements unlocked

### Leaderboard (Coming Soon):
- Compare with other users
- Weekly/monthly rankings
- Special badges for top performers

---

## 💡 Pro Tips

### Maximize Your Points:
1. **Read daily** - 10 power points + maintain streak
2. **Convert power points** to NADA regularly
3. **Share often** - Easy 5 power points each time
4. **Use Swipe Mode** - Quick power points while browsing
5. **Complete achievements** - Unlock badges and bragging rights

### Streak Strategy:
- Set a daily reminder
- Quick login counts
- Even 1 minute maintains streak
- Plan ahead for travel/busy days

### Smart Spending:
- Save NADA for premium themes
- Unlock priority support for help
- Collect badges to show off
- Profile banners for personality`
    },

    // COMPANY DIRECTORY
    {
      id: 'company-directory',
      title: 'Company Directory Guide',
      description: 'Manage organizations and claim companies',
      category: 'company',
      icon: Globe,
      content: `# 🏢 Company Directory & Management

## 🌍 Overview

The Hemp'in Company Directory is your gateway to discovering and managing hemp organizations worldwide.

---

## 🎯 Key Features

### For Everyone:
- 🌍 **Browse companies** on interactive 3D globe
- 🔍 **Search and filter** by country, type, products
- 📊 **View company profiles** with full details
- 🗺️ **Explore Hemp Atlas** with data layers

### For Organization Owners:
- 🏢 **Claim your company**
- ✏️ **Edit company information**
- 👥 **Manage team members**
- 📝 **Publish articles** as organization
- 🛍️ **Add products** to swag marketplace
- 🏆 **Award association badges** to members

---

## 🚀 How to Add Your Company

### Step 1: Access Company Manager
1. Click **MARKET** (BUD icon)
2. Click **Profile** (top right)
3. Click **Organizations** button
4. Click **Add Organization**

### Step 2: Fill Company Details
**Required:**
- Company name
- Country
- Company type (Manufacturer, Retailer, Farm, etc.)

**Optional but Recommended:**
- Description
- Website
- Email contact
- Phone number
- Social media links
- Products/services
- Certifications

### Step 3: Add Location
- Enter address or coordinates
- Location appears on Hemp Atlas globe
- Helps customers find you

### Step 4: Verify Company
- Submit for verification
- Verified badge appears on profile

---

## 🗺️ Hemp Atlas Features

### Interactive Globe:
- **Zoom** to explore regions
- **Click markers** to see company details
- **Toggle layers** for different data types
- **Customize colors** and effects

### Data Layers:
- 🏢 **Organizations** - All hemp companies
- 🛍️ **Shops & Products** - Product locations
- 🎉 **Events** (coming soon)
- 🌱 **Farms** (coming soon)

---

## 👥 Team Management

### Add Team Members:
1. Go to your organization dashboard
2. Click **Members** tab
3. Enter member email
4. Assign role (Admin, Editor, Viewer)
5. Send invite

### Member Roles:
- **Owner** - Full control
- **Admin** - Manage everything except deletion
- **Editor** - Edit content and products
- **Viewer** - View only access

---

## 🏆 Association Badges

### Create Organization Badge:
1. Design your badge
2. Set badge criteria
3. Award to members/customers
4. Badge appears in their collection

### Badge Benefits:
- Brand loyalty program
- Member identification
- Exclusive access to products
- Community building

---

## 💡 Pro Tips

### Optimize Your Profile:
- Add high-quality logo
- Write detailed description
- Include all contact methods
- List certifications
- Upload product photos

### Increase Visibility:
- Publish regular articles
- Add products to marketplace
- Engage with community
- Verify your company
- Feature best products

### Build Community:
- Award badges to customers
- Create exclusive products
- Share company news
- Respond to inquiries`
    },

    // UPDATES & RELEASES
    {
      id: 'v1-1-release',
      title: 'V1.1 Release Notes',
      description: 'Latest updates and new features',
      category: 'updates',
      icon: Newspaper,
      content: `# 🌿 Hemp'in Universe V1.1 - Release Notes

## ✨ Major Updates

### 🎨 Visual Design Overhaul

#### **Top Navbar Theme Button**
- Increased icon size for better visibility
- Added transparent gradient glow effect
- Clean, minimal design

#### **Bottom Navigation Bar - Complete Redesign**
- **Home Button:** Emerald/Teal gradient circle with white icon
- **Me Button:** Sky/Purple/Pink gradient circle (elevated, larger)
- **Create Button:** Emerald/Teal/Cyan gradient

**New Features:**
- Gradient circle backgrounds for all buttons
- White icons inside colored circles
- Shine effects on top-right of each circle
- Transparent gradient auras around buttons
- Always-visible colored gradients
- Smooth hover and active state animations

---

### 🌐 Branding & Meta Updates

#### **New Site Identity: "Hemp'in Universe"**
- Updated site title to "Hemp'in Universe - DEWII Magazine V1.1"
- New tagline: "Your gateway to the solarpunk future"

#### **New Favicon**
- Beautiful green gradient orb SVG
- Features highlight effects and glow
- Looks great on all browsers and devices

#### **Social Media Preview (OG Image)**
- Created 1200x630 SVG preview image
- Dark gradient background with Hemp'in branding
- Large green orb icon
- Gradient text effects

#### **Complete Meta Tags**
- ✅ Primary meta tags
- ✅ Open Graph tags (Facebook/LinkedIn)
- ✅ Twitter Card tags
- ✅ Theme colors
- ✅ Apple mobile web app config
- ✅ PWA-ready meta tags

---

## 🎨 Design System

### Color Palette

**Navigation Buttons:**
- **Explore:** \`from-emerald-400 via-teal-500 to-emerald-500\`
- **Me:** \`from-sky-500 via-purple-500 to-pink-500\`
- **Create:** \`from-emerald-400 via-teal-500 to-cyan-500\`

**Brand Colors:**
- Primary Hemp Green: \`#10b981\`
- Light Hemp: \`#6ee7b7\`
- Medium Hemp: \`#34d399\`
- Dark Hemp: \`#059669\`

### Effects

**Glow/Aura Effects:**
- Base opacity: 10% (always visible)
- Hover opacity: 20%
- Active opacity: 30% with pulse
- Blur radius: blur-3xl

**Shine Effects:**
- White spot at top-right
- Creates glossy, polished look
- Applied to all circular buttons

---

## 🚀 What's Coming Next

Check out the **Roadmap** in the What's New section for upcoming features!

---

## 🎉 Thank You

Thank you to our community for your feedback and support. This release makes Hemp'in Universe more beautiful, accessible, and ready for growth!

**Built with 💚 for the global hemp community**`
    },
    {
      id: 'roadmap',
      title: 'Future Roadmap',
      description: 'What\'s coming next to Hemp\'in Universe',
      category: 'updates',
      icon: Sparkles,
      content: `# 🌿 Hemp'in Universe - Future Roadmap

*Organized by capabilities you'll unlock, not calendar dates*

---

## 🎯 NEXT UP: Earn NADAs by Building the Map

### What You'll Be Able to Do:

**🌍 Add Your Company to the Hemp Atlas**
- See a company missing from the globe? Add it yourself
- Claim your own organization and manage its profile
- Update information for companies you know
- Verify details like certifications, products, contact info

**💰 Earn NADAs for Contributing**
- Add a new verified organization → **+20 NADA**
- Claim your organization → **+15 NADA**
- Update/verify company information → **+5-10 NADA per update**
- Be the first to add a well-known company → **+25 NADA bonus**

**🛍️ Spend Your NADAs in the Plugins Shop**
- Theme packs
- Badge collections
- Priority support
- Profile banners

**Why This Matters:**
- **For Farmers:** Get your cooperative on the map, earn points, connect with buyers
- **For Associations:** Add all your member organizations at once
- **For Shop Owners:** Add your suppliers, help customers discover verified hemp sources

**Our Goal:** Grow from dozens to **1,000+ hemp organizations** on the globe with YOUR help.

---

## 📱 NEXT UP: Landscape Mode for Mobile

### What You'll Be Able to Do:

**🎮 Gaming-Style Controls When You Rotate Your Phone**
- Top/bottom navbars become left/right side bars
- Buttons stay in the same screen position
- All actions within thumb reach
- Swipe through articles like mobile game menus

**Why This Matters:**
- **For Farmers:** Easier to use while working (one-handed control)
- **For Associations:** Better for presentations
- **For Shop Owners:** Show products in landscape view naturally

---

## 📊 NEXT UP: Article Categories & Discovery

### What You'll Be Able to Do:

**📚 Browse Articles by Topic**
- Sustainability, Innovation, Legal, Business, Culture, Science
- Filter content that matters to YOUR work
- Suggest new categories the industry needs

**💡 Request Topics You Want to See**
- Submit category ideas in suggestion box
- Vote on categories other users suggest

**Why This Matters:**
- **For Farmers:** Find farming techniques easily
- **For Associations:** Track legal developments
- **For Shop Owners:** Discover product innovation

---

## ✍️ COMING SOON: Powerful Publishing Tools

### What You'll Be Able to Do:

**📝 Write Articles as an Organization**
- Publish under your organization's name
- Collaborate with multiple authors
- Share drafts between team members
- Set roles (who can write, edit, publish)

**📎 Import from LinkedIn**
- Pull your LinkedIn posts into DEWII
- Publish under your organization or personal profile
- Keep your best content in one place

**📄 Upload Scientific Papers (PDF)**
- Upload research papers and reports
- AI extracts and formats the content
- Citations preserved

---

## 🛍️ COMING SOON: Full E-Commerce Marketplace

### What You'll Be Able to Do:

**🔗 Connect Your Existing Online Stores**
Sync products from:
- Shopify
- WordPress WooCommerce
- Lazada
- Amazon
- Auto-sync inventory and pricing

**💬 Message Buyers & Sellers Directly**
- Chat interface for product inquiries
- Share files (specs, certifications, photos)
- Product inquiry templates

**💰 Negotiate Prices & Make Deals**
- Counter-offer system for bulk orders
- Request discount quotes
- Generate formal deal documents

---

## 🤖 COMING SOON: BUD AI Gets Smarter

### What You'll Be Able to Do:

**💬 Ask BUD Anything About Hemp**
BUD will help with:
- "Find hemp textile manufacturers in Portugal"
- "What are export requirements for CBD to Germany?"
- "I need 500kg of hemp fiber, who can supply?"

**📚 BUD Learns From Everything on DEWII**
- Every article published trains BUD
- Legal papers feed regulatory knowledge
- Organization database = supplier directory

---

## 🔄 How Development Works

**We don't build on fixed schedules.**
We build features when they're ready to solve real problems.

Each capability above unlocks when:
✅ The technology is stable
✅ The user experience is tested
✅ The infrastructure can support it
✅ The community needs it

**You'll know it's ready when it appears in DEWII.**

---

## 💬 Your Input Shapes This Roadmap

**How to influence what we build next:**
- 🗳️ Vote in the Hemp Forum on feature priorities
- 💬 Share your needs in discussions
- 📧 Contact us with specific use cases
- 🐛 Report what's not working
- 💡 Suggest new capabilities

---

**Built with 💚 for the global hemp community**
**One feature at a time. One improvement at a time. Together.**`
    },
    {
      id: 'three-rails-architecture',
      title: 'Three Rails Architecture',
      description: 'The evolution to marketplace operating system',
      category: 'updates',
      icon: Network,
      content: threeRailsContent
    }
  ]

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentView('category')
  }

  const handleDocumentClick = (doc: WikiDocument) => {
    setSelectedDocument(doc)
    setCurrentView('document')
  }

  const handleBack = () => {
    if (currentView === 'document') {
      setCurrentView('category')
      setSelectedDocument(null)
    } else if (currentView === 'category') {
      setCurrentView('home')
      setSelectedCategory(null)
    }
  }

  const handleHome = () => {
    setCurrentView('home')
    setSelectedCategory(null)
    setSelectedDocument(null)
  }

  // Get documents for selected category
  const categoryDocuments = selectedCategory 
    ? documents.filter(doc => doc.category === selectedCategory)
    : []

  // Get category info
  const currentCategory = categories.find(cat => cat.id === selectedCategory)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Wiki Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-card rounded-2xl shadow-2xl border-2 border-border z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
              {/* Hemp texture overlay */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px'
              }} />

              {/* Navigation Row */}
              <div className="relative flex items-center justify-between mb-4">
                {/* Left: Back and Home buttons */}
                <div className="flex items-center gap-2">
                  {currentView !== 'home' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  )}
                  {currentView !== 'home' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleHome}
                      className="gap-2"
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Right: Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Centered Icon and Title */}
              <div className="relative flex flex-col items-center text-center">
                <div className="bg-primary/10 p-2.5 rounded-lg mb-3">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {currentView === 'home' && 'Hemp\'in Universe Wiki'}
                  {currentView === 'category' && currentCategory?.title}
                  {currentView === 'document' && selectedDocument?.title}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  {currentView === 'home' && 'Your guide to everything Hemp\'in'}
                  {currentView === 'category' && currentCategory?.description}
                  {currentView === 'document' && selectedDocument?.description}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {/* HOME VIEW - Category Grid */}
                {currentView === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Welcome to the Hemp'in Universe knowledge base. Explore guides, tutorials, and documentation to make the most of your experience.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category, index) => (
                        <motion.button
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleCategoryClick(category.id)}
                          className="group relative p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-accent/50 text-left transition-all hover:scale-105 overflow-hidden"
                        >
                          {/* Gradient background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                          
                          {/* Content */}
                          <div className="relative">
                            <category.icon className="w-8 h-8 mb-3 text-primary" />
                            <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                            <div className="mt-4 flex items-center text-sm text-primary">
                              <span>View guides</span>
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* CATEGORY VIEW - Document List */}
                {currentView === 'category' && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {categoryDocuments.map((doc, index) => (
                      <motion.button
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleDocumentClick(doc)}
                        className="group w-full p-4 rounded-lg border-2 border-border hover:border-primary/50 bg-card hover:bg-accent/50 text-left transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <doc.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                          </div>
                          <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* DOCUMENT VIEW - Content */}
                {currentView === 'document' && selectedDocument && (
                  <motion.div
                    key="document"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="prose prose-lg dark:prose-invert max-w-none"
                  >
                    <MarkdownRenderer content={selectedDocument.content} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}