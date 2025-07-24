import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Sparkles, History, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { blink } from '@/blink/client'
import { useState, useEffect } from 'react'

interface HeaderProps {
  onNavigate?: (page: string) => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleSignIn = () => {
    blink.auth.login()
  }

  const handleSignOut = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">AI Model Generator</span>
          </div>
          <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">AI Model Generator</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate?.('dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onNavigate?.('generator')}
            className="text-muted-foreground hover:text-foreground"
          >
            Generator
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onNavigate?.('history')}
            className="text-muted-foreground hover:text-foreground"
          >
            History
          </Button>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate?.('dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate?.('history')}>
                  <History className="mr-2 h-4 w-4" />
                  Generation History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleSignIn} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}