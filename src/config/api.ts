export const API_CONFIG = {
  eurostat: {
    // Official Eurostat SDMX 3.0 API
    sdmx: 'https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0',
    // Official Eurostat Statistics 1.0 JSON-stat API
    jsonStat: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data',
    // Internal proxy route for fallback / server proxy
    proxy: '/api/eurostat'
  },
  imf: {
    // Official IMF DataMapper API v2
    dataMapper: 'https://www.imf.org/external/datamapper/api/v2',
    // Official IMF SDMX 3.0 / REST API
    sdmx: 'https://dataservices.imf.org/REST/SDMX_JSON.svc',
    // Internal proxy route for fallback / server proxy
    proxy: '/api/imf'
  },
  worldbank: {
    api: 'https://api.worldbank.org/v2',
    proxy: '/api/worldbank'
  },
  cache: {
    metadataTTL: 1000 * 60 * 60 * 24 * 7,     // 7 days
    historicalTTL: 1000 * 60 * 60 * 24 * 3,   // 3 days
    recentTTL: 1000 * 60 * 60 * 4             // 4 hours
  }
};
