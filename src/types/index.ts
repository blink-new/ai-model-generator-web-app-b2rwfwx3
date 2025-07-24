export interface User {
  id: string
  email: string
  displayName?: string
}

export interface GenerationData {
  id: string
  user_id: string
  reference_files: string
  gender: string
  ethnicity: string
  fashion_style: string
  facial_features: string
  body_features: string
  background: string
  custom_background: string
  generated_images: string
  is_favorite: number
  created_at: string
}

export interface FacialFeatures {
  eyeSize: number[]
  noseShape: number[]
  lipFullness: number[]
  jawline: number[]
  cheekbones: number[]
}

export interface BodyFeatures {
  height: number[]
  build: number[]
  musculature: number[]
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