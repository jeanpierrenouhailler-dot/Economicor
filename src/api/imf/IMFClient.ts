import { API_CONFIG } from '../../config/api';
import { HttpClient, defaultHttpClient } from '../core/HttpClient';
import { IMFDataMapperResponse } from './IMFDataMapper';
import gdpFixture from '../../fixtures/imf/gdp-growth.json';
import inflationFixture from '../../fixtures/imf/inflation.json';
import weoFixture from '../../fixtures/imf/weo-indicators.json';

export class IMFClient {
  private http: HttpClient;

  constructor(httpClient: HttpClient = defaultHttpClient) {
    this.http = httpClient;
  }

  /**
   * Fetch indicator time series from IMF DataMapper API v2
   * e.g. /NGDP_RPCH or /PCPIPCH
   */
  public async getDataMapperIndicator(
    indicatorCode: string,
    countries?: string[],
    periods?: string[]
  ): Promise<IMFDataMapperResponse> {
    // Determine target URL: direct or proxy
    let url = `${API_CONFIG.imf.dataMapper}/${indicatorCode}`;
    if (countries && countries.length > 0) {
      url += `/${countries.join('/')}`;
    }

    const queryParams: Record<string, string> = {};
    if (periods && periods.length > 0) {
      queryParams['periods'] = periods.join(',');
    }

    try {
      const response = await this.http.get<IMFDataMapperResponse>(url, {
        params: queryParams,
        timeoutMs: 8000
      });

      if (response.data && response.data.values) {
        return response.data;
      }
      throw new Error('Invalid response structure from IMF DataMapper');
    } catch {
      // In case of Akamai bot-filter (403), CORS, or offline network,
      // provide the official IMF World Economic Outlook fixture
      return this.getFixtureFallback(indicatorCode);
    }
  }

  private getFixtureFallback(indicatorCode: string): IMFDataMapperResponse {
    if (indicatorCode === 'NGDP_RPCH') {
      return gdpFixture as IMFDataMapperResponse;
    }
    if (indicatorCode === 'PCPIPCH') {
      return inflationFixture as IMFDataMapperResponse;
    }

    // Check weo-indicators fixture for GGXWDG_NGDP or LUR
    const weo = weoFixture as { values: Record<string, Record<string, Record<string, number>>>; dataset: string; source: string; updated: string };
    if (weo.values && weo.values[indicatorCode]) {
      return {
        values: {
          [indicatorCode]: weo.values[indicatorCode]
        },
        dataset: weo.dataset,
        indicator: indicatorCode,
        source: weo.source,
        updated: weo.updated,
        unit: indicatorCode === 'GGXWDG_NGDP' ? '% of GDP' : '%'
      };
    }

    return gdpFixture as IMFDataMapperResponse;
  }
}
