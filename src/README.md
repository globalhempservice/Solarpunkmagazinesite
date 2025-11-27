# DEWII Magazine - Solarpunk Hemp Industry Platform

A comprehensive magazine and marketplace platform built with React, Supabase, and Netlify, featuring:

- 🌿 **Hemp'in Magazine** - Articles, reading tracking, gamification with points/streaks/achievements
- 🌍 **Company Directory** - Interactive 3D globe world map browser with hemp industry organizations
- 🏪 **Dual Swag Systems**:
  - Personal SWAG SHOP (NADA points for themes/badges/merch)
  - HEMPIN SWAG SUPERMARKET (organization product catalogs)
- 🎨 **Hemp'in Canonical Color System** - Solarpunk futuristic comic aesthetic
- 🤖 **BUD Mascot** - Guardian between MAG and MARKET flows

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Deployment**: Netlify
- **3D Graphics**: Three.js, react-globe.gl
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Hooks
- **Authentication**: Supabase Auth with RLS

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Local Development

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**:
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## Deployment to Netlify

### Option 1: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings are auto-detected from `netlify.toml`

3. **Set Environment Variables** in Netlify:
   - Go to Site settings → Environment variables
   - Add your Supabase credentials:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

## Current Status

✅ Complete authentication system with RLS
✅ Article management and reading tracking
✅ Gamification with points, streaks, achievements
✅ Company directory with 3D globe browser
✅ Organization dashboard with Hemp'in branding
✅ Dual swag systems (personal + organizational)
⚠️ Testing SWAG tab routing and product management

## Known Issues

- **SWAG Tab 404**: Troubleshooting routing conflicts between personal SWAG SHOP and organizational SWAG SUPERMARKET
- **Product Save Failures**: Investigating authentication middleware integration

## Project Structure

```
/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn)
│   └── ...             # Feature components
├── supabase/
│   └── functions/
│       └── server/     # Edge functions (Hono server)
├── utils/              # Utility functions and helpers
├── styles/             # Global styles and themes
├── public/             # Static assets
└── sql-migrations/     # Database migration scripts
```

## Contributing

This is a private project for DEWII. For questions or support, contact the development team.

## License

Proprietary - All rights reserved
