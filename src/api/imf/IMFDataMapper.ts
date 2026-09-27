export interface IMFDataMapperResponse {
  values?: Record<string, Record<string, Record<string, number | null>>>;
  dataset?: string;
  indicator?: string;
  label?: string;
  unit?: string;
  source?: string;
  updated?: string;
}

export interface IMFTimeSeriesPoint {
  indicatorCode: string;
  countryCode: string; // ISO 3-letter, e.g. FRA, DEU
  year: string;
  value: number | null;
}

export class IMFDataMapperParser {
  /**
   * Parse nested IMF DataMapper response into flat time series points
   */
  public static parse(data: IMFDataMapperResponse): IMFTimeSeriesPoint[] {
    const points: IMFTimeSeriesPoint[] = [];
    if (!data || !data.values) return points;

    for (const [indicatorCode, countriesMap] of Object.entries(data.values)) {
      if (!countriesMap || typeof countriesMap !== 'object') continue;

      for (const [countryCode, yearsMap] of Object.entries(countriesMap)) {
        if (!yearsMap || typeof yearsMap !== 'object') continue;

        for (const [year, val] of Object.entries(yearsMap)) {
          let numVal: number | null = null;
          if (typeof val === 'number') {
            numVal = Number.isFinite(val) ? val : null;
          } else if (typeof val === 'string') {
            const parsed = parseFloat(val);
            numVal = Number.isFinite(parsed) ? parsed : null;
          }

          points.push({
            indicatorCode,
            countryCode,
            year,
            value: numVal
          });
        }
      }
    }

    return points;
  }
}
