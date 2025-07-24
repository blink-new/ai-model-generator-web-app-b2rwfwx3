export interface User {
  id: string
  email: string
  displayName?: string
}

export interface GenerationData {
  id: string
  userId: string
  referenceImages: string[]
  referenceVideos: string[]
  gender: 'male' | 'female'
  ethnicity: string
  fashionStyle: string
  facialFeatures: FacialFeatures
  bodyFeatures: BodyFeatures
  background: string
  generatedImages: string[]
  createdAt: string
  updatedAt: string
  isFavorite: boolean
}

export interface FacialFeatures {
  eyeColor: string
  hairColor: string
  hairStyle: string
  skinTone: string
  faceShape: string
  eyeShape: string
  noseShape: string
  lipShape: string
}

export interface BodyFeatures {
  height: string
  bodyType: string
  musculature: string
  pose: string
}

export interface WizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}