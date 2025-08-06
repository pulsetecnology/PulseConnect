import React from 'react'
import { WifiOff, AlertCircle } from 'lucide-react'

interface OfflineModeProps {
  children: React.ReactNode
}

export const OfflineMode: React.FC<OfflineModeProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner de modo offline */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
        <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </span>
              <p className="ml-3 font-medium text-yellow-800 dark:text-yellow-200 truncate">
                <span className="md:hidden">Modo Offline</span>
                <span className="hidden md:inline">
                  Você está no modo offline. Algumas funcionalidades podem estar limitadas.
                </span>
              </p>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  Dados podem estar desatualizados
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo da aplicação */}
      <div className="relative">
        {children}
        
        {/* Overlay sutil para indicar modo offline */}
        <div className="absolute inset-0 bg-gray-100/10 dark:bg-gray-800/10 pointer-events-none" />
      </div>
    </div>
  )
}

// Hook para detectar status offline
export const useOfflineMode = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)
  
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOffline
}

// Componente para mostrar mensagens quando funcionalidades não estão disponíveis offline
export const OfflineMessage: React.FC<{ feature?: string }> = ({ feature = 'Esta funcionalidade' }) => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 m-4">
      <div className="flex items-center">
        <WifiOff className="h-5 w-5 text-yellow-500 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Funcionalidade Indisponível Offline
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {feature} não está disponível no modo offline. Conecte-se à internet para acessar esta funcionalidade.
          </p>
        </div>
      </div>
    </div>
  )
}