# LinkedIn → YouTube Auto-Extraction

## How It Works

When you import a LinkedIn post like:
`https://www.linkedin.com/posts/pauliglesia_lets-talk-hemp-environmental-benefits-at-activity-7394025398688178177-rbfk`

### 🎯 Smart Content Scanning

The backend now:

1. **Fetches the LinkedIn post** HTML
2. **Extracts all content** (text, images, author info)
3. **🔍 NEW: Scans for YouTube URLs** using regex patterns
4. **Detects these formats:**
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://www.youtube.com/embed/VIDEO_ID`
   - `https://www.youtube.com/shorts/VIDEO_ID`
   - `youtube.com/watch?v=VIDEO_ID` (without https)
   - `youtu.be/VIDEO_ID` (without https)

### 📦 What Gets Added to Media Library

**Before** (only images):
- LinkedIn post images → Media Library as "Image 1, 2, 3..."

**Now** (images + videos):
- YouTube videos → Media Library as "YouTube video 1, 2, 3..."
- LinkedIn post images → Media Library as "Image 1, 2, 3..."

### 🎬 Example Flow

**LinkedIn Post Content:**
```
Let's talk Hemp! 🌱

Watch my latest video on sustainable materials:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

Check out our new building project using hemp.
#sustainability #greenbuilding
```

**After Import:**

✅ **Title**: "Let's talk Hemp"
✅ **Content**: Full post text (with YouTube URL)
✅ **Author**: Paul Iglesia
✅ **Author Title**: (LinkedIn headline)
✅ **Media Library**:
  - 📹 YouTube video 1: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  - 🖼️ Image 1: (if post had images)
  - 🖼️ Image 2: (if post had multiple images)

### ✨ Auto-Filled Article Fields

| Data Source | → | Article Field | Action |
|-------------|---|---------------|--------|
| Post text | → | Title + Content | ✅ Auto-fill |
| Author info | → | Author metadata | ✅ Auto-fill |
| **YouTube URLs in text** | → | **Media Library** | **✅ Auto-add** |
| Post images | → | Media Library | ✅ Auto-add |
| Hashtags | → | Extracted | ✅ Logged |

### 🎯 Completion Score Impact

Each YouTube video = **+10% to score** (same as other media)

Example:
- LinkedIn post with 1 YouTube video + 2 images = **+30% from media alone!**
- Combined with title (20%) + content (30%) = **80% completion**
- **Ready to publish immediately!** 🚀

### 🧪 Test Your LinkedIn Post

1. Copy your LinkedIn post URL
2. Paste into LinkedIn Importer
3. Click "Import"
4. Check console logs for:
   ```
   Found YouTube video in content: https://www.youtube.com/watch?v=...
   YouTube URLs found: 1
   ```
5. Scroll down to **Media Library**
6. See your YouTube video ready to use! 📹

### 🎥 YouTube Video Display

The media library will show:
- **YouTube thumbnail** (auto-fetched)
- **Play button overlay** 
- **Video URL** for verification
- **Caption**: "YouTube video 1 from LinkedIn post"

You can edit the caption or remove the video if needed!

---

## 🔍 Debug Checklist

If YouTube URL not detected:

1. **Check console logs**: Look for "Found YouTube video in content"
2. **Verify URL format**: Must be standard YouTube format
3. **Check post content**: URL must be in the visible text
4. **Try manual add**: You can always add manually via Media Attachments

---

**Ready to test with your URL:** 
`https://www.linkedin.com/posts/pauliglesia_lets-talk-hemp-environmental-benefits-at-activity-7394025398688178177-rbfk`

Let me know what you find! 🎉
