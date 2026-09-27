import { DataQuery } from '../models/Query';

export interface FavoriteItem {
  id: string;
  title: string;
  subtitle: string;
  query: DataQuery;
  source: string;
  indicatorId: string;
  createdAt: string;
  tags?: string[];
}

export class FavoritesService {
  private static STORAGE_KEY = 'ede_favorites';

  public static getFavorites(): FavoriteItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.getDefaultFavorites();
      const items = JSON.parse(raw);
      return Array.isArray(items) && items.length > 0 ? items : this.getDefaultFavorites();
    } catch {
      return this.getDefaultFavorites();
    }
  }

  public static getDefaultFavorites(): FavoriteItem[] {
    return [
      {
        id: 'fav_fr_gdp',
        title: 'France — Real GDP Growth',
        subtitle: 'IMF World Economic Outlook',
        query: {
          source: 'imf',
          dataset: 'WEO',
          indicator: 'real_gdp_growth',
          countries: ['FR'],
          startPeriod: '2018',
          endPeriod: '2026',
          frequency: 'A'
        },
        source: 'imf',
        indicatorId: 'real_gdp_growth',
        createdAt: new Date().toISOString(),
        tags: ['GDP', 'France', 'IMF']
      },
      {
        id: 'fav_eu_hpi',
        title: 'France & Germany — House Price Index',
        subtitle: 'Eurostat Quarterly Statistics',
        query: {
          source: 'eurostat',
          dataset: 'prc_hpi_q',
          indicator: 'house_price_index',
          countries: ['FR', 'DE'],
          startPeriod: '2020-Q1',
          endPeriod: '2025-Q4',
          frequency: 'Q',
          dimensions: { unit: 'I15_Q', purchase: 'TOTAL' }
        },
        source: 'eurostat',
        indicatorId: 'house_price_index',
        createdAt: new Date().toISOString(),
        tags: ['Housing', 'Eurostat', 'Compare']
      },
      {
        id: 'fav_inflation_comparison',
        title: 'EU Core Economies — Inflation Rate',
        subtitle: 'IMF & Eurostat Macro Monitor',
        query: {
          source: 'imf',
          dataset: 'WEO',
          indicator: 'imf_inflation_rate',
          countries: ['FR', 'DE', 'IT', 'ES'],
          startPeriod: '2018',
          endPeriod: '2026',
          frequency: 'A'
        },
        source: 'imf',
        indicatorId: 'imf_inflation_rate',
        createdAt: new Date().toISOString(),
        tags: ['Inflation', 'Europe']
      }
    ];
  }

  public static addFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt'>): FavoriteItem {
    const list = this.getFavorites();
    const id = `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newFav: FavoriteItem = {
      ...item,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newFav, ...list.filter(f => f.title !== newFav.title)];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return newFav;
  }

  public static removeFavorite(id: string): void {
    const list = this.getFavorites();
    const updated = list.filter(f => f.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  public static isFavorite(indicatorId: string, countries: string[] = []): boolean {
    const list = this.getFavorites();
    const cSorted = [...countries].sort().join(',');
    return list.some(f => {
      const fCountries = (f.query.countries || []).slice().sort().join(',');
      return f.indicatorId === indicatorId && fCountries === cSorted;
    });
  }
}
