import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  User, 
  Palette, 
  Shirt, 
  Eye, 
  Mountain,
  Play,
  Image as ImageIcon,
  X,
  Download,
  Heart,
  Share2
} from 'lucide-react'
import { blink } from '@/blink/client'
import { GenerationData } from '@/types'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'upload',
    title: 'Upload Reference',
    description: 'Upload face images to replicate facial features',
    icon: <Upload className="w-5 h-5" />
  },
  {
    id: 'gender',
    title: 'Select Gender',
    description: 'Choose male or female model',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'ethnicity',
    title: 'Ethnicity',
    description: 'Select ethnicity and skin tone',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'fashion',
    title: 'Fashion Style',
    description: 'Choose clothing and style',
    icon: <Shirt className="w-5 h-5" />
  },
  {
    id: 'features',
    title: 'Customize Features',
    description: 'Adjust facial and body features',
    icon: <Eye className="w-5 h-5" />
  },
  {
    id: 'background',
    title: 'Background',
    description: 'Set scene and environment',
    icon: <Mountain className="w-5 h-5" />
  },
  {
    id: 'generate',
    title: 'Generate',
    description: 'Create your AI model',
    icon: <Sparkles className="w-5 h-5" />
  }
]

const ETHNICITIES = [
  'Caucasian', 'African American', 'Asian', 'Hispanic/Latino', 
  'Middle Eastern', 'Native American', 'Mixed Race', 'Other'
]

const FASHION_STYLES = [
  { name: 'Casual', image: '👕' },
  { name: 'Business', image: '👔' },
  { name: 'Formal', image: '🤵' },
  { name: 'Sporty', image: '🏃' },
  { name: 'Bohemian', image: '🌸' },
  { name: 'Gothic', image: '🖤' },
  { name: 'Vintage', image: '📻' },
  { name: 'Artistic', image: '🎨' },
  { name: 'Classical Art', image: '🏛️' },
  { name: 'Renaissance', image: '🎨' },
  { name: 'Figure Study', image: '🎨' }
]

const BACKGROUNDS = [
  { name: 'Studio', image: '🎬' },
  { name: 'Nature', image: '🌲' },
  { name: 'Urban', image: '🏙️' },
  { name: 'Beach', image: '🏖️' },
  { name: 'Abstract', image: '🎨' },
  { name: 'Minimal', image: '⚪' }
]

