import { CountryScorecard, ScorecardPillarId, ScorecardMetric } from '../models/Scorecard';
import { SCORECARD_DATA } from './ScorecardData';

export interface ScorecardCountryOption {
  code: string;
  name: string;
  flag: string;
}

export class ScorecardService {
  /**
   * Get all supported scorecard countries
   */
  public static getSupportedCountries(): ScorecardCountryOption[] {
    return [
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
      { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
      { code: 'EU', name: 'Zone Euro', flag: '🇪🇺' }
    ];
  }

  /**
   * Retrieve the complete scorecard for a given country code
   */
  public static getScorecard(countryCode: string = 'FR'): CountryScorecard {
    const code = countryCode.toUpperCase();
    return SCORECARD_DATA[code] || SCORECARD_DATA.FR;
  }

  /**
   * Format executive briefing string suitable for clipboard copy or sharing
   */
  public static formatExecutiveBriefing(scorecard: CountryScorecard): string {
    return [
      `${scorecard.flag} ${scorecard.countryName} — Situation économique`,
      ``,
      `Croissance : ${scorecard.headline.growth}`,
      `Inflation : ${scorecard.headline.inflation}`,
      `Chômage : ${scorecard.headline.unemployment}`,
      `Dette : ${scorecard.headline.debt}`,
      `${scorecard.headline.centralBankName} : ${scorecard.headline.centralBankRate}`,
      ``,
      `Dernière mise à jour : ${scorecard.lastUpdated}`,
      ``,
      `Diagnostic de synthèse :`,
      scorecard.executiveSummary,
      ``,
      `Source : Economic Data Explorer (Economicor Intelligence) · INSEE, BCE, Eurostat, FRED`
    ].join('\n');
  }

  /**
   * Search metrics across a country scorecard
   */
  public static searchMetrics(scorecard: CountryScorecard, query: string, pillarFilter: string = 'all'): ScorecardMetric[] {
    const q = query.trim().toLowerCase();
    const metrics: ScorecardMetric[] = [];

    for (const pillar of scorecard.pillars) {
      if (pillarFilter !== 'all' && pillar.id !== pillarFilter) continue;
      for (const m of pillar.metrics) {
        if (!q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.sourceLabel.toLowerCase().includes(q)) {
          metrics.push(m);
        }
      }
    }

    return metrics;
  }
}
