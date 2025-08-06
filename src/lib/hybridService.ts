// Hybrid service that automatically switches between Supabase and mock data
import { supabase } from './supabase';
import { mockAuthService, MockAuthResponse } from './mockAuth';
import { mockDataService, MockUser, MockJob, MockProposal, MockReview } from './mockData';
import type { UserProfile, Job, Proposal, Review } from './supabase';

// Connection status
let isOnline = true;
let connectionCheckInProgress = false;

// Connection listeners
type ConnectionListener = (online: boolean) => void;
const connectionListeners: ConnectionListener[] = [];

// Add connection listener
export function onConnectionChange(callback: ConnectionListener): () => void {
  connectionListeners.push(callback);
  
  // Immediately call with current status
  callback(isOnline);
  
  // Return unsubscribe function
  return () => {
    const index = connectionListeners.indexOf(callback);
    if (index > -1) {
      connectionListeners.splice(index, 1);
    }
  };
}

// Notify connection listeners
function notifyConnectionChange(online: boolean): void {
  if (isOnline !== online) {
    isOnline = online;
    connectionListeners.forEach(callback => callback(online));
  }
}

// Check Supabase connection with enhanced error handling
export async function checkSupabaseConnection(): Promise<boolean> {
  if (connectionCheckInProgress) {
    return isOnline;
  }

  connectionCheckInProgress = true;
  
  try {
    // First check network connectivity
    if (!navigator.onLine) {
      console.log('No network connection detected');
      notifyConnectionChange(false);
      return false;
    }

    // Try to make a simple query to test connection with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    const queryPromise = supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1);

    const { error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    if (error) {
      console.log('Supabase query failed:', error.message);
      // Check if it's a 404 error (table not found) or other database issues
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.log('Database table issues detected, switching to offline mode');
      }
      notifyConnectionChange(false);
      return false;
    }
    
    console.log('Supabase connection successful');
    notifyConnectionChange(true);
    return true;
  } catch (error: any) {
    console.log('Supabase connection failed, switching to offline mode:', error.message);
    notifyConnectionChange(false);
    return false;
  } finally {
    connectionCheckInProgress = false;
  }
}

// Helper function to ensure connectivity before Supabase operations
export async function ensureConnectivity(): Promise<boolean> {
  if (!isOnline) {
    // Try to reconnect
    const connected = await checkSupabaseConnection();
    if (!connected) {
      console.log('Operation attempted while offline, using fallback');
      return false;
    }
  }
  return true;
}

// Initialize connection check
checkSupabaseConnection();

// Periodically check connection
setInterval(checkSupabaseConnection, 30000); // Check every 30 seconds

// Listen to browser online/offline events
window.addEventListener('online', () => {
  console.log('Browser detected online, checking Supabase connection');
  checkSupabaseConnection();
});

window.addEventListener('offline', () => {
  console.log('Browser detected offline, switching to offline mode');
  notifyConnectionChange(false);
});

// Convert MockUser to UserProfile
function mockUserToProfile(mockUser: MockUser): UserProfile {
  return {
    id: mockUser.id,
    user_id: mockUser.id, // Use id as user_id
    full_name: mockUser.name,
    user_type: mockUser.user_type,
    avatar_url: mockUser.avatar_url,
    bio: mockUser.bio,
    skills: mockUser.skills,
    hourly_rate: mockUser.hourly_rate,
    location: mockUser.location,
    created_at: mockUser.created_at,
    updated_at: mockUser.created_at
  };
}

// Convert MockJob to Job
function mockJobToJob(mockJob: MockJob): Job {
  return {
    id: mockJob.id,
    creator_id: mockJob.client_id,
    title: mockJob.title,
    description: mockJob.description,
    category: 'Geral', // Default category since MockJob doesn't have category
    budget_min: mockJob.budget,
    budget_max: mockJob.budget,
    skills_required: mockJob.skills_required,
    status: mockJob.status,
    created_at: mockJob.created_at,
    updated_at: mockJob.created_at
  };
}

