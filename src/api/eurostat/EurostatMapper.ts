import { EconomicObservation } from '../../models/Observation';
import { DataQuery } from '../../models/Query';
import { NormalizationService } from '../../services/NormalizationService';
import { JsonStatObservationItem, JsonStatResponse, EurostatJsonStatParser } from './EurostatJsonStat';

export class EurostatMapper {
  /**
   * Map JSON-stat parsed items to unified EconomicObservation[]
   */
  public static mapJsonStat(
    json: JsonStatResponse,
    query: DataQuery,
    indicatorId: string = 'house_price_index'
  ): EconomicObservation[] {
    const rawItems: JsonStatObservationItem[] = EurostatJsonStatParser.parse(json);
    const observations: EconomicObservation[] = [];
    const sourceDataset = query.dataset || 'eurostat_data';

    for (const item of rawItems) {
      // Find geographical entity in dimension indices (typically 'geo')
      const rawGeo = item.indices['geo'] || item.indices['GEO'] || '';
      if (!rawGeo) continue;

      const country = NormalizationService.normalizeCountry(rawGeo);

      // Filter by requested countries if query specifies them
      if (query.countries && query.countries.length > 0) {
        const matchesRequested = query.countries.some((c) => {
          const normC = NormalizationService.normalizeCountry(c);
          return normC.code === country.code || normC.iso3 === country.iso3;
        });
        if (!matchesRequested) continue;
      }

      // Find time period in dimension indices (typically 'time' or 'TIME_PERIOD')
      const rawTime = item.indices['time'] || item.indices['TIME_PERIOD'] || '';
      if (!rawTime) continue;

      const { period, frequency, dateSortKey } = NormalizationService.normalizePeriod(rawTime);

      // Period boundary filtering
      if (query.startPeriod && period < query.startPeriod) continue;
      if (query.endPeriod && period > query.endPeriod) continue;

      // Extract unit
      const rawUnit = item.indices['unit'] || item.labels['unit'] || 'Index';
      const { unit, category: unitCategory } = NormalizationService.normalizeUnit(rawUnit);

      // Value normalization
      const { value, status: valStatus } = NormalizationService.normalizeValue(item.value);

      observations.push({
        source: 'eurostat',
        dataset: sourceDataset,
        indicator: indicatorId,
        indicatorLabel: json.label || query.indicator || 'Eurostat Indicator',
        country: country.code,
        countryIso3: country.iso3,
        countryLabel: country.name,
        period,
        periodDate: dateSortKey,
        value,
        unit,
        unitCategory,
        frequency,
        status: item.status || valStatus || 'normal',
        lastUpdated: json.updated,
        dimensions: item.indices
      });
    }

    return NormalizationService.sortObservations(observations);
  }
}
