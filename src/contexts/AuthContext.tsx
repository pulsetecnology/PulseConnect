import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { hybridAuthService, onConnectionChange } from '../lib/hybridService';
import type { UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  resendConfirmation: (email: string) => Promise<{ error?: string }>;
  isOnline: boolean;
  connectionError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Listen to connection changes
    const unsubscribeConnection = onConnectionChange((online) => {
      if (mounted) {
        setIsOnline(online);
        setConnectionError(online ? null : 'Sem conexão com o servidor. Funcionando em modo offline.');
      }
    });
    
    // Listen to auth state changes
    const unsubscribeAuth = hybridAuthService.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      unsubscribeConnection();
      unsubscribeAuth();
    };
  }, [])

  // Auth methods using hybrid service
  const handleSignInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const result = await hybridAuthService.signInWithGoogle();
      return { error: result.error };
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      // Tratar erros específicos de tabela não encontrada
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        setConnectionError('Problema de conectividade. Funcionando em modo offline.');
        return { error: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.' };
      }
      
      // Tratar erros de rede
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setConnectionError('Sem conexão com o servidor. Funcionando em modo offline.');
        return { error: 'Problema de conexão. Verifique sua internet e tente novamente.' };
      }
      
      return { error: error.message || 'Erro ao fazer login com Google' };
    }
  };

  const handleSignInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const result = await hybridAuthService.signInWithEmail(email, password);
      return { error: result.error };
    } catch (error: any) {
      console.error('Erro no login com email:', error);
      
      // Tratar erros específicos de tabela não encontrada
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        setConnectionError('Problema de conectividade. Funcionando em modo offline.');
        return { error: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.' };
      }
      
      // Tratar erros de rede
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setConnectionError('Sem conexão com o servidor. Funcionando em modo offline.');
        return { error: 'Problema de conexão. Verifique sua internet e tente novamente.' };
      }
      
      // Tratar erros de autenticação específicos
      if (error.message?.includes('Invalid login credentials')) {
        return { error: 'Email ou senha incorretos.' };
      }
      
      return { error: error.message || 'Erro ao fazer login' };
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const result = await hybridAuthService.signUpWithEmail(email, password);
      return { error: result.error };
    } catch (error: any) {
      console.error('Erro no cadastro com email:', error);
      
      // Tratar erros específicos de tabela não encontrada
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        setConnectionError('Problema de conectividade. Funcionando em modo offline.');
        return { error: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.' };
      }
      
      // Tratar erros de rede
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setConnectionError('Sem conexão com o servidor. Funcionando em modo offline.');
        return { error: 'Problema de conexão. Verifique sua internet e tente novamente.' };
      }
      
      // Tratar erros de cadastro específicos
      if (error.message?.includes('User already registered')) {
        return { error: 'Este email já está cadastrado.' };
      }
      
      return { error: error.message || 'Erro ao criar conta' };
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await hybridAuthService.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    try {
      const result = await hybridAuthService.updateProfile(updates);
      return { error: result.error };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Tratar erros específicos de tabela não encontrada
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        setConnectionError('Problema de conectividade. Funcionando em modo offline.');
        return { error: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.' };
      }
      
      // Tratar erros de rede
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setConnectionError('Sem conexão com o servidor. Funcionando em modo offline.');
        return { error: 'Problema de conexão. Verifique sua internet e tente novamente.' };
      }
      
      return { error: error.message || 'Erro ao atualizar perfil' };
    }
  };

  const handleResetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const result = await hybridAuthService.resetPassword(email);
      return { error: result.error };
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      
      // Tratar erros de rede
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setConnectionError('Sem conexão com o servidor. Funcionando em modo offline.');
        return { error: 'Problema de conexão. Verifique sua internet e tente novamente.' };
      }
      
      return { error: error.message || 'Erro ao enviar email de recuperação' };
    }
  };

  const handleResendConfirmation = async (email: string): Promise<{ error?: string }> => {
    try {
      const result = await hybridAuthService.resendConfirmation(email);
      return { error: result.error };
    } catch (error: any) {
      console.error('Erro ao reenviar confirmação:', error);
      
      // Tratar erros de rede
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setConnectionError('Sem conexão com o servidor. Funcionando em modo offline.');
        return { error: 'Problema de conexão. Verifique sua internet e tente novamente.' };
      }
      
      return { error: error.message || 'Erro ao reenviar confirmação' };
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    resetPassword: handleResetPassword,
    resendConfirmation: handleResendConfirmation,
    isOnline,
    connectionError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}