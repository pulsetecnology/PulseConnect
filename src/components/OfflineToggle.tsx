import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { mockDataService } from '../lib/mockData'
import { useAuth } from '../contexts/AuthContext'

const OfflineToggle: React.FC = () => {
  const { isOnline } = useAuth()
  const [isOfflineMode, setIsOfflineMode] = React.useState(mockDataService.isOfflineMode())

  const toggleOfflineMode = () => {
    const newOfflineMode = !isOfflineMode
    mockDataService.setOfflineMode(newOfflineMode)
    setIsOfflineMode(newOfflineMode)
    
    // Recarregar a página para aplicar as mudanças
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="h-4 border-l border-gray-300 dark:border-gray-600" />
          
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              isOfflineMode
                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30'
            }`}
            title={isOfflineMode ? 'Alternar para modo online' : 'Alternar para modo offline'}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Modo Offline</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" />
                <span>Modo Online</span>
              </>
            )}
          </button>
        </div>
        
        {isOfflineMode && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Usando dados locais simulados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OfflineToggle