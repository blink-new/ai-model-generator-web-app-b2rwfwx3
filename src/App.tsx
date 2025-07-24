import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { LandingPage } from '@/components/pages/LandingPage'
import { Dashboard } from '@/components/pages/Dashboard'
import ModelGenerator from '@/components/pages/ModelGenerator'
import GenerationHistory from '@/components/pages/GenerationHistory'
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
          <ModelGenerator />
        )}
        
        {currentPage === 'history' && (
          <GenerationHistory />
        )}
      </main>
    </div>
  )
}

export default App