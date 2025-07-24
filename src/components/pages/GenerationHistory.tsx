import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Heart, 
  Download, 
  Share2, 
  Calendar,
  User,
  Palette,
  Shirt,
  Mountain,
  Trash2
} from 'lucide-react'
import { blink } from '@/blink/client'
import { GenerationData } from '@/types'

export default function GenerationHistory() {
  const [generations, setGenerations] = useState<GenerationData[]>([])
  const [filteredGenerations, setFilteredGenerations] = useState<GenerationData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'male' | 'female'>('all')

  const loadGenerations = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      console.log('🔄 Loading generations for user:', user.id)
      
      const data = await blink.db.generations.list({
        where: { userId: user.id }, // Use camelCase for query
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('📊 Generations loaded:', data.length, data)
      setGenerations(data)
    } catch (error) {
      console.error('❌ Failed to load generations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const filterGenerations = useCallback(() => {
    let filtered = generations

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(gen => 
        gen.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.ethnicity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gen.fashion_style || gen.fashionStyle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.background.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((gen.custom_prompt || gen.customPrompt) && (gen.custom_prompt || gen.customPrompt).toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(gen => Number(gen.is_favorite || gen.isFavorite) > 0)
        break
      case 'male':
        filtered = filtered.filter(gen => gen.gender === 'male')
        break
      case 'female':
        filtered = filtered.filter(gen => gen.gender === 'female')
        break
    }

    setFilteredGenerations(filtered)
  }, [generations, searchQuery, filterBy])

  useEffect(() => {
    loadGenerations()
  }, [loadGenerations])

  useEffect(() => {
    filterGenerations()
  }, [filterGenerations])

  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      await blink.db.generations.update(id, { isFavorite: !currentFavorite })
      setGenerations(prev => prev.map(gen => 
        gen.id === id ? { ...gen, is_favorite: !currentFavorite, isFavorite: !currentFavorite } : gen
      ))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const deleteGeneration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generation?')) return
    
    try {
      await blink.db.generations.delete(id)
      setGenerations(prev => prev.filter(gen => gen.id !== id))
    } catch (error) {
      console.error('Failed to delete generation:', error)
    }
  }

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F23] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your generations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generation History</h1>
          <p className="text-gray-400">Browse and manage your AI model generations</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gender, ethnicity, style, background..."
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'favorites', 'male', 'female'] as const).map((filter) => (
              <Button
                key={filter}
                onClick={() => setFilterBy(filter)}
                variant={filterBy === filter ? 'default' : 'outline'}
                className={filterBy === filter 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-gray-600 text-gray-400 hover:bg-gray-800'
                }
              >
                <Filter className="w-4 h-4 mr-2" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{generations.length}</div>
              <div className="text-sm text-gray-400">Total Generations</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {generations.filter(g => Number(g.is_favorite || g.isFavorite) > 0).length}
              </div>
              <div className="text-sm text-gray-400">Favorites</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {generations.filter(g => g.gender === 'male').length}
              </div>
              <div className="text-sm text-gray-400">Male Models</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">
                {generations.filter(g => g.gender === 'female').length}
              </div>
              <div className="text-sm text-gray-400">Female Models</div>
            </CardContent>
          </Card>
        </div>

        {/* Generations Grid */}
        {filteredGenerations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || filterBy !== 'all' ? 'No matching generations' : 'No generations yet'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start creating AI models to see them here'
              }
            </p>
            {!searchQuery && filterBy === 'all' && (
              <Button 
                onClick={() => window.location.hash = '#generator'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Your First Model
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGenerations.map((generation) => (
              <Card key={generation.id} className="bg-gray-900 border-gray-700 overflow-hidden">
                <div className="aspect-square relative">
                  {(() => {
                    // Handle both snake_case and camelCase field names
                    const images = generation.generated_images || generation.generatedImages || generation.generated_urls
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
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )
                  })()}
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleFavorite(generation.id, Number(generation.is_favorite || generation.isFavorite) > 0)}
                      className={`${Number(generation.is_favorite || generation.isFavorite) > 0 ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                    >
                      <Heart className={`w-4 h-4 ${Number(generation.is_favorite || generation.isFavorite) > 0 ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      <User className="w-3 h-3 mr-1" />
                      {generation.gender}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(generation.created_at || generation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Palette className="w-3 h-3 mr-2 text-gray-400" />
                      {generation.ethnicity}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Shirt className="w-3 h-3 mr-2 text-gray-400" />
                      {generation.fashion_style || generation.fashionStyle}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Mountain className="w-3 h-3 mr-2 text-gray-400" />
                      {generation.background}
                    </div>
                  </div>

                  {(generation.custom_prompt || generation.customPrompt) && (
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                      "{generation.custom_prompt || generation.customPrompt}"
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {(() => {
                        const images = generation.generated_images || generation.generatedImages || generation.generated_urls
                        const imageUrls = typeof images === 'string' ? images.split(',') : images
                        return imageUrls && imageUrls.map((url, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage(url.trim(), `model-${generation.id}-${index + 1}.png`)}
                            className="border-gray-600 text-gray-400 hover:bg-gray-800"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        ))
                      })()}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:bg-gray-800"
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteGeneration(generation.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}