import { getPendingAIRequests, getPendingSyncItems } from './db';
import { processAIQueue } from './ai';
import { processSyncQueue, syncFromCloud, getSyncStatus, onSyncStatusChange } from './dataService';
import { isSupabaseConfigured } from './supabase';

type OnlineCallback = () => void;
type OfflineCallback = () => void;
type QueueProcessedCallback = (count: number) => void;
type SyncStatusCallback = (status: string) => void;

class SyncService {
  private isOnline: boolean;
  private onlineCallbacks: OnlineCallback[] = [];
  private offlineCallbacks: OfflineCallback[] = [];
  private queueProcessedCallbacks: QueueProcessedCallback[] = [];
  private syncStatusCallbacks: SyncStatusCallback[] = [];
  private processingQueue = false;
  private initialSyncDone = false;

  constructor() {
    this.isOnline = navigator.onLine;
    this.setupListeners();
    this.setupSyncStatusListener();
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onlineCallbacks.forEach((cb) => cb());
      this.processQueue();
      this.syncData(); // Sync when coming online
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineCallbacks.forEach((cb) => cb());
    });
  }

  private setupSyncStatusListener(): void {
    onSyncStatusChange((status) => {
      this.syncStatusCallbacks.forEach((cb) => cb(status));
    });
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getSyncStatus(): string {
    if (!this.isOnline) return 'offline';
    return getSyncStatus();
  }

  onOnline(callback: OnlineCallback): () => void {
    this.onlineCallbacks.push(callback);
    return () => {
      this.onlineCallbacks = this.onlineCallbacks.filter((cb) => cb !== callback);
    };
  }

  onOffline(callback: OfflineCallback): () => void {
    this.offlineCallbacks.push(callback);
    return () => {
      this.offlineCallbacks = this.offlineCallbacks.filter((cb) => cb !== callback);
    };
  }

  onQueueProcessed(callback: QueueProcessedCallback): () => void {
    this.queueProcessedCallbacks.push(callback);
    return () => {
      this.queueProcessedCallbacks = this.queueProcessedCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onSyncStatusChange(callback: SyncStatusCallback): () => void {
    this.syncStatusCallbacks.push(callback);
    return () => {
      this.syncStatusCallbacks = this.syncStatusCallbacks.filter((cb) => cb !== callback);
    };
  }

  async processQueue(): Promise<void> {
    if (!this.isOnline || this.processingQueue) return;

    this.processingQueue = true;

    try {
      // Process AI queue
      const aiProcessed = await processAIQueue();
      if (aiProcessed > 0) {
        this.queueProcessedCallbacks.forEach((cb) => cb(aiProcessed));
      }

      // Process data sync queue
      if (isSupabaseConfigured()) {
        const dataProcessed = await processSyncQueue();
        if (dataProcessed > 0) {
          this.queueProcessedCallbacks.forEach((cb) => cb(dataProcessed));
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  async syncData(): Promise<void> {
    if (!this.isOnline || !isSupabaseConfigured()) return;

    try {
      // First, push any pending local changes
      await processSyncQueue();

      // Then, if this is the first sync, pull from cloud
      if (!this.initialSyncDone) {
        await syncFromCloud();
        this.initialSyncDone = true;
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }

  async forceSync(): Promise<void> {
    if (!this.isOnline || !isSupabaseConfigured()) return;

    try {
      await processSyncQueue();
      await syncFromCloud();
    } catch (error) {
      console.error('Error in force sync:', error);
      throw error;
    }
  }

  async getPendingCount(): Promise<number> {
    const [aiPending, syncPending] = await Promise.all([
      getPendingAIRequests(),
      getPendingSyncItems(),
    ]);
    return aiPending.length + syncPending.length;
  }

  // Try to process queue periodically when online
  startBackgroundSync(intervalMs = 60000): () => void {
    // Do initial sync on start
    if (this.isOnline && isSupabaseConfigured()) {
      this.syncData();
    }

    const interval = setInterval(() => {
      if (this.isOnline) {
        this.processQueue();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

export const syncService = new SyncService();

// PWA-related utilities
export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return !!registration.waiting;
    }
  }
  return false;
};

export const applyUpdate = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
};

// Check if app can be installed
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
};

export const canInstall = (): boolean => {
  return !!deferredPrompt;
};

export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
};

export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};
