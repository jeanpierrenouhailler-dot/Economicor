import { RadarCountry, RadarIndicatorCategory, TrajectoryDirection } from '../models/Radar';
import { RADAR_COUNTRIES } from './RadarData';

export class RadarService {
  /**
   * Returns all available countries on the Economic Radar
   */
  public static getAllCountries(): RadarCountry[] {
    return Object.values(RADAR_COUNTRIES);
  }

  /**
   * Returns a specific country by code (defaults to FR)
   */
  public static getCountry(code: string = 'FR'): RadarCountry {
    const key = code.toUpperCase();
    return RADAR_COUNTRIES[key] || RADAR_COUNTRIES.FR;
  }

  /**
   * Filter countries matching a specific indicator trajectory (e.g. Croissance up, Inflation down)
   */
  public static filterByTrajectory(
    category: RadarIndicatorCategory,
    direction: TrajectoryDirection
  ): RadarCountry[] {
    return Object.values(RADAR_COUNTRIES).filter(
      country => country.metrics[category]?.direction === direction
    );
  }

  /**
   * Returns list of indicator categories in canonical order
   */
  public static getCategories(): RadarIndicatorCategory[] {
    return [
      'Croissance',
      'Inflation',
      'Chômage',
      'Dette',
      'Immobilier',
      'Industrie',
      'Exportations'
    ];
  }
}