// Convert MockProposal to Proposal
function mockProposalToProposal(mockProposal: MockProposal): Proposal {
  return {
    id: mockProposal.id,
    job_id: mockProposal.job_id,
    freelancer_id: mockProposal.freelancer_id,
    proposed_price: mockProposal.proposed_rate,
    message: mockProposal.message,
    delivery_days: 7, // valor padrão
    status: mockProposal.status,
    created_at: mockProposal.created_at,
    updated_at: mockProposal.created_at
  };
}

// Convert MockReview to Review
function mockReviewToReview(mockReview: MockReview): Review {
  return {
    id: mockReview.id,
    job_id: '', // MockReview doesn't have job_id, using empty string
    reviewer_id: mockReview.reviewer_id,
    reviewed_id: mockReview.reviewed_id,
    rating: mockReview.rating,
    comment: mockReview.comment,
    created_at: mockReview.created_at
  };
}

// Hybrid Authentication Service
export class HybridAuthService {
  private static instance: HybridAuthService;
  private authListeners: ((user: UserProfile | null) => void)[] = [];

  static getInstance(): HybridAuthService {
    if (!HybridAuthService.instance) {
      HybridAuthService.instance = new HybridAuthService();
    }
    return HybridAuthService.instance;
  }

  constructor() {
    // Listen to mock auth changes
    mockAuthService.onAuthStateChange((mockUser) => {
      const user = mockUser ? mockUserToProfile(mockUser) : null;
      this.notifyAuthStateChange(user);
    });

    // Listen to Supabase auth changes (when online)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (isOnline && session?.user) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          this.notifyAuthStateChange(profile);
        } catch (error) {
          console.log('Failed to load profile from Supabase, using mock auth');
          // Fallback to mock auth if Supabase fails
          const mockUser = mockAuthService.getCurrentUser();
          const user = mockUser ? mockUserToProfile(mockUser) : null;
          this.notifyAuthStateChange(user);
        }
      } else if (!session?.user) {
        this.notifyAuthStateChange(null);
      }
    });
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    this.authListeners.push(callback);
    
    // Immediately call with current user
    this.getCurrentUser().then(callback);
    
    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  private notifyAuthStateChange(user: UserProfile | null): void {
    this.authListeners.forEach(callback => callback(user));
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          return profile;
        }
      } catch (error) {
        console.log('Failed to get user from Supabase, using mock auth');
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    const mockUser = mockAuthService.getCurrentUser();
    return mockUser ? mockUserToProfile(mockUser) : null;
  }

  async signInWithEmail(email: string, password: string): Promise<{ error?: string }> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          return {};
        }
      } catch (error: any) {
        console.log('Supabase sign in failed, using mock auth:', error.message);
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    const mockResponse = await mockAuthService.signInWithEmail({ email, password });
    return {
      error: mockResponse.error
    };
  }

  async signUpWithEmail(email: string, password: string): Promise<{ error?: string }> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user) {
          const profileData = {
            user_id: data.user.id,
            full_name: 'Usuário',
            user_type: 'freelancer' as const,
            bio: 'Novo usuário na plataforma PulseConnect',
            location: 'Brasil'
          };
          
          const { data: profile } = await supabase
            .from('user_profiles')
            .insert(profileData)
            .select()
            .single();
          
          return {};
        }
      } catch (error: any) {
        console.log('Supabase sign up failed, using mock auth:', error.message);
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    const mockResponse = await mockAuthService.signUpWithEmail({ email, password, name: 'Usuário', user_type: 'freelancer' });
    return {
      error: mockResponse.error
    };
  }

  async signInWithGoogle(): Promise<{ error?: string }> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        
        // OAuth redirect will handle the rest
        return {};
      } catch (error: any) {
        console.log('Supabase Google sign in failed, using mock auth:', error.message);
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    const mockResponse = await mockAuthService.signInWithGoogle();
    return {
      error: mockResponse.error
    };
  }

  async signOut(): Promise<void> {
    if (isOnline) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.log('Supabase sign out failed, using mock auth');
      }
    }
    
    await mockAuthService.signOut();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<{ error?: string }> {
    if (isOnline) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select()
            .single();
          
          if (error) throw error;
          return {};
        }
      } catch (error: any) {
        console.log('Supabase profile update failed, using mock auth:', error.message);
      }
    }
    
    // Convert UserProfile updates to MockUser compatible format
    const mockUpdates: Partial<MockUser> = {
      id: updates.id,
      name: updates.full_name,
      user_type: updates.user_type === 'admin' ? 'freelancer' : updates.user_type,
      avatar_url: updates.avatar_url,
      bio: updates.bio,
      skills: updates.skills,
      hourly_rate: updates.hourly_rate,
      location: updates.location,
      created_at: updates.created_at
    };
    
    const mockResponse = await mockAuthService.updateProfile(mockUpdates);
    return {
      error: mockResponse.error
    };
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    if (isOnline) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return {};
      } catch (error: any) {
        console.log('Supabase password reset failed, using mock auth:', error.message);
      }
    }
    
    return await mockAuthService.resetPassword(email);
  }

  async resendConfirmation(email: string): Promise<{ error?: string }> {
    if (isOnline) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
        if (error) throw error;
        return {};
      } catch (error: any) {
        console.log('Supabase resend confirmation failed, using mock auth:', error.message);
      }
    }
    
    return await mockAuthService.resendConfirmation(email);
  }
}

