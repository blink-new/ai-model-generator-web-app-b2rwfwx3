import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Upload, Palette, Download, Zap, Users, Image, Video } from 'lucide-react'
import { blink } from '@/blink/client'

interface LandingPageProps {
  onNavigate: (page: string) => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const handleGetStarted = () => {
    blink.auth.login()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Model Generator
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your reference images and videos into stunning custom male and female models with advanced AI technology
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              onClick={handleGetStarted}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => onNavigate('demo')}
            >
              View Demo
            </Button>
          </div>

          {/* Feature Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload & Customize</h3>
                <p className="text-muted-foreground">Upload reference images or videos and customize every detail</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Generation</h3>
                <p className="text-muted-foreground">Advanced AI creates stunning models based on your specifications</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Download & Share</h3>
                <p className="text-muted-foreground">Get high-resolution results and share your creations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create stunning AI-generated models
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Image className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Format Upload</h3>
            <p className="text-muted-foreground">Support for images and videos as reference material</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-accent/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gender & Ethnicity</h3>
            <p className="text-muted-foreground">Choose from diverse gender and ethnicity options</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Palette className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Style Customization</h3>
            <p className="text-muted-foreground">Extensive fashion and feature customization options</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-accent/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">State-of-the-art AI for realistic model generation</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Create?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators using AI to generate stunning models
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
            onClick={handleGetStarted}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating Now
          </Button>
        </div>
      </section>
    </div>
  )
}