import { LinkPreview } from './LinkPreview'
import { InstagramImporter } from './InstagramImporter'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function LinkPreviewDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Link Preview System
          </h1>
          <p className="text-muted-foreground">
            Test Instagram importer and preview components
          </p>
        </div>

        {/* Instagram Importer */}
        <InstagramImporter />

        {/* Example Previews */}
        <Card>
          <CardHeader>
            <CardTitle>Example Link Previews</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instagram Example */}
            <LinkPreview
              platform="instagram"
              url="https://www.instagram.com/reel/DQ_6rA_khhG/"
              author="John Doe"
              authorUsername="johndoe"
              authorImage="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              caption="Check out this amazing sustainable building! 🌱 #sustainability #greentech #innovation"
              location="San Francisco, CA"
              timestamp="2024-01-15T12:00:00Z"
              mediaUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop"
              mediaType="video"
              hasAudio={true}
            />

            {/* LinkedIn Example */}
            <LinkPreview
              platform="linkedin"
              url="https://www.linkedin.com/posts/example"
              author="Jane Smith"
              authorImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              caption="Excited to share our latest breakthrough in renewable energy technology! This innovation could power 10,000 homes sustainably."
              timestamp="2024-01-14T10:30:00Z"
              mediaUrl="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop"
              mediaType="image"
            />

            {/* Generic Link Example */}
            <LinkPreview
              platform="generic"
              url="https://example.com/article"
              author="Tech Weekly"
              caption="The Future of Sustainable Technology: How AI is Revolutionizing Green Energy"
              timestamp="2024-01-13T09:00:00Z"
              thumbnailUrl="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop"
              mediaType="image"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
