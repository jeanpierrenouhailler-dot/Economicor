import { EconomicObservation } from '../../models/Observation';
import { NormalizationService } from '../../services/NormalizationService';

export interface IMFCompactDataSeries {
  '@REF_AREA'?: string;
  '@TIME_FORMAT'?: string;
  '@UNIT'?: string;
  Obs?: { '@TIME_PERIOD': string; '@OBS_VALUE': string }[] | { '@TIME_PERIOD': string; '@OBS_VALUE': string };
}

export class IMFSDMXParser {
  /**
   * Parse CompactData SDMX-JSON from IMF REST service
   */
  public static parseCompactData(
    sdmxJson: unknown,
    indicatorId: string = 'imf_indicator',
    indicatorLabel: string = 'IMF Indicator'
  ): EconomicObservation[] {
    const observations: EconomicObservation[] = [];
    if (!sdmxJson || typeof sdmxJson !== 'object') return observations;

    const root = sdmxJson as Record<string, unknown>;
    const compactData = root.CompactData as Record<string, unknown> | undefined;
    const dataSet = compactData?.DataSet as Record<string, unknown> | undefined;
    const seriesList = dataSet?.Series;

    const list: IMFCompactDataSeries[] = Array.isArray(seriesList)
      ? seriesList
      : seriesList
      ? [seriesList]
      : [];

    for (const item of list) {
      const rawGeo = item['@REF_AREA'] || '';
      const country = NormalizationService.normalizeCountry(rawGeo);
      const rawUnit = item['@UNIT'] || '%';
      const { unit, category: unitCategory } = NormalizationService.normalizeUnit(rawUnit);

      const obsList = Array.isArray(item.Obs) ? item.Obs : item.Obs ? [item.Obs] : [];

      for (const obs of obsList) {
        const rawPeriod = obs['@TIME_PERIOD'] || '';
        const { period, frequency, dateSortKey } = NormalizationService.normalizePeriod(rawPeriod);
        const { value, status } = NormalizationService.normalizeValue(obs['@OBS_VALUE']);

        observations.push({
          source: 'imf',
          dataset: 'IFS',
          indicator: indicatorId,
          indicatorLabel,
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
          lastUpdated: new Date().toISOString()
        });
      }
    }

    return NormalizationService.sortObservations(observations);
  }
}