// Hybrid Data Service
export class HybridDataService {
  async getJobs(): Promise<Job[]> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            user_profiles!jobs_client_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(job => ({
          ...job,
          client_name: job.user_profiles?.full_name || 'Cliente'
        }));
      } catch (error) {
        console.log('Failed to fetch jobs from Supabase, using mock data');
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    console.log('Using mock data for jobs (offline mode)');
    const mockJobs = mockDataService.getJobs();
    return mockJobs.map(mockJobToJob);
  }

  async getJobById(id: string): Promise<Job | null> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            user_profiles!jobs_client_id_fkey(full_name)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        return {
          ...data,
          client_name: data.user_profiles?.full_name || 'Cliente'
        };
      } catch (error) {
        console.log('Failed to fetch job from Supabase, using mock data');
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    console.log('Using mock data for job (offline mode)');
    const mockJob = mockDataService.getJobById(id);
    return mockJob ? mockJobToJob(mockJob) : null;
  }

  async getUserProfiles(): Promise<UserProfile[]> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.log('Failed to fetch profiles from Supabase, using mock data');
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    console.log('Using mock data for user profiles (offline mode)');
    const mockUsers = mockDataService.getUsers();
    return mockUsers.map(mockUserToProfile);
  }

  async getProposalsByJob(jobId: string): Promise<Proposal[]> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select(`
            *,
            user_profiles!proposals_freelancer_id_fkey(full_name)
          `)
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(proposal => ({
          ...proposal,
          freelancer_name: proposal.user_profiles?.full_name || 'Freelancer'
        }));
      } catch (error) {
        console.log('Failed to fetch proposals from Supabase, using mock data');
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    console.log('Using mock data for proposals (offline mode)');
    const mockProposals = mockDataService.getProposalsByJob(jobId);
    return mockProposals.map(mockProposalToProposal);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    const canUseSupabase = await ensureConnectivity();
    
    if (canUseSupabase) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            user_profiles!reviews_reviewer_id_fkey(full_name)
          `)
          .eq('reviewed_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(review => ({
          ...review,
          reviewer_name: review.user_profiles?.full_name || 'Usuário'
        }));
      } catch (error) {
        console.log('Failed to fetch reviews from Supabase, using mock data');
        // Force offline mode if there's a persistent error
        notifyConnectionChange(false);
      }
    }
    
    console.log('Using mock data for reviews (offline mode)');
    const mockReviews = mockDataService.getReviewsByUser(userId);
    return mockReviews.map(mockReviewToReview);
  }
}

// Export singleton instances
export const hybridAuthService = HybridAuthService.getInstance();
export const hybridDataService = new HybridDataService();

// Export connection status
export { isOnline };