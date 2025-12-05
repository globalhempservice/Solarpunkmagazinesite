# 🌿 Wiki System Quick Reference

## 🚀 How to Access

**For Everyone:**
1. Click the Hemp'in leaf logo (center of header)
2. Click the Wiki button in the bubble menu
3. Browse and read documents

## 📁 File Structure

```
/components/
  ├── WikiPage.tsx           # Main wiki viewer
  ├── BubbleController.tsx   # Floating menu
  ├── Header.tsx             # Modified for authenticated users
  └── LandingPage.tsx        # Modified for public visitors

/public/
  └── roadmap.md             # User-centric roadmap document
```

## 🔧 How to Add New Documents

### Step 1: Create Markdown File
```bash
# Add to /public/ folder
/public/getting-started.md
```

### Step 2: Update Wiki Catalog
```typescript
// In /components/WikiPage.tsx
const wikiDocuments: WikiDocument[] = [
  // ... existing documents
  {
    id: 'getting-started',
    title: "Getting Started",
    filename: '/getting-started.md',
    description: 'Learn how to use Hemp\'in Universe',
    date: 'December 5, 2025',
    category: 'guide' // 'roadmap' | 'guide' | 'info'
  }
]
```

### Step 3: Test
1. Click logo → Wiki
2. Verify new card appears
3. Click card → Verify content loads

## 🎨 Category Colors

```typescript
roadmap: 'from-purple-500 to-pink-500'      // Purple gradient
guide:   'from-blue-500 to-cyan-500'        // Blue gradient
info:    'from-emerald-500 to-teal-500'     // Green gradient
```

## 🔄 How to Update Roadmap

Simply edit `/public/roadmap.md` - changes appear immediately!

## 🎯 Bubble Menu Extension

### Add New Menu Item:

```typescript
// In /components/BubbleController.tsx

// After Wiki button:
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  onClick={(e) => {
    e.stopPropagation()
    onHelpClick() // Add this prop
  }}
  className="group relative"
>
  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
    <HelpCircle className="w-8 h-8 text-white" />
  </div>
  <motion.div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
    <span className="text-xs font-bold text-foreground bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-border/50 shadow-sm">
      Help
    </span>
  </motion.div>
</motion.button>
```

## 📊 Component Props

### WikiPage
```typescript
interface WikiPageProps {
  isOpen: boolean
  onClose: () => void
}
```

### BubbleController
```typescript
interface BubbleControllerProps {
  isVisible: boolean
  onWikiClick: () => void
  onClose: () => void
  position: { x: number; y: number }
}
```

## 🐛 Troubleshooting

### Markdown not rendering?
- Check file exists: `/public/roadmap.md`
- Check filename matches in WikiPage catalog
- Check browser console for errors

### Bubble in wrong position?
- Verify ref is attached: `ref={logoRef}`
- Check positioning logic in click handler
- Ensure parent has position context

### Animations choppy?
- Check motion/react is imported
- Verify no console errors
- Check browser performance

## 💡 Best Practices

### Writing Markdown:
- Use H1 for title, H2 for sections
- Keep paragraphs short
- Use emojis for visual interest
- Break up with horizontal rules (---)
- Use bold (**text**) for emphasis

### Naming Files:
- Use kebab-case: `getting-started.md`
- Keep names short and clear
- No spaces or special characters

### Document IDs:
- Match filename: `getting-started`
- Unique and descriptive
- No duplicates

## 📱 Mobile Considerations

- Keep titles under 40 characters
- Test on actual devices
- Ensure tap targets are 44x44px minimum
- Check readability at small sizes

## ✅ Pre-Deploy Checklist

- [ ] New markdown file created in `/public/`
- [ ] Document added to WikiPage catalog
- [ ] Category color assigned
- [ ] Date is current
- [ ] Description is compelling
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] No console errors
- [ ] Content reviewed for accuracy

## 🎉 Quick Win Ideas

1. **Add FAQ** - Answer common questions
2. **Add Terms** - Legal pages
3. **Add Community Guidelines** - Set expectations
4. **Add Hemp Resources** - Industry links
5. **Add Contact Info** - Support channels

---

**Need Help?** Check `/WIKI_SYSTEM_IMPLEMENTATION.md` for full details!

🌿 **Built with 💚 for the global hemp community**
