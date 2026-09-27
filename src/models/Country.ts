export interface Country {
  code: string;       // Normalized ISO 2-letter (e.g., 'FR')
  iso3: string;       // Normalized ISO 3-letter (e.g., 'FRA')
  name: string;       // English display label (e.g., 'France')
  nameFr?: string;     // French display label (e.g., 'France')
  flag: string;       // Unicode flag emoji (e.g., '🇫🇷')
  region: string;     // Region (e.g., 'Europe', 'North America', 'Asia')
  isEU?: boolean;     // EU member
  isEurozone?: boolean;
}

export const COUNTRIES: Country[] = [
  { code: 'FR', iso3: 'FRA', name: 'France', nameFr: 'France', flag: '🇫🇷', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'DE', iso3: 'DEU', name: 'Germany', nameFr: 'Allemagne', flag: '🇩🇪', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'IT', iso3: 'ITA', name: 'Italy', nameFr: 'Italie', flag: '🇮🇹', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'ES', iso3: 'ESP', name: 'Spain', nameFr: 'Espagne', flag: '🇪🇸', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'NL', iso3: 'NLD', name: 'Netherlands', nameFr: 'Pays-Bas', flag: '🇳🇱', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'BE', iso3: 'BEL', name: 'Belgium', nameFr: 'Belgique', flag: '🇧🇪', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'PT', iso3: 'PRT', name: 'Portugal', nameFr: 'Portugal', flag: '🇵🇹', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'AT', iso3: 'AUT', name: 'Austria', nameFr: 'Autriche', flag: '🇦🇹', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'IE', iso3: 'IRL', name: 'Ireland', nameFr: 'Irlande', flag: '🇮🇪', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'GR', iso3: 'GRC', name: 'Greece', nameFr: 'Grèce', flag: '🇬🇷', region: 'Europe', isEU: true, isEurozone: true },
  { code: 'SE', iso3: 'SWE', name: 'Sweden', nameFr: 'Suède', flag: '🇸🇪', region: 'Europe', isEU: true, isEurozone: false },
  { code: 'DK', iso3: 'DNK', name: 'Denmark', nameFr: 'Danemark', flag: '🇩🇰', region: 'Europe', isEU: true, isEurozone: false },
  { code: 'PL', iso3: 'POL', name: 'Poland', nameFr: 'Pologne', flag: '🇵🇱', region: 'Europe', isEU: true, isEurozone: false },
  { code: 'EU', iso3: 'EUR', name: 'European Union', nameFr: 'Union Européenne', flag: '🇪🇺', region: 'Europe', isEU: true, isEurozone: false },
  { code: 'US', iso3: 'USA', name: 'United States', nameFr: 'États-Unis', flag: '🇺🇸', region: 'North America', isEU: false },
  { code: 'GB', iso3: 'GBR', name: 'United Kingdom', nameFr: 'Royaume-Uni', flag: '🇬🇧', region: 'Europe', isEU: false },
  { code: 'JP', iso3: 'JPN', name: 'Japan', nameFr: 'Japon', flag: '🇯🇵', region: 'Asia', isEU: false },
  { code: 'CN', iso3: 'CHN', name: 'China', nameFr: 'Chine', flag: '🇨🇳', region: 'Asia', isEU: false },
  { code: 'CA', iso3: 'CAN', name: 'Canada', nameFr: 'Canada', flag: '🇨🇦', region: 'North America', isEU: false },
  { code: 'CH', iso3: 'CHE', name: 'Switzerland', nameFr: 'Suisse', flag: '🇨🇭', region: 'Europe', isEU: false }
];