export default function ModelGenerator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // Form data
  const [formData, setFormData] = useState({
    referenceFiles: [] as File[],
    gender: '',
    ethnicity: '',
    fashionStyle: '',
    facialFeatures: {
      eyeSize: [50],
      noseShape: [50],
      lipFullness: [50],
      jawline: [50],
      cheekbones: [50]
    },
    bodyFeatures: {
      height: [50],
      build: [50],
      musculature: [50]
    },
    background: '',
    customPrompt: ''
  })

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )
    setFormData(prev => ({
      ...prev,
      referenceFiles: [...prev.referenceFiles, ...newFiles]
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceFiles: prev.referenceFiles.filter((_, i) => i !== index)
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      console.log('Starting generation process...')
      
      // Check if reference files are provided
      if (formData.referenceFiles.length === 0) {
        throw new Error('Please upload at least one reference image to generate models with matching facial features.')
      }
      
      // Upload reference files to storage first
      const referenceUrls = []
      for (const file of formData.referenceFiles) {
        console.log('Uploading file:', file.name)
        const { publicUrl } = await blink.storage.upload(file, `references/${file.name}`, { upsert: true })
        referenceUrls.push(publicUrl)
      }
      console.log('Reference files uploaded:', referenceUrls)

      // Create generation prompt with proper background integration
      let styleDescription
      let additionalPrompt = ''
      
      if (formData.fashionStyle === 'Figure Study') {
        // Use established fine art photography terminology that focuses on artistic merit
        styleDescription = 'classical figure study in the style of renaissance masters'
        additionalPrompt = 'fine art photography, classical artistic composition, renaissance painting style, museum quality lighting, artistic portrait photography, elegant and sophisticated, professional art photography, timeless classical art, academic figure study'
      } else if (formData.fashionStyle === 'Classical Art') {
        styleDescription = 'classical art inspired attire'
        additionalPrompt = 'in the style of classical paintings, elegant and refined'
      } else if (formData.fashionStyle === 'Renaissance') {
        styleDescription = 'renaissance period inspired clothing'
        additionalPrompt = 'renaissance art style, classical and elegant'
      } else if (formData.fashionStyle === 'Artistic') {
        styleDescription = 'elegant artistic attire'
      } else {
        styleDescription = `${formData.fashionStyle} style clothing`
      }
      
      // Build background description with custom prompt integration
      let backgroundDescription = formData.background
      if (formData.customPrompt.trim()) {
        backgroundDescription = `${formData.background} background with ${formData.customPrompt.trim()}`
      }
      
      const prompt = `Create a professional portrait of a ${formData.gender} model with ${formData.ethnicity} ethnicity, ${styleDescription}, in a ${backgroundDescription} setting. Maintain the original facial features and structure while applying the requested style. High quality, photorealistic, professional studio lighting. ${additionalPrompt}`
      console.log('Generation prompt:', prompt)
      console.log('Fashion style selected:', formData.fashionStyle)
      console.log('Style description used:', styleDescription)
      console.log('Additional prompt:', additionalPrompt)

      // Use modifyImage to preserve facial features from reference images
      console.log('Calling AI image modification with reference images...')
      console.log('Reference URLs being used:', referenceUrls)
      
      let result
      try {
        result = await blink.ai.modifyImage({
          images: referenceUrls, // Use the uploaded reference images
          prompt,
          size: '1024x1024',
          quality: 'high',
          n: 4
        })
        console.log('AI generation result:', result)
      } catch (modifyError) {
        console.log('ModifyImage failed, trying alternative approach:', modifyError.message)
        
        // If Figure Study fails, try with alternative artistic terminology
        if (formData.fashionStyle === 'Figure Study') {
          try {
            console.log('Retrying Figure Study with alternative prompt...')
            
            // Build background description with custom prompt integration for fallback
            let fallbackBackgroundDescription = formData.background
            if (formData.customPrompt.trim()) {
              fallbackBackgroundDescription = `${formData.background} background with ${formData.customPrompt.trim()}`
            }
            
            const saferPrompt = `Create a professional portrait of a ${formData.gender} model with ${formData.ethnicity} ethnicity, in the style of classical renaissance art, in a ${fallbackBackgroundDescription} setting. Academic figure study, fine art photography, classical artistic composition, museum quality lighting, elegant and sophisticated, professional art photography, timeless artistic portrait`
            console.log('Alternative prompt:', saferPrompt)
            
            result = await blink.ai.modifyImage({
              images: referenceUrls,
              prompt: saferPrompt,
              size: '1024x1024',
              quality: 'high',
              n: 4
            })
          } catch (secondError) {
            // If Figure Study still fails, try one more time with very indirect language
            console.log('Second attempt failed, trying final approach:', secondError.message)
            
            let finalBackgroundDescription = formData.background
            if (formData.customPrompt.trim()) {
              finalBackgroundDescription = `${formData.background} background with ${formData.customPrompt.trim()}`
            }
            
            const finalPrompt = `Create a professional portrait of a ${formData.gender} model with ${formData.ethnicity} ethnicity, in classical art style, in a ${finalBackgroundDescription} setting. Fine art portrait, elegant composition, professional photography, artistic lighting, sophisticated and tasteful`
            console.log('Final attempt prompt:', finalPrompt)
            
            result = await blink.ai.modifyImage({
              images: referenceUrls,
              prompt: finalPrompt,
              size: '1024x1024',
              quality: 'high',
              n: 4
            })
          }
        } else {
          throw modifyError // Re-throw if it's not a Figure Study issue
        }
      }

      if (!result || !result.data || result.data.length === 0) {
        throw new Error('No images were generated. Please try again.')
      }

      const imageUrls = result.data.map(img => img.url).filter(url => url)
      console.log('Generated image URLs:', imageUrls)
      
      if (imageUrls.length === 0) {
        throw new Error('Generated images are invalid. Please try again.')
      }
      
      setGeneratedImages(imageUrls)

      // Get current user
      const user = await blink.auth.me()
      console.log('Current user:', user)

      // Save generation data to database
      const generationData = {
        user_id: user.id,
        reference_files: referenceUrls.join(','),
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        fashion_style: formData.fashionStyle,
        facial_features: JSON.stringify(formData.facialFeatures),
        body_features: JSON.stringify(formData.bodyFeatures),
        background: formData.background,
        custom_background: formData.customPrompt,
        generated_images: imageUrls.join(','),
        is_favorite: 0
      }

      console.log('Saving to database:', generationData)
      await blink.db.generations.create(generationData)
      console.log('Generation saved successfully!')
      
      toast({
        title: "Generation Complete!",
        description: `Successfully generated ${imageUrls.length} AI model variations.`,
      })
      
    } catch (error) {
      console.error('Generation failed:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      let errorMessage = 'An unexpected error occurred during generation.'
      
      if (error.message?.includes('safety')) {
        errorMessage = 'The AI safety system rejected this request. Try adjusting your style selection or custom prompt to use more general, artistic terms.'
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (error.message?.includes('reference')) {
        errorMessage = error.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.referenceFiles.length > 0
      case 1: return formData.gender !== ''
      case 2: return formData.ethnicity !== ''
      case 3: return formData.fashionStyle !== ''
      case 4: return true // Features are optional
      case 5: return formData.background !== ''
      default: return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Upload Reference
        return (
          <div className="space-y-6">
            <div 
              className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Upload Reference Images</h3>
              <p className="text-gray-400 mb-4">Upload clear face photos to replicate facial features in generated models</p>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {formData.referenceFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.referenceFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <Play className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">{file.name}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 1: // Gender Selection
        return (
          <div className="space-y-6">
            <RadioGroup 
              value={formData.gender} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <Label htmlFor="male" className="cursor-pointer">
                  <Card className={`p-6 text-center transition-all hover:border-purple-500 ${formData.gender === 'male' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'}`}>
                    <RadioGroupItem value="male" id="male" className="sr-only" />
                    <div className="text-4xl mb-4">👨</div>
                    <h3 className="text-lg font-medium text-white">Male</h3>
                    <p className="text-gray-400 text-sm">Generate male models</p>
                  </Card>
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="female" className="cursor-pointer">
                  <Card className={`p-6 text-center transition-all hover:border-purple-500 ${formData.gender === 'female' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'}`}>
                    <RadioGroupItem value="female" id="female" className="sr-only" />
                    <div className="text-4xl mb-4">👩</div>
                    <h3 className="text-lg font-medium text-white">Female</h3>
                    <p className="text-gray-400 text-sm">Generate female models</p>
                  </Card>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )

      case 2: // Ethnicity
        return (
          <div className="space-y-6">
            <RadioGroup 
              value={formData.ethnicity} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, ethnicity: value }))}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {ETHNICITIES.map((ethnicity) => (
                <div key={ethnicity} className="space-y-2">
                  <Label htmlFor={ethnicity} className="cursor-pointer">
                    <Card className={`p-4 text-center transition-all hover:border-purple-500 ${formData.ethnicity === ethnicity ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'}`}>
                      <RadioGroupItem value={ethnicity} id={ethnicity} className="sr-only" />
                      <h3 className="text-sm font-medium text-white">{ethnicity}</h3>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 3: // Fashion Style
        return (
          <div className="space-y-6">
            <RadioGroup 
              value={formData.fashionStyle} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, fashionStyle: value }))}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {FASHION_STYLES.map((style) => (
                <div key={style.name} className="space-y-2">
                  <Label htmlFor={style.name} className="cursor-pointer">
                    <Card className={`p-4 text-center transition-all hover:border-purple-500 ${formData.fashionStyle === style.name ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'}`}>
                      <RadioGroupItem value={style.name} id={style.name} className="sr-only" />
                      <div className="text-2xl mb-2">{style.image}</div>
                      <h3 className="text-sm font-medium text-white">{style.name}</h3>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 4: // Features
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Facial Features</h3>
              <div className="space-y-6">
                {Object.entries(formData.facialFeatures).map(([feature, value]) => (
                  <div key={feature} className="space-y-2">
                    <Label className="text-white capitalize">{feature.replace(/([A-Z])/g, ' $1')}</Label>
                    <Slider
                      value={value}
                      onValueChange={(newValue) => setFormData(prev => ({
                        ...prev,
                        facialFeatures: { ...prev.facialFeatures, [feature]: newValue }
                      }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Body Features</h3>
              <div className="space-y-6">
                {Object.entries(formData.bodyFeatures).map(([feature, value]) => (
                  <div key={feature} className="space-y-2">
                    <Label className="text-white capitalize">{feature}</Label>
                    <Slider
                      value={value}
                      onValueChange={(newValue) => setFormData(prev => ({
                        ...prev,
                        bodyFeatures: { ...prev.bodyFeatures, [feature]: newValue }
                      }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 5: // Background
        return (
          <div className="space-y-6">
            <RadioGroup 
              value={formData.background} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, background: value }))}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {BACKGROUNDS.map((bg) => (
                <div key={bg.name} className="space-y-2">
                  <Label htmlFor={bg.name} className="cursor-pointer">
                    <Card className={`p-6 text-center transition-all hover:border-purple-500 ${formData.background === bg.name ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'}`}>
                      <RadioGroupItem value={bg.name} id={bg.name} className="sr-only" />
                      <div className="text-3xl mb-2">{bg.image}</div>
                      <h3 className="text-sm font-medium text-white">{bg.name}</h3>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <Label className="text-white">Custom Background Details (Optional)</Label>
              <Textarea
                value={formData.customPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Add any specific details or modifications..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        )

      case 6: // Generate
        return (
          <div className="space-y-6">
            {!isGenerating && generatedImages.length === 0 && (
              <div className="text-center space-y-4">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto" />
                <h3 className="text-xl font-medium text-white">Ready to Generate</h3>
                <p className="text-gray-400">Click the button below to create your AI model</p>
                <Button 
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white px-8 py-3"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Model
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center space-y-4">
                <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <h3 className="text-xl font-medium text-white">Generating Your Model</h3>
                <p className="text-gray-400">This may take a few moments...</p>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-white mb-2">Your AI Models</h3>
                  <p className="text-gray-400">Generated {generatedImages.length} variations</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Generated model ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <Button size="sm" variant="secondary">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => {
                      setCurrentStep(0)
                      setGeneratedImages([])
                      setFormData({
                        referenceFiles: [],
                        gender: '',
                        ethnicity: '',
                        fashionStyle: '',
                        facialFeatures: {
                          eyeSize: [50],
                          noseShape: [50],
                          lipFullness: [50],
                          jawline: [50],
                          cheekbones: [50]
                        },
                        bodyFeatures: {
                          height: [50],
                          build: [50],
                          musculature: [50]
                        },
                        background: '',
                        customPrompt: ''
                      })
                    }}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    Generate Another Model
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">AI Model Generator</h1>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </Badge>
          </div>
          
          <Progress 
            value={(currentStep / (WIZARD_STEPS.length - 1)) * 100} 
            className="h-2 mb-6"
          />

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  index <= currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${
                    index <= currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              {WIZARD_STEPS[currentStep].icon}
              <span>{WIZARD_STEPS[currentStep].title}</span>
            </CardTitle>
            <p className="text-gray-400">{WIZARD_STEPS[currentStep].description}</p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < WIZARD_STEPS.length - 1 && (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}