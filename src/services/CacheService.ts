import { API_CONFIG } from '../config/api';

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  expiresAt: number;
  metadata?: Record<string, unknown>;
}

export type CacheCategory = 'metadata' | 'historical' | 'recent' | 'observations' | 'datasets';

export class CacheService {
  private static DB_NAME = 'EconomicDataExplorerDB';
  private static DB_VERSION = 1;
  private static STORE_NAME = 'economic_cache';
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not supported in this environment');
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Determine TTL for a given cache category
   */
  public static getDefaultTTL(category: CacheCategory = 'recent'): number {
    switch (category) {
      case 'metadata':
      case 'datasets':
        return API_CONFIG.cache.metadataTTL;
      case 'historical':
        return API_CONFIG.cache.historicalTTL;
      case 'recent':
      case 'observations':
      default:
        return API_CONFIG.cache.recentTTL;
    }
  }

  /**
   * Store a value in cache
   */
  public static async set<T>(
    key: string,
    data: T,
    category: CacheCategory = 'recent',
    customTTL?: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const db = await this.getDB();
      const ttl = customTTL ?? this.getDefaultTTL(category);
      const now = Date.now();
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: now,
        ttl,
        expiresAt: now + ttl,
        metadata
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.put(entry);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage if IndexedDB is blocked or throws
      try {
        const ttl = customTTL ?? this.getDefaultTTL(category);
        const now = Date.now();
        const entry = { data, timestamp: now, expiresAt: now + ttl, metadata };
        localStorage.setItem(`ede_cache_${key}`, JSON.stringify(entry));
      } catch {
        // quota exceeded or disabled
      }
    }
  }

  /**
   * Retrieve a value from cache if valid.
   * Returns null if not found or expired (unless ignoreExpiration is true for offline mode).
   */
  public static async get<T>(key: string, ignoreExpiration: boolean = false): Promise<CacheEntry<T> | null> {
    try {
      const db = await this.getDB();
      const entry = await new Promise<CacheEntry<T> | null>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve(req.result || null);
        };
        req.onerror = () => reject(req.error);
      });

      if (!entry) {
        return this.getFromLocalStorageFallback<T>(key, ignoreExpiration);
      }

      if (!ignoreExpiration && Date.now() > entry.expiresAt) {
        // expired
        return null;
      }

      return entry;
    } catch {
      return this.getFromLocalStorageFallback<T>(key, ignoreExpiration);
    }
  }

  private static getFromLocalStorageFallback<T>(key: string, ignoreExpiration: boolean): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(`ede_cache_${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!ignoreExpiration && Date.now() > parsed.expiresAt) {
        return null;
      }
      return {
        key,
        data: parsed.data,
        timestamp: parsed.timestamp,
        ttl: parsed.expiresAt - parsed.timestamp,
        expiresAt: parsed.expiresAt,
        metadata: parsed.metadata
      };
    } catch {
      return null;
    }
  }

  /**
   * Checks if key exists and is non-expired
   */
  public static async has(key: string): Promise<boolean> {
    const entry = await this.get(key, false);
    return entry !== null;
  }

  /**
   * Remove a single entry
   */
  public static async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(`ede_cache_${key}`);
    } catch {
      // ignore
    }
  }

  /**
   * Clear all cached data
   */
  public static async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // ignore
    }
  }
}
