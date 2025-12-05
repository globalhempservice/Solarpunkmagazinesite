# 🌿 Hemp'in Universe

**A Solarpunk Operating System for the Global Hemp Industry**

[![Version](https://img.shields.io/badge/version-1.1.0-emerald.svg)](https://mag.hempin.org)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Live Site](https://img.shields.io/badge/live-mag.hempin.org-blue.svg)](https://mag.hempin.org)

---

## 🌟 What is Hemp'in Universe?

Hemp'in Universe is a comprehensive web platform that combines:
- 📰 **Magazine** - Curated hemp industry content
- 🌍 **Hemp Atlas** - Interactive 3D globe mapping hemp organizations worldwide
- 🏢 **Organization Directory** - Verified hemp companies and places
- 🛍️ **SWAG Marketplace** - Hemp products catalog
- 🎮 **Gamification** - Power Points, NADA currency, achievements, and streaks
- 🔐 **Authentication** - Secure user accounts with social login
- 📊 **Analytics** - Reading insights and search analytics

---

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS v4** for styling
- **Motion/Framer Motion** for animations
- **React Globe GL** for 3D globe visualization
- **Three.js** for 3D graphics
- **Recharts** for analytics visualizations
- **Radix UI** for accessible components
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL database + Edge Functions)
- **Hono** web framework for Edge Functions
- **Row Level Security (RLS)** for data protection
- **PostGIS** for geospatial data

### Deployment
- **Netlify** for frontend hosting
- **Supabase** for backend services

---

## 📦 Key Features

### 🌍 Hemp Atlas 3D Globe
- Interactive 3D globe showing hemp organizations worldwide
- Real-time filtering by category, type, and region
- Organization markers with logos and info
- Smooth zoom animations and arc connections
- GTA-style cinematic transitions to street maps

### 🎮 Gamification System
- **Power Points (XP)** - Earned by reading articles
- **NADA Currency** - Convertible from Power Points
- **Achievements** - Unlock milestones and badges
- **Daily Streaks** - Reward consistent engagement
- **Leaderboards** - Compete with other readers

### 🏢 Organization System
- Create and manage hemp organizations
- Verified badges and association badges
- Link organizations to places, products, and articles
- Swag product catalogs
- Publications management
- Team member management
- Organization-to-organization relationships

### 📍 Places System
- Physical hemp locations (farms, factories, shops, dispensaries)
- Point locations and polygon boundaries (PostGIS)
- Organization-place relationships
- Admin approval workflow
- Street-level map integration

### 🛍️ SWAG Marketplace
- Organization product catalogs
- Hemp provenance tracking
- External shop integration
- Admin product management
- CSV bulk import

### 🔐 Security & Privacy
- Supabase Authentication
- Social login (Google, GitHub, Facebook, Discord)
- Row Level Security (RLS) policies
- Secure API routes with JWT validation
- Protected admin routes

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase account
- Netlify account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hempin-universe.git
cd hempin-universe
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
- Create a new Supabase project
- Run the database migrations in `/database_schemas/`
- Update `/utils/supabase/info.tsx` with your project ID and anon key

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

---

## 🗂️ Project Structure

```
hempin-universe/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Radix)
│   ├── figma/          # Figma imports
│   └── *.tsx           # Feature components
├── database_schemas/    # SQL schema files
├── supabase/
│   └── functions/
│       └── server/     # Edge Functions (Hono API)
├── styles/             # Global CSS
├── utils/              # Utility functions
├── public/             # Static assets
└── App.tsx             # Main application

```

---

## 🔑 Environment Variables

**Note:** This project uses Supabase's client SDK, so sensitive keys are managed securely.

**Frontend** (auto-configured):
- `projectId` - Your Supabase project ID
- `publicAnonKey` - Supabase public anon key (safe to expose)

**Backend** (Supabase secrets):
- `SUPABASE_URL` - Auto-configured
- `SUPABASE_ANON_KEY` - Auto-configured
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured (secret)
- `ADMIN_USER_ID` - Your admin user UUID

---

## 🎨 Design System

Hemp'in Universe uses a custom **Solarpunk Cosmic** design system:

- **Color Palette:** Emerald/Teal gradients with aurora accents
- **Typography:** Inter font family with custom tokens
- **Components:** Glassmorphism, rounded corners, gradient borders
- **Animations:** Smooth Motion/Framer Motion transitions
- **Dark Mode:** Default dark theme with light mode option

---

## 📊 Database Schema

The application uses multiple interconnected tables:

### Core Tables
- `articles` - Magazine content
- `user_profiles` - User data and gamification
- `organizations` - Hemp companies
- `places` - Physical locations (PostGIS)
- `products` - SWAG marketplace items

### Gamification
- `nada_transactions` - Currency ledger
- `achievements` - User milestones
- `reading_history` - Article engagement
- `daily_streaks` - Consecutive login tracking

### Relationships
- `organization_relationships` - Org-to-org connections
- `organization_place_relationships` - Org-to-place links
- `article_organizations` - Article authorship

See `/database_schemas/` for full SQL definitions.

---

## 🔐 Security

- **Row Level Security (RLS)** on all tables
- **JWT-based authentication** via Supabase Auth
- **Admin-only routes** with middleware protection
- **CORS** properly configured
- **Input validation** on all forms
- **SQL injection prevention** via parameterized queries

---

## 🚀 Deployment

### Netlify (Frontend)
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Supabase (Backend)
1. Push Edge Functions:
```bash
supabase functions deploy server
```
2. Set environment secrets in Supabase dashboard
3. Enable authentication providers (Google, GitHub, etc.)

---

## 🤝 Contributing

This is a private project. Please contact the Hemp'in team for contribution guidelines.

---

## 📝 License

**UNLICENSED** - Proprietary software. All rights reserved by Hemp'in.

---

## 🔗 Links

- **Live Site:** https://mag.hempin.org
- **Supabase Project:** [Contact for access]
- **Documentation:** See `/docs/` folder (coming soon)

---

## 🏗️ Roadmap

### ✅ Completed (V1.1)
- Magazine with article management
- 3D Hemp Atlas globe
- Organization directory
- Places system with PostGIS
- SWAG marketplace
- Gamification (Power Points, NADA, achievements)
- Organization relationships
- Admin dashboards

### 🚧 In Progress
- Hero Loop (Discovery Match system)
- SWAP Shop (second-hand barter marketplace)
- Unified Requests Hub
- Enhanced analytics

### 🔮 Future
- Mobile apps (React Native)
- AI-powered content recommendations
- Blockchain integration for provenance
- Multi-language support
- API for third-party integrations

---

## 📞 Support

For questions or support, contact: [Your support email]

---

**Built with 🌿 by the Hemp'in Team**

*Empowering the global hemp industry through technology and community.*
