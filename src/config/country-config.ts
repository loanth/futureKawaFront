// Configuration des URLs d'API par pays pour la supervision
export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  baseUrl: string;
  endpoints: {
    auth: string;
    pays: string;
    exploitation: string;
    entrepot: string;
    lot: string;
    mesures: string;
    alertes: string;
    dashboard: string;
    utilisateurs: string;
  };
}

export const COUNTRIES_CONFIG: CountryConfig[] = [
  {
    code: '1',
    name: 'Brésil',
    flag: 'BR',
    baseUrl: 'http://localhost:5000',
    endpoints: {
      auth: '/api',
      pays: '/api/pays',
      exploitation: '/api/exploitations',
      entrepot: '/api/entrepots',
      lot: '/api/lots',
      mesures: '/api/mesures',
      alertes: '/api/alertes',
      dashboard: '/api/dashboard',
      utilisateurs: '/api/utilisateurs'
    }
  },
  {
    code: '2',
    name: 'Équateur',
    flag: 'EC',
    baseUrl: 'https://api.futurekawa.com.ec',
    endpoints: {
      auth: '/api',
      pays: '/api/pays',
      exploitation: '/api/exploitations',
      entrepot: '/api/entrepots',
      lot: '/api/lots',
      mesures: '/api/mesures',
      alertes: '/api/alertes',
      dashboard: '/api/dashboard',
      utilisateurs: '/api/utilisateurs'
    }
  },
  {
    code: '3',
    name: 'Colombie',
    flag: 'CO',
    baseUrl: 'https://api.futurekawa.com.co',
    endpoints: {
      auth: '/api',
      pays: '/api/pays',
      exploitation: '/api/exploitations',
      entrepot: '/api/entrepots',
      lot: '/api/lots',
      mesures: '/api/mesures',
      alertes: '/api/alertes',
      dashboard: '/api/dashboard',
      utilisateurs: '/api/utilisateurs'
    }
  }
];

// Fonction utilitaire pour obtenir l'URL complète pour un endpoint spécifique d'un pays
export function getCountryApiUrl(countryCode: string, endpointType: keyof CountryConfig['endpoints']): string | null {
  const config = COUNTRIES_CONFIG.find(c => c.code === countryCode);
  if (!config) {
    console.error(`Aucune configuration API trouvée pour le pays: ${countryCode}`);
    return null;
  }
  
  return `${config.baseUrl}${config.endpoints[endpointType]}`;
}

// Fonction pour obtenir la configuration complète d'un pays
export function getCountryConfig(countryCode: string): CountryConfig | null {
  return COUNTRIES_CONFIG.find(c => c.code === countryCode) || null;
}

// Fonction pour obtenir le pays par défaut (premier de la liste)
export function getDefaultCountry(): CountryConfig {
  return COUNTRIES_CONFIG[0];
}

// Fonction pour lister tous les pays configurés
export function getConfiguredCountries(): CountryConfig[] {
  return [...COUNTRIES_CONFIG];
}
