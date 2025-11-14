# Instagram to Article Field Mapping

## What We Extract from Instagram

When you paste an Instagram URL like:
`https://www.instagram.com/reel/DQ_6rA_khhG/?igsh=MTlraXlnejFoa3Voeg%3D%3D`

### Data We Try to Extract:

1. **Caption/Description** → `Article Content`
   - The post's text content becomes the article body
   - Full text including hashtags and emojis

2. **Caption (First Line)** → `Article Title`
   - Takes first sentence or line as title (max 100 chars)
   - Fallback: "Video by @username" or "Instagram Reel"

3. **Caption (150 chars)** → `Article Excerpt`
   - First 150 characters for preview

4. **Author Username** → `Author Name`
   - Instagram username (e.g., @username)

5. **Author Avatar** → `Author Image`
   - Profile picture URL

6. **Location** → `Author Title` field
   - Shows as "📍 Location Name"
   - (Alternative use since Instagram doesn't have job titles)

7. **Post Timestamp** → `Publish Date`
   - Original post date/time

8. **Video/Image URL** → `Media Attachment`
   - Adds to media gallery
   - Detects if it's a Reel (video) or image

9. **Reel Detection** → `Media Type`
   - Automatically marks as video with audio

## Instagram Data Limitations

⚠️ **Important**: Instagram heavily restricts automated scraping, so:

- **Best case**: We extract caption, media, basic author info
- **Common case**: We get Open Graph metadata (og:image, og:description)
- **Worst case**: Limited data, requires manual entry

### Why Limitations Exist:
- Instagram requires authentication for full API access
- Rate limiting on automated requests
- Dynamic JavaScript rendering (hard to parse)
- Anti-scraping measures

## How It Fills Article Fields

After clicking "Import":

✅ **Always Filled (50% completion)**:
- Title (20%)
- Content (30%)
- Category (15% - defaults to existing)
- Excerpt (15%)
- Reading Time (10% - defaults to 5 min)

➕ **Bonus (10% more)**:
- Media (10%) - if video/image extracted

🎯 **Total**: 50-60% completion → **Ready to Publish!**

## Testing Your URL

Try importing: `https://www.instagram.com/reel/DQ_6rA_khhG/?igsh=MTlraXlnejFoa3Voeg%3D%3D`

Expected results:
1. Caption → Content field
2. First line → Title
3. Author → Author name
4. Video thumbnail → Media attachment
5. Reel indicator → Video with audio

Then check your browser console for detailed extraction logs!
