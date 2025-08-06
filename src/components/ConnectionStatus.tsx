import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { onConnectionChange } from '../lib/hybridService';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [showStatus, setShowStatus] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onConnectionChange((online) => {
      setIsOnline(online);
      
      // Show status indicator for a few seconds when connection changes
      if (!online) {
        setShowStatus(true);
        // Keep showing offline status
      } else {
        setShowStatus(true);
        // Hide online status after 3 seconds
        setTimeout(() => setShowStatus(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Modo Offline</span>
          </>
        )}
      </div>
    </div>
  );
};

// Connection error banner component
interface ConnectionErrorBannerProps {
  error: string | null;
  onRetry?: () => void;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {error}
          </p>
        </div>
        {onRetry && (
          <div className="ml-3">
            <button
              onClick={onRetry}
              className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-200 font-medium underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;