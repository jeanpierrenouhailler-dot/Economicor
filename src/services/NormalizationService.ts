import { Country, COUNTRIES } from '../models/Country';
import { EconomicObservation } from '../models/Observation';

export class NormalizationService {
  private static countryMapByCode: Map<string, Country> = new Map();
  private static countryMapByIso3: Map<string, Country> = new Map();
  private static countryMapByName: Map<string, Country> = new Map();

  static {
    for (const c of COUNTRIES) {
      this.countryMapByCode.set(c.code.toUpperCase(), c);
      this.countryMapByIso3.set(c.iso3.toUpperCase(), c);
      this.countryMapByName.set(c.name.toLowerCase(), c);
      if (c.nameFr) {
        this.countryMapByName.set(c.nameFr.toLowerCase(), c);
      }
    }
    // Eurostat special codes aliases
    const euCountry = COUNTRIES.find(c => c.code === 'EU');
    if (euCountry) {
      this.countryMapByCode.set('EU27_2020', euCountry);
      this.countryMapByCode.set('EU28', euCountry);
      this.countryMapByCode.set('EA19', euCountry);
      this.countryMapByCode.set('EA20', euCountry);
      this.countryMapByIso3.set('EURO', euCountry);
    }
    const deCountry = COUNTRIES.find(c => c.code === 'DE');
    if (deCountry) {
      this.countryMapByCode.set('DE_TOT', deCountry);
    }
    const frCountry = COUNTRIES.find(c => c.code === 'FR');
    if (frCountry) {
      this.countryMapByCode.set('FX', frCountry);
    }
    const ukCountry = COUNTRIES.find(c => c.code === 'GB');
    if (ukCountry) {
      this.countryMapByCode.set('UK', ukCountry);
    }
  }

  /**
   * Normalizes any country representation (ISO-2, ISO-3, name, Eurostat code)
   * into a standardized Country object.
   */
  public static normalizeCountry(raw: string): Country {
    if (!raw) {
      return {
        code: 'XX',
        iso3: 'XXX',
        name: 'Unknown',
        flag: '🌐',
        region: 'Global'
      };
    }

    const clean = raw.trim();
    const upper = clean.toUpperCase();
    const lower = clean.toLowerCase();

    // Check direct maps
    if (this.countryMapByCode.has(upper)) {
      return this.countryMapByCode.get(upper)!;
    }
    if (this.countryMapByIso3.has(upper)) {
      return this.countryMapByIso3.get(upper)!;
    }
    if (this.countryMapByName.has(lower)) {
      return this.countryMapByName.get(lower)!;
    }

    // Dynamic fallback for any unmapped country
    return {
      code: upper.slice(0, 2),
      iso3: upper.length >= 3 ? upper.slice(0, 3) : `${upper}_`,
      name: clean,
      flag: '🌐',
      region: 'International'
    };
  }

  /**
   * Normalizes time period string to standard formats:
   * YYYY, YYYY-Q1, YYYY-MM
   */
  public static normalizePeriod(rawPeriod: string): { period: string; frequency: 'A' | 'Q' | 'M' | string; dateSortKey: string } {
    const p = String(rawPeriod).trim();

    // Quarterly: e.g. 2024Q1, 2024-Q1, 2024-q1, 2024.1
    const qMatch = p.match(/^(\d{4})[-_./]?Q([1-4])$/i);
    if (qMatch) {
      const year = qMatch[1];
      const q = qMatch[2];
      const qMonth = q === '1' ? '01' : q === '2' ? '04' : q === '3' ? '07' : '10';
      return {
        period: `${year}-Q${q}`,
        frequency: 'Q',
        dateSortKey: `${year}-${qMonth}-01`
      };
    }

    // Monthly: e.g. 2024-05, 2024M05, 2024M5, 2024-5
    const mMatch = p.match(/^(\d{4})[-_./M](\d{1,2})$/i);
    if (mMatch) {
      const year = mMatch[1];
      const month = mMatch[2].padStart(2, '0');
      return {
        period: `${year}-${month}`,
        frequency: 'M',
        dateSortKey: `${year}-${month}-01`
      };
    }

    // Annual: e.g. 2024
    const aMatch = p.match(/^(\d{4})$/);
    if (aMatch) {
      const year = aMatch[1];
      return {
        period: year,
        frequency: 'A',
        dateSortKey: `${year}-01-01`
      };
    }

    return {
      period: p,
      frequency: 'OTHER',
      dateSortKey: p
    };
  }

  /**
   * Normalizes numerical observation values, handling nulls, NaNs, status flags.
   */
  public static normalizeValue(rawValue: unknown): { value: number | null; status?: string } {
    if (rawValue === null || rawValue === undefined || rawValue === '' || rawValue === ':') {
      return { value: null, status: 'missing' };
    }

    if (typeof rawValue === 'number') {
      if (Number.isNaN(rawValue) || !Number.isFinite(rawValue)) {
        return { value: null, status: 'nan' };
      }
      return { value: Math.round(rawValue * 100) / 100 };
    }

    if (typeof rawValue === 'string') {
      const clean = rawValue.trim();
      if (clean === ':' || clean === 'NaN' || clean === 'null' || clean === '-') {
        return { value: null, status: 'missing' };
      }

      // Check for flag annotations like "104.2 p" (provisional), "99.8 e" (estimated)
      const parts = clean.split(/\s+/);
      const numPart = parseFloat(parts[0]);
      if (Number.isNaN(numPart)) {
        return { value: null, status: 'invalid' };
      }

      let status = undefined;
      if (parts.length > 1) {
        const flag = parts[1].toLowerCase();
        if (flag === 'p') status = 'provisional';
        else if (flag === 'e') status = 'estimated';
        else if (flag === 'b') status = 'break';
        else status = flag;
      }

      return {
        value: Math.round(numPart * 100) / 100,
        status
      };
    }

    return { value: null, status: 'unknown' };
  }

  /**
   * Normalizes unit strings and identifies unit category
   */
  public static normalizeUnit(rawUnit?: string): { unit: string; category: 'percent' | 'index' | 'currency' | 'ratio' | 'count' } {
    if (!rawUnit) {
      return { unit: 'Units', category: 'ratio' };
    }

    const u = rawUnit.trim();
    const lower = u.toLowerCase();

    if (u === '%' || lower.includes('percent') || lower.includes('percentage') || lower.includes('rate')) {
      return { unit: '%', category: 'percent' };
    }

    if (lower.includes('index') || lower.includes('i15') || lower.includes('2015=100')) {
      return { unit: u || 'Index', category: 'index' };
    }

    if (lower.includes('eur') || lower.includes('euro')) {
      return { unit: 'EUR', category: 'currency' };
    }

    if (lower.includes('usd') || lower.includes('dollar')) {
      return { unit: 'USD', category: 'currency' };
    }

    if (lower.includes('per capita') || lower.includes('ratio')) {
      return { unit: u, category: 'ratio' };
    }

    return { unit: u, category: 'count' };
  }

  /**
   * Checks whether two observations or series are compatible for comparison on the same axis.
   */
  public static areUnitsCompatible(unitA: string, unitB: string): boolean {
    const catA = this.normalizeUnit(unitA).category;
    const catB = this.normalizeUnit(unitB).category;
    return catA === catB;
  }

  /**
   * Sorts observations chronologically by periodDate
   */
  public static sortObservations(observations: EconomicObservation[]): EconomicObservation[] {
    return [...observations].sort((a, b) => {
      const keyA = a.periodDate || a.period;
      const keyB = b.periodDate || b.period;
      return keyA.localeCompare(keyB);
    });
  }
}
