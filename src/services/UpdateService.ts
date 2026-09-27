export interface UpdateInfo {
  version: string;
  releaseDate: string;
  lastChecked: string;
  lastCheckedTimestamp: number;
  isChecking: boolean;
  updateAvailable: boolean;
  autoUpdateEnabled: boolean;
  statusMessage?: string;
}

type UpdateListener = (info: UpdateInfo) => void;

class UpdateService {
  private static instance: UpdateService;
  public readonly APP_VERSION = '1.2.0';
  public readonly RELEASE_DATE = '27 Septembre 2026';
  private STORAGE_KEY = 'ede_update_state';
  private listeners: Set<UpdateListener> = new Set();
  private autoCheckTimer: number | null = null;

  private state: UpdateInfo;

  private constructor() {
    const saved = this.loadState();
    this.state = {
      version: this.APP_VERSION,
      releaseDate: this.RELEASE_DATE,
      lastChecked: saved?.lastChecked || new Date().toISOString(),
      lastCheckedTimestamp: saved?.lastCheckedTimestamp || Date.now(),
      isChecking: false,
      updateAvailable: false,
      autoUpdateEnabled: saved?.autoUpdateEnabled !== false,
      statusMessage: 'Application à jour'
    };

    this.initAutoCheck();
    this.initServiceWorkerListener();
  }

  public static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  private loadState(): Partial<UpdateInfo> | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          lastChecked: this.state.lastChecked,
          lastCheckedTimestamp: this.state.lastCheckedTimestamp,
          autoUpdateEnabled: this.state.autoUpdateEnabled
        })
      );
    } catch {
      // ignore
    }
  }

  public getState(): UpdateInfo {
    return { ...this.state };
  }

  public subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  public setAutoUpdate(enabled: boolean): void {
    this.state.autoUpdateEnabled = enabled;
    this.saveState();
    if (enabled) {
      this.initAutoCheck();
    } else if (this.autoCheckTimer) {
      window.clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
    }
    this.notify();
  }

  private initAutoCheck(): void {
    if (this.autoCheckTimer) {
      window.clearInterval(this.autoCheckTimer);
    }

    if (!this.state.autoUpdateEnabled || typeof window === 'undefined') return;

    // Check periodically every 10 minutes in background
    this.autoCheckTimer = window.setInterval(() => {
      this.checkForUpdates(false).catch(() => {});
    }, 10 * 60 * 1000);
  }

  private initServiceWorkerListener(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.state.updateAvailable = false;
      this.state.statusMessage = 'Nouvelle version activée avec succès !';
      this.notify();
    });
  }

  /**
   * Vérifie la disponibilité d'une mise à jour (service worker + timestamp serveur)
   */
  public async checkForUpdates(manual: boolean = true): Promise<{ hasUpdate: boolean }> {
    this.state.isChecking = true;
    this.state.statusMessage = 'Vérification des mises à jour en cours...';
    this.notify();

    try {
      let swHasUpdate = false;

      // 1. Service worker update check
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          if (registration.waiting) {
            swHasUpdate = true;
          }
        }
      }

      // 2. Server health/timestamp check with cache-busting
      try {
        const res = await fetch(`/api/health?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          // Connected & verified
        }
      } catch {
        // Offline or proxy issue
      }

      // Update state
      const now = Date.now();
      this.state.lastChecked = new Date(now).toISOString();
      this.state.lastCheckedTimestamp = now;
      this.state.isChecking = false;
      this.state.updateAvailable = swHasUpdate;
      this.state.statusMessage = swHasUpdate
        ? 'Une nouvelle version est prête à être installée.'
        : 'Vous disposez de la version la plus récente.';

      this.saveState();
      this.notify();

      return { hasUpdate: swHasUpdate };
    } catch (err) {
      this.state.isChecking = false;
      this.state.statusMessage = 'Vérification terminée (hors ligne)';
      this.notify();
      return { hasUpdate: false };
    }
  }

  /**
   * Force l'actualisation complète : purge les caches du Service Worker et recharge la page
   */
  public async forceUpdate(): Promise<void> {
    this.state.isChecking = true;
    this.state.statusMessage = 'Purge des caches et réinstallation...';
    this.notify();

    try {
      // 1. Tell waiting service worker to skipWaiting
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update();
        }
      }

      // 2. Clear browser cache storage
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      this.state.lastChecked = new Date().toISOString();
      this.state.lastCheckedTimestamp = Date.now();
      this.saveState();

      // 3. Force hard reload bypassing cache
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }
}

export const updateService = UpdateService.getInstance();
