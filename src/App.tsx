import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { LandingPage } from '@/components/pages/LandingPage'
import { Dashboard } from '@/components/pages/Dashboard'
import { blink } from '@/blink/client'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Auto-navigate to dashboard if user is signed in
      if (state.user && currentPage === 'landing') {
        setCurrentPage('dashboard')
      }
    })
    return unsubscribe
  }, [currentPage])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} />
      
      <main>
        {currentPage === 'landing' && !user && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        
        {(currentPage === 'dashboard' || (currentPage === 'landing' && user)) && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'generator' && (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">AI Model Generator</h1>
              <p className="text-muted-foreground mb-8">Coming soon - Step-by-step wizard interface</p>
              <div className="max-w-md mx-auto bg-card border rounded-lg p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚧</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
                <p className="text-sm text-muted-foreground">
                  The wizard interface is being built. Check back soon!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'history' && (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Generation History</h1>
              <p className="text-muted-foreground mb-8">Browse your previous AI model generations</p>
              <div className="max-w-md mx-auto bg-card border rounded-lg p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  History page with search and filtering is being built.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App