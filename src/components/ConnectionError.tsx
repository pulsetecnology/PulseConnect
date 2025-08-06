import React, { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface ConnectionErrorProps {
  onRetry?: () => void
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setTimeout(() => setIsRetrying(false), 1000)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Problema de Conectividade
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Não foi possível conectar com o servidor. Verifique sua conexão com a internet e tente novamente.
          </p>
          
          {/* Status da conexão */}
          <div className="flex items-center justify-center mb-6 space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Internet conectada</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">Sem conexão com a internet</span>
              </>
            )}
          </div>

          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
            </button>
          )}
          
          {/* Dicas de solução */}
          <div className="mt-6 text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Possíveis soluções:</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Verifique sua conexão com a internet</li>
              <li>• Tente recarregar a página</li>
              <li>• Verifique se há problemas com seu provedor de internet</li>
              <li>• Aguarde alguns minutos e tente novamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}