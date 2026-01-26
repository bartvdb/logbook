import { getPendingAIRequests } from './db';
import { processAIQueue } from './ai';

type OnlineCallback = () => void;
type OfflineCallback = () => void;
type QueueProcessedCallback = (count: number) => void;

class SyncService {
  private isOnline: boolean;
  private onlineCallbacks: OnlineCallback[] = [];
  private offlineCallbacks: OfflineCallback[] = [];
  private queueProcessedCallbacks: QueueProcessedCallback[] = [];
  private processingQueue = false;

  constructor() {
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onlineCallbacks.forEach((cb) => cb());
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineCallbacks.forEach((cb) => cb());
    });
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
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

  async processQueue(): Promise<void> {
    if (!this.isOnline || this.processingQueue) return;

    this.processingQueue = true;

    try {
      const processed = await processAIQueue();
      if (processed > 0) {
        this.queueProcessedCallbacks.forEach((cb) => cb(processed));
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  async getPendingCount(): Promise<number> {
    const pending = await getPendingAIRequests();
    return pending.length;
  }

  // Try to process queue periodically when online
  startBackgroundSync(intervalMs = 60000): () => void {
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
