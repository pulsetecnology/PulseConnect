// Mock authentication service for offline functionality
import { mockDataService, MockUser } from './mockData';

export interface MockAuthResponse {
  user: MockUser | null;
  error?: string;
}

export interface MockSignInData {
  email: string;
  password: string;
}

export interface MockSignUpData {
  email: string;
  password: string;
  name: string;
  user_type: 'client' | 'freelancer';
}

// Mock authentication service class
export class MockAuthService {
  private static instance: MockAuthService;
  private currentUser: MockUser | null = null;
  private authListeners: ((user: MockUser | null) => void)[] = [];

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  constructor() {
    // Initialize mock data
    mockDataService.initializeData();
    
    // Load current user from localStorage
    this.currentUser = mockDataService.getCurrentUser();
  }

  // Add auth state listener
  onAuthStateChange(callback: (user: MockUser | null) => void): () => void {
    this.authListeners.push(callback);
    
    // Immediately call with current user
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of auth state change
  private notifyAuthStateChange(): void {
    this.authListeners.forEach(callback => callback(this.currentUser));
  }

  // Sign in with email and password
  async signInWithEmail(data: MockSignInData): Promise<MockAuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = mockDataService.getUserByEmail(data.email);
      
      if (!user) {
        return {
          user: null,
          error: 'Usuário não encontrado. Verifique seu email.'
        };
      }

      // In a real app, you'd verify the password
      // For mock purposes, we'll accept any password
      this.currentUser = user;
      mockDataService.setCurrentUser(user);
      this.notifyAuthStateChange();

      return {
        user: user
      };
    } catch (error) {
      return {
        user: null,
        error: 'Erro ao fazer login. Tente novamente.'
      };
    }
  }

  // Sign up with email and password
  async signUpWithEmail(data: MockSignUpData): Promise<MockAuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check if user already exists
      const existingUser = mockDataService.getUserByEmail(data.email);
      if (existingUser) {
        return {
          user: null,
          error: 'Este email já está em uso. Tente fazer login.'
        };
      }

      // Create new user
      const newUser = mockDataService.createUser({
        email: data.email,
        name: data.name,
        user_type: data.user_type,
        bio: data.user_type === 'client' 
          ? 'Novo cliente na plataforma PulseConnect'
          : 'Novo freelancer na plataforma PulseConnect',
        skills: data.user_type === 'freelancer' ? [] : undefined,
        hourly_rate: data.user_type === 'freelancer' ? 50 : undefined,
        location: 'Brasil'
      });

      this.currentUser = newUser;
      mockDataService.setCurrentUser(newUser);
      this.notifyAuthStateChange();

      return {
        user: newUser
      };
    } catch (error) {
      return {
        user: null,
        error: 'Erro ao criar conta. Tente novamente.'
      };
    }
  }

  // Sign in with Google (mock)
  async signInWithGoogle(): Promise<MockAuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For mock purposes, create or use a default Google user
      let googleUser = mockDataService.getUserByEmail('google@exemplo.com');
      
      if (!googleUser) {
        googleUser = mockDataService.createUser({
          email: 'google@exemplo.com',
          name: 'Usuário Google',
          user_type: 'client',
          bio: 'Usuário autenticado via Google',
          location: 'Brasil',
          avatar_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20google%20user%20avatar&image_size=square'
        });
      }

      this.currentUser = googleUser;
      mockDataService.setCurrentUser(googleUser);
      this.notifyAuthStateChange();

      return {
        user: googleUser
      };
    } catch (error) {
      return {
        user: null,
        error: 'Erro ao fazer login com Google. Tente novamente.'
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      this.currentUser = null;
      mockDataService.clearCurrentUser();
      this.notifyAuthStateChange();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  // Update user profile
  async updateProfile(updates: Partial<MockUser>): Promise<MockAuthResponse> {
    try {
      if (!this.currentUser) {
        return {
          user: null,
          error: 'Usuário não autenticado.'
        };
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = mockDataService.updateUser(this.currentUser.id, updates);
      
      if (!updatedUser) {
        return {
          user: null,
          error: 'Erro ao atualizar perfil.'
        };
      }

      this.currentUser = updatedUser;
      mockDataService.setCurrentUser(updatedUser);
      this.notifyAuthStateChange();

      return {
        user: updatedUser
      };
    } catch (error) {
      return {
        user: null,
        error: 'Erro ao atualizar perfil. Tente novamente.'
      };
    }
  }

  // Reset password (mock)
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockDataService.getUserByEmail(email);
      
      if (!user) {
        return {
          error: 'Email não encontrado.'
        };
      }

      // In a real app, this would send a reset email
      // For mock purposes, we'll just return success
      return {};
    } catch (error) {
      return {
        error: 'Erro ao enviar email de recuperação. Tente novamente.'
      };
    }
  }

  // Resend confirmation (mock)
  async resendConfirmation(email: string): Promise<{ error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = mockDataService.getUserByEmail(email);
      
      if (!user) {
        return {
          error: 'Email não encontrado.'
        };
      }

      // In a real app, this would resend confirmation email
      // For mock purposes, we'll just return success
      return {};
    } catch (error) {
      return {
        error: 'Erro ao reenviar confirmação. Tente novamente.'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get user type
  getUserType(): 'client' | 'freelancer' | null {
    return this.currentUser?.user_type || null;
  }
}

// Export singleton instance
export const mockAuthService = MockAuthService.getInstance();