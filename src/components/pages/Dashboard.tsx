import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Plus, History, Image, Clock, TrendingUp } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [user, setUser] = useState<any>(null)
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalGenerations: 0,
    thisMonth: 0,
    favorites: 0
  })

  const loadDashboardData = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Loading dashboard data for user:', userId)
      
      // Load ALL generations for stats
      const allGenerations = await blink.db.generations.list({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('📊 All generations loaded:', allGenerations.length, allGenerations)
      
      // Load recent generations (limited)
      const recentGenerations = allGenerations.slice(0, 6)
      setRecentGenerations(recentGenerations)

      // Calculate stats from all generations
      const total = allGenerations.length
      const thisMonth = allGenerations.filter(g => {
        const createdDate = new Date(g.created_at || g.createdAt)
        const now = new Date()
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear()
      }).length
      const favorites = allGenerations.filter(g => Number(g.is_favorite || g.isFavorite) > 0).length

      console.log('📈 Stats calculated:', { total, thisMonth, favorites })
      setStats({ totalGenerations: total, thisMonth, favorites })
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDashboardData(state.user.id)
      }
    })
    return unsubscribe
  }, [loadDashboardData])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Welcome to AI Model Generator</h2>
          <p className="text-muted-foreground mb-6">Sign in to access your dashboard</p>
          <Button onClick={() => blink.auth.login()}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.displayName || user.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Ready to create some amazing AI-generated models?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create New Model
            </CardTitle>
            <CardDescription>
              Start the wizard to generate your next AI model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => onNavigate('generator')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Start Generator
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-accent" />
              View History
            </CardTitle>
            <CardDescription>
              Browse your previous generations and favorites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full border-accent/20 hover:bg-accent/10"
              onClick={() => onNavigate('history')}
            >
              <History className="mr-2 h-4 w-4" />
              Browse History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGenerations}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New generations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">Saved models</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Generations
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('history')}
            >
              View All
            </Button>
          </CardTitle>
          <CardDescription>
            Your latest AI-generated models
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentGenerations.length === 0 ? (
            <div className="text-center py-8">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI model to see it here
              </p>
              <Button onClick={() => onNavigate('generator')}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Model
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentGenerations.map((generation) => (
                <Card key={generation.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {(() => {
                      // Handle both snake_case and camelCase field names
                      const images = generation.generated_images || generation.generatedImages
                      const imageUrls = typeof images === 'string' ? images.split(',') : images
                      
                      return imageUrls && imageUrls.length > 0 && imageUrls[0] ? (
                        <img 
                          src={imageUrls[0].trim()} 
                          alt="Generated model"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('❌ Image failed to load:', imageUrls[0])
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <Image className="h-16 w-16 text-muted-foreground" />
                      )
                    })()}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {generation.gender}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(generation.created_at || generation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {generation.ethnicity} • {generation.fashion_style || generation.fashionStyle}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}