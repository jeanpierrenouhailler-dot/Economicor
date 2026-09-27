import { EconomicObservation } from '../../models/Observation';
import { DataQuery } from '../../models/Query';
import { NormalizationService } from '../../services/NormalizationService';
import { IMFDataMapperResponse, IMFDataMapperParser } from './IMFDataMapper';

export class IMFMapper {
  /**
   * Map IMF DataMapper response to unified EconomicObservation[]
   */
  public static mapDataMapper(
    response: IMFDataMapperResponse,
    query: DataQuery,
    indicatorId: string = 'real_gdp_growth'
  ): EconomicObservation[] {
    const rawPoints = IMFDataMapperParser.parse(response);
    const observations: EconomicObservation[] = [];
    const sourceDataset = response.dataset || query.dataset || 'WEO';
    const label = response.label || query.indicator || 'IMF Economic Indicator';
    const rawUnit = response.unit || '%';
    const { unit, category: unitCategory } = NormalizationService.normalizeUnit(rawUnit);

    for (const point of rawPoints) {
      const country = NormalizationService.normalizeCountry(point.countryCode);

      // Filter by requested countries if query specifies them
      if (query.countries && query.countries.length > 0) {
        const matchesRequested = query.countries.some((c) => {
          const normC = NormalizationService.normalizeCountry(c);
          return normC.code === country.code || normC.iso3 === country.iso3;
        });
        if (!matchesRequested) continue;
      }

      const { period, frequency, dateSortKey } = NormalizationService.normalizePeriod(point.year);

      // Period boundary filtering
      if (query.startPeriod && period < query.startPeriod) continue;
      if (query.endPeriod && period > query.endPeriod) continue;

      const { value, status } = NormalizationService.normalizeValue(point.value);

      observations.push({
        source: 'imf',
        dataset: sourceDataset,
        indicator: indicatorId,
        indicatorLabel: label,
        country: country.code,
        countryIso3: country.iso3,
        countryLabel: country.name,
        period,
        periodDate: dateSortKey,
        value,
        unit,
        unitCategory,
        frequency,
        status: status || 'normal',
        lastUpdated: response.updated
      });
    }

    return NormalizationService.sortObservations(observations);
  }
}
