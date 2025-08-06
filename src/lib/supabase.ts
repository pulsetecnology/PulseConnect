import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzwfslydblfmodpwlnbz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2ZzbHlkYmxmbW9kcHdsbmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NDA3MTUsImV4cCI6MjA3MDAxNjcxNX0.VAo7mOBnEvdFchFfBzprkASVHBDCZI_9JG8-AdWdLcM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco de dados
export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  bio?: string
  location?: string
  skills?: string[]
  user_type: 'client' | 'freelancer'
  avatar_url?: string
  title?: string
  rating?: number
  hourly_rate?: number
  completed_projects?: number
  total_reviews?: number
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  creator_id: string
  title: string
  description: string
  category: string
  budget_min?: number
  budget_max?: number
  location?: string
  skills_required?: string[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  job_id: string
  freelancer_id: string
  proposed_price: number
  message?: string
  delivery_days: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  job_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment?: string
  created_at: string
}

// Funções auxiliares para autenticação
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Funções para gerenciar perfis de usuário
export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export const getUserProfiles = async () => {
  return await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
}

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  return { data, error }
}

// Funções para gerenciar jobs
export const getJobs = async (filters?: { category?: string; location?: string }) => {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export const getJobById = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  return { data, error }
}

export const createJob = async (job: Partial<Job>) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([job])
    .select()
    .single()
  return { data, error }
}

// Funções para gerenciar propostas
export const getProposalsByJob = async (jobId: string) => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createProposal = async (proposal: Partial<Proposal>) => {
  const { data, error } = await supabase
    .from('proposals')
    .insert([proposal])
    .select()
    .single()
  return { data, error }
}

// Funções para gerenciar avaliações
export const getReviewsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewed_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createReview = async (review: Partial<Review>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single()
  return { data, error }
}