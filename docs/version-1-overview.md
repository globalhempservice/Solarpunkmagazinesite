# Solarpunk Magazine Site — Version 1 Feature Overview

## Product Snapshot
Solarpunk Magazine Site is a gamified reading platform that blends editorial content, community streaks, and creation tools for a solar-punk publication. The single-page React application connects to Supabase for authentication, content storage, and progress tracking.

## Authentication & Access Control
- Email/password login and signup backed by Supabase, including custom signup flow and session persistence on reloads.【F:src/App.tsx†L52-L136】【F:src/App.tsx†L200-L251】
- Logout handling resets in-memory state and returns users to the article feed view.【F:src/App.tsx†L242-L255】

## Article Discovery
- Landing feed lists fetched articles with skeleton loaders and empty-state messaging while data is loading.【F:src/App.tsx†L107-L133】【F:src/App.tsx†L529-L553】
- Search bar and category badges filter the grid, displaying active filters and counts per category.【F:src/App.tsx†L391-L527】
- Bottom navigation and responsive layout support mobile-first browsing across views.【F:src/App.tsx†L424-L633】

## Reading Experience
- Dedicated reader presents article metadata, paragraphs, and optional multimedia attachments (YouTube, audio, imagery).【F:src/components/ArticleReader.tsx†L1-L139】【F:src/components/ArticleReader.tsx†L293-L333】
- Gamified card highlights current streak, total reads, and points with sharing incentives.【F:src/components/ArticleReader.tsx†L175-L288】
- Suggested follow-up articles and explore-more controls encourage continued engagement.【F:src/components/ArticleReader.tsx†L334-L395】

## Progress & Gamification
- Article views update Supabase, reward points, and trigger toast achievements when milestones are unlocked.【F:src/App.tsx†L253-L299】
- Reading streak banner surfaces current streak, longest streak, and points directly in the feed.【F:src/App.tsx†L438-L444】
- Reading history view summarizes completed articles and lets users reopen them from the dashboard.【F:src/App.tsx†L610-L624】

## Creation Tools
- Rich article editor tracks completion progress with a quality score, actionable checklist, and animated feedback.【F:src/components/ArticleEditor.tsx†L65-L147】【F:src/components/ArticleEditor.tsx†L191-L200】
- Supports categorization, excerpt generation, reading-time estimation, and multimedia attachments with add/remove controls.【F:src/components/ArticleEditor.tsx†L55-L190】
- Handles both new submissions and updates to existing drafts via shared form logic.【F:src/App.tsx†L300-L390】

## Personal & Community Spaces
- User dashboard surfaces progress stats, authored articles, editing hooks, and entry points to reading history.【F:src/App.tsx†L557-L566】
- Admin panel gives a system-wide view of articles with refresh and delete controls for maintenance tasks.【F:src/App.tsx†L594-L607】
- Article sharing via URL parameters loads shared content directly, enabling social discovery flows.【F:src/App.tsx†L90-L198】

## Infrastructure Notes
- Front end communicates with Supabase Edge Functions for articles, progress, and account management using public anon and session tokens.【F:src/App.tsx†L67-L175】【F:src/App.tsx†L300-L389】
- Toast notifications provide immediate feedback for success, error, and achievement events across the experience.【F:src/App.tsx†L127-L130】【F:src/App.tsx†L214-L328】

---
_Last updated: Version 1 overview authored by ChatGPT with context provided by Paul Iglesia._
