import { BrandLogo } from "./BrandLogo"
import { Button } from "./ui/button"
import { ArrowLeft, Sparkles, Leaf, BookOpen, Compass } from "lucide-react"

const sections = [
  {
    title: "Product Snapshot",
    description:
      "Solarpunk Magazine Site is a gamified reading platform that blends editorial content, community streaks, and creation tools for a solar-punk publication. The single-page React application connects to Supabase for authentication, content storage, and progress tracking.",
  },
  {
    title: "Authentication & Access Control",
    bullets: [
      "Email/password login and signup backed by Supabase, including custom signup flow and session persistence on reloads.",
      "Logout handling resets in-memory state and returns users to the article feed view.",
    ],
  },
  {
    title: "Article Discovery",
    bullets: [
      "Landing feed lists fetched articles with skeleton loaders and empty-state messaging while data is loading.",
      "Search bar and category badges filter the grid, displaying active filters and counts per category.",
      "Bottom navigation and responsive layout support mobile-first browsing across views.",
    ],
  },
  {
    title: "Reading Experience",
    bullets: [
      "Dedicated reader presents article metadata, paragraphs, and optional multimedia attachments (YouTube, audio, imagery).",
      "Gamified card highlights current streak, total reads, and points with sharing incentives.",
      "Suggested follow-up articles and explore-more controls encourage continued engagement.",
    ],
  },
  {
    title: "Progress & Gamification",
    bullets: [
      "Article views update Supabase, reward points, and trigger toast achievements when milestones are unlocked.",
      "Reading streak banner surfaces current streak, longest streak, and points directly in the feed.",
      "Reading history view summarizes completed articles and lets users reopen them from the dashboard.",
    ],
  },
  {
    title: "Creation Tools",
    bullets: [
      "Rich article editor tracks completion progress with a quality score, actionable checklist, and animated feedback.",
      "Supports categorization, excerpt generation, reading-time estimation, and multimedia attachments with add/remove controls.",
      "Handles both new submissions and updates to existing drafts via shared form logic.",
    ],
  },
  {
    title: "Personal & Community Spaces",
    bullets: [
      "User dashboard surfaces progress stats, authored articles, editing hooks, and entry points to reading history.",
      "Admin panel gives a system-wide view of articles with refresh and delete controls for maintenance tasks.",
      "Article sharing via URL parameters loads shared content directly, enabling social discovery flows.",
    ],
  },
  {
    title: "Infrastructure Notes",
    bullets: [
      "Front end communicates with Supabase Edge Functions for articles, progress, and account management using public anon and session tokens.",
      "Toast notifications provide immediate feedback for success, error, and achievement events across the experience.",
    ],
  },
]

export function VersionOverviewPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-white">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-12">
        <header className="space-y-10 rounded-3xl border border-emerald-300/20 bg-white/10 p-10 text-center shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
            <BrandLogo size="xl" />
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.4em] text-emerald-100">
              <Sparkles className="h-4 w-4" />
              Version 1
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              The DEWII Solarpunk Magazine Experience
            </h1>
            <p className="text-lg text-emerald-100/90">
              A snapshot of the current feature set guiding our mission to blend sustainability storytelling with playful, community-powered engagement.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="secondary" className="bg-white/20 hover:bg-white/30 text-emerald-950">
                <a href="/" className="inline-flex items-center" rel="noreferrer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </a>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                <a href="https://mag.hempin.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                  <Compass className="mr-2 h-4 w-4" />
                  Visit mag.hempin.org
                </a>
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-10">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-white/10 p-8 shadow-[0_20px_80px_-40px_rgba(16,185,129,0.65)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/40 bg-emerald-400/20 text-emerald-50">
                  <Leaf className="h-6 w-6" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                  </div>
                  {section.description && (
                    <p className="text-base leading-relaxed text-emerald-100/80">{section.description}</p>
                  )}
                  {section.bullets && (
                    <ul className="space-y-3 text-base leading-relaxed text-emerald-100/80">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <span className="mt-1.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-300" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </main>

        <footer className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-emerald-100/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-emerald-100">
              <BookOpen className="h-4 w-4" />
              <span>Documented by ChatGPT with creative direction by Paul Iglesia.</span>
            </div>
            <p>
              Last updated for Version 1. Future iterations will build on these foundations with deeper gamification, richer storytelling, and more collaborative creation tools.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default VersionOverviewPage
