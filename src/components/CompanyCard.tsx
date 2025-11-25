import { Building2, MapPin, Users, Award, ExternalLink } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface CompanyCardProps {
  company: {
    id: string
    name: string
    description: string
    logo_url: string | null
    category: {
      name: string
      icon: string
    } | null
    location: string | null
    company_size: string | null
    is_association: boolean
    badges: any[]
    view_count: number
  }
  onClick: () => void
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-card border-2 border-border rounded-2xl p-6 hover:shadow-xl hover:border-hemp-primary/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Logo */}
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-16 h-16 rounded-xl object-cover border-2 border-border group-hover:border-hemp-primary/50 transition-colors"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-black truncate">{company.name}</h3>
            {company.is_association && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Association
              </Badge>
            )}
          </div>

          {company.category && (
            <Badge variant="outline" className="text-xs mb-2">
              {company.category.name}
            </Badge>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {company.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {company.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{company.location}</span>
              </div>
            )}
            {company.company_size && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{company.company_size}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      {company.badges && company.badges.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-3 pt-3 border-t border-border">
          {company.badges.slice(0, 3).map((badge: any) => (
            <Badge key={badge.id} variant="default" className="gap-1 text-xs">
              <Award className="w-3 h-3" />
              {badge.badge_type}
            </Badge>
          ))}
          {company.badges.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{company.badges.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* View More */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full group-hover:bg-hemp-primary/10 group-hover:text-hemp-primary transition-colors"
      >
        View Company
        <ExternalLink className="w-3 h-3 ml-2" />
      </Button>
    </div>
  )
}
