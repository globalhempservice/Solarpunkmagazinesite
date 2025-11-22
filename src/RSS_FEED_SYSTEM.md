# RSS Feed System for DEWII Magazine

## Overview
The RSS Feed System allows admins to subscribe to RSS/Atom feeds and automatically pull articles into the magazine. Articles go through an approval process before being published.

## How It Works

### 1. **Subscribe to RSS Feeds**
- Go to Admin Dashboard → RSS Feeds tab
- Enter an RSS feed URL (e.g., `https://example.com/feed.xml`)
- Click "Preview" to see latest articles
- Click "Subscribe to Feed" to add it to your subscriptions

### 2. **Fetch Articles**
- Subscribed feeds will automatically fetch the latest 10 articles
- You can manually refresh any feed by clicking the refresh icon
- Duplicate articles are automatically detected and skipped

### 3. **Approve Articles**
- Go to the "Pending" tab to see all fetched articles
- Review article title, description, author, and source
- Select a category for the article
- Click "Publish" to add it to the magazine
- Click "Reject" to hide unwanted articles

### 4. **Published Articles**
- Published RSS articles appear in the magazine like regular articles
- They're marked with tags: `News`, `RSS`
- Source information is preserved (feed name, original URL)
- Author is set to the RSS article's author or feed name

## Database Structure (KV Store)

### Keys:
- `rss_feed_list` - Array of all subscribed feed IDs
- `rss_feed_{feedId}` - Individual feed metadata
- `rss_article_{articleId}` - Individual RSS article

### Article Status:
- `pending` - Fetched but not yet reviewed
- `published` - Approved and added to magazine
- `rejected` - Reviewed and rejected by admin

## API Endpoints

### Admin Only:
- `POST /rss-feeds` - Subscribe to a feed
- `GET /rss-feeds` - List all subscribed feeds
- `POST /rss-feeds/:feedId/fetch` - Manually fetch articles
- `GET /rss-articles/pending` - Get pending articles
- `POST /rss-articles/:articleId/publish` - Publish article
- `POST /rss-articles/:articleId/reject` - Reject article
- `DELETE /rss-feeds/:feedId` - Unsubscribe from feed

### All Users:
- `POST /rss-feeds/preview` - Preview a feed without subscribing

## Features

✅ **RSS 2.0 and Atom Support**
✅ **Automatic Content Extraction** (title, content, author, images)
✅ **Duplicate Detection** (no duplicate articles)
✅ **Admin Approval Workflow**
✅ **Category Assignment**
✅ **Source Attribution**
✅ **Image Extraction from Content**
✅ **Clean HTML Stripping**

## Future Enhancements

🔮 **Scheduled Auto-Fetch** (daily cron job)
🔮 **AI-Powered Categorization** (auto-assign categories)
🔮 **Content Filtering** (keyword-based filtering)
🔮 **Multi-Feed Management** (bulk operations)

## Testing

### Recommended Test Feeds:
- **TechCrunch**: https://techcrunch.com/feed/
- **Medium**: https://medium.com/feed/@username
- **WordPress Blogs**: https://example.com/feed
- **RSS Hub**: https://rsshub.app/ (thousands of feeds)

### Test Steps:
1. Go to Admin Dashboard
2. Click "RSS Feeds" tab
3. Try the preview feature with a feed URL
4. Subscribe to a feed
5. Check "Pending" tab for articles
6. Publish an article with a category
7. Verify it appears in the magazine feed

## Notes

- RSS articles are stored separately from user articles
- Original source URLs are preserved for attribution
- Admin-only feature for content curation
- No automatic publishing - all articles require approval
