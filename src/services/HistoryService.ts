import { DataQuery } from '../models/Query';

export interface HistoryItem {
  id: string;
  query: DataQuery;
  title: string;
  subtitle: string;
  timestamp: string;
  resultsCount: number;
}

export class HistoryService {
  private static STORAGE_KEY = 'ede_history';
  private static MAX_ENTRIES = 30;

  public static getHistory(): HistoryItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  public static addEntry(query: DataQuery, title: string, subtitle: string, resultsCount: number): void {
    const list = this.getHistory();
    const id = `hist_${Date.now()}`;
    const newEntry: HistoryItem = {
      id,
      query,
      title,
      subtitle,
      timestamp: new Date().toISOString(),
      resultsCount
    };

    // Keep unique recent queries, remove older duplicates
    const filtered = list.filter(item => {
      const isSameQuery = JSON.stringify(item.query) === JSON.stringify(query);
      return !isSameQuery;
    });

    const updated = [newEntry, ...filtered].slice(0, this.MAX_ENTRIES);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  public static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public static removeEntry(id: string): void {
    const list = this.getHistory();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}
