import { useState, useEffect, useCallback } from 'react';
import {
  syncService,
  canInstall,
  promptInstall,
  isStandalone,
  checkForUpdates,
  applyUpdate,
  setupInstallPrompt,
} from '@/lib/sync';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(syncService.getOnlineStatus());

  useEffect(() => {
    const unsubOnline = syncService.onOnline(() => setIsOnline(true));
    const unsubOffline = syncService.onOffline(() => setIsOnline(false));

    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, []);

  return isOnline;
};

export const useQueueStatus = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastProcessed, setLastProcessed] = useState<number | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const updateCount = async () => {
      const count = await syncService.getPendingCount();
      setPendingCount(count);
    };

    updateCount();

    const unsubProcessed = syncService.onQueueProcessed((count) => {
      setLastProcessed(count);
      updateCount();
    });

    // Update count periodically
    const interval = setInterval(updateCount, 30000);

    return () => {
      unsubProcessed();
      clearInterval(interval);
    };
  }, []);

  const processNow = useCallback(async () => {
    if (isOnline) {
      await syncService.processQueue();
    }
  }, [isOnline]);

  return { pendingCount, lastProcessed, processNow };
};

export const usePWA = () => {
  const [canBeInstalled, setCanBeInstalled] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isStandalone());
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setupInstallPrompt();

    // Check install status periodically
    const checkInstall = () => {
      setCanBeInstalled(canInstall());
      setIsInstalled(isStandalone());
    };

    checkInstall();

    const interval = setInterval(checkInstall, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for updates on mount
    const check = async () => {
      const hasUpdate = await checkForUpdates();
      setUpdateAvailable(hasUpdate);
    };

    check();

    // Check periodically
    const interval = setInterval(check, 60000);

    return () => clearInterval(interval);
  }, []);

  const install = useCallback(async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setIsInstalled(true);
    }
    return accepted;
  }, []);

  const update = useCallback(() => {
    applyUpdate();
  }, []);

  return {
    canBeInstalled,
    isInstalled,
    updateAvailable,
    install,
    update,
  };
};

export const useBackgroundSync = () => {
  useEffect(() => {
    // Start background sync for AI queue
    const stopSync = syncService.startBackgroundSync(60000);

    return () => {
      stopSync();
    };
  }, []);
};

export const useSyncStatus = () => {
  const [status, setStatus] = useState(syncService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = syncService.onSyncStatusChange(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  const forceSync = useCallback(async () => {
    try {
      await syncService.forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  }, []);

  return { status, forceSync };
};
