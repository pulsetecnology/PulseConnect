import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Por favor, digite seu email.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      await resetPassword(email)
      setSuccess('Instruções para redefinir sua senha foram enviadas para seu email.')
      
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error)
      setError('Erro ao enviar email de recuperação. Verifique se o email está correto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">PC</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            PulseConnect
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Recupere o acesso à sua conta
          </p>
        </div>

        {/* Card de Recuperação */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Botão Voltar */}
            <div>
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Link>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Título do Card */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Esqueceu sua senha?
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Digite seu email para receber instruções de recuperação
              </p>
            </div>

            {!success ? (
              /* Formulário de Recuperação */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Enviar Instruções
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Instruções pós-envio */
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Email enviado!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Voltar ao Login
                  </Link>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Precisa de ajuda?
                </span>
              </div>
            </div>

            {/* Informações de Suporte */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Se você não receber o email em alguns minutos, verifique sua pasta de spam ou{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  entre em contato conosco
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lembrou da senha?{' '}
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword