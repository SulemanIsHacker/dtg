import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download, CheckCircle } from 'lucide-react';

const PWAStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Check if can install
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  }

  if (isInstalled) {
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        PWA Installed
      </Badge>
    );
  }

  if (canInstall) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Download className="h-3 w-3" />
        Install Available
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Wifi className="h-3 w-3" />
      Online
    </Badge>
  );
};

export default PWAStatus;
