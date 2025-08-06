import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro na autenticação:', error)
          navigate('/login?error=auth_failed')
          return
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          navigate('/')
        } else {
          // Não há sessão ativa
          navigate('/login')
        }
      } catch (error) {
        console.error('Erro no callback de autenticação:', error)
        navigate('/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Processando autenticação...</p>
      </div>
    </div>
  )
}

export default AuthCallback