import { getCountryApiUrl, getConfiguredCountries, CountryConfig } from '../config/country-config';

// Types pour les réponses des APIs
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Service API pour la supervision multi-pays
export class MultiCountryApiService {
  private currentCountry: string;

  constructor() {
    // Par défaut, utiliser le premier pays configuré
    this.currentCountry = getConfiguredCountries()[0].code;
  }

  // Définir le pays actif
  setCurrentCountry(countryCode: string): void {
    const country = getConfiguredCountries().find(c => c.code === countryCode);
    if (country) {
      this.currentCountry = countryCode;
      // Stocker dans localStorage pour persistance
      localStorage.setItem('selectedCountry', countryCode);
      console.log(`Pays changé vers: ${country.name} (${countryCode})`);
    } else {
      console.error(`Pays non trouvé: ${countryCode}`);
    }
  }

  // Obtenir le pays actif
  getCurrentCountry(): string {
    return this.currentCountry;
  }

  // Obtenir la configuration du pays actif
  getCurrentCountryConfig(): CountryConfig | null {
    return getConfiguredCountries().find(c => c.code === this.currentCountry) || null;
  }

  // Initialiser depuis localStorage
  initFromStorage(): void {
    // Nettoyer les anciennes valeurs incorrectes
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry === 'BR') {
      console.log('Nettoyage de l\'ancienne valeur "BR" du localStorage');
      localStorage.removeItem('selectedCountry');
    }
    
    const cleanSavedCountry = localStorage.getItem('selectedCountry');
    if (cleanSavedCountry) {
      this.currentCountry = cleanSavedCountry;
      console.log(`Pays initialisé depuis localStorage: ${cleanSavedCountry}`);
    } else {
      console.log('Aucun pays sauvegardé, utilisation du pays par défaut');
    }
  }

  // Fonction générique pour faire des appels HTTP
  private async fetchFromCountry<T>(
    countryCode: string,
    endpointType: keyof CountryConfig['endpoints'],
    path: string = '',
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = getCountryApiUrl(countryCode, endpointType);
    if (!baseUrl) {
      return {
        success: false,
        error: `Aucune configuration API trouvée pour le pays: ${countryCode}`
      };
    }

    // Pour le Brésil (API locale), utiliser les URLs relatives pour passer par le proxy
    let url: string;
    if (countryCode === '1') {
      // API locale via proxy Vite
      const endpoint = baseUrl.replace('http://localhost:5000', '');
      url = path ? `${endpoint}${path}` : endpoint;
    } else {
      // APIs distantes directes
      url = path ? `${baseUrl}${path}` : baseUrl;
    }
    
    console.log(`Appel API: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Erreur API ${countryCode} - ${endpointType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Utiliser le pays actif pour les appels API
  private async fetchFromCurrentCountry<T>(
    endpointType: keyof CountryConfig['endpoints'],
    path: string = '',
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.fetchFromCountry(this.currentCountry, endpointType, path, options);
  }

  // Authentification
  async login(mail: string, mdp: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('auth', '/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ mail, mdp })
    });
  }

  // Dashboard
  async getDashboardSummary(): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('dashboard', '/summary');
  }

  async getRecentAlerts(): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('dashboard', '/alertes/recentes');
  }

  // Pays
  async getCountry(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('pays', `/${id}`);
  }

  async getCountryExploitations(idPays: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('pays', `/${idPays}/exploitations`);
  }

  async getCountryMeasureHistory(idPays: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('pays', `/${idPays}/mesures`);
  }

  // Exploitation
  async getExploitation(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('exploitation', `/${id}`);
  }

  async getExploitationEntrepots(idExploitation: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('exploitation', `/${idExploitation}/entrepots`);
  }

  async getExploitationUsers(idExploitation: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('exploitation', `/${idExploitation}/utilisateurs`);
  }

  // Entrepot
  async getEntrepot(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('entrepot', `/${id}`);
  }

  async getEntrepotMeasures(idEntrepot: string, days: number = 30): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('mesures', `/entrepot/${idEntrepot}`);
  }

  async getEntrepotLots(idEntrepot: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('entrepot', `/${idEntrepot}/lots`);
  }

  // Lot
  async getLot(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('lot', `/${id}`);
  }

  async getLotMeasures(idLot: string, datSto?: string): Promise<ApiResponse<any>> {
    const path = datSto ? `/${idLot}/mesures?from=${datSto}` : `/${idLot}/mesures`;
    return this.fetchFromCurrentCountry('lot', path);
  }

  async getLotAlerts(idLot: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('lot', `/${idLot}/alertes`);
  }

  // Alertes
  async getAllAlerts(filters?: { pays?: string; type?: string; }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters?.pays) params.append('pays', filters.pays);
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const path = queryString ? `/alertes?${queryString}` : '/alertes';
    
    return this.fetchFromCurrentCountry('alertes', path);
  }

  // CRUD Operations
  async createExploitation(data: { nom: string; idPays: string; }): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('exploitation', '', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateExploitation(id: string, data: { nom: string; idPays: string; }): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('exploitation', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteExploitation(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('exploitation', `/${id}`, {
      method: 'DELETE'
    });
  }

  async createEntrepot(data: {
    nom: string;
    adresse: string;
    limiteQte: number;
    idExploitation: string;
  }): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('entrepot', '', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateEntrepot(id: string, data: {
    nom: string;
    adresse: string;
    limiteQte: number;
    idExploitation: string;
  }): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('entrepot', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteEntrepot(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('entrepot', `/${id}`, {
      method: 'DELETE'
    });
  }

  async createLot(idEntrepot: string, data: { datSto: string }): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('entrepot', `/${idEntrepot}/lots`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateLot(id: string, data: { datSortie?: string; statut?: string; }): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('lot', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteLot(id: string): Promise<ApiResponse<any>> {
    return this.fetchFromCurrentCountry('lot', `/${id}`, {
      method: 'DELETE'
    });
  }

  // Vérifier la connectivité avec l'API du pays actif
  async checkConnectivity(countryCode?: string): Promise<ApiResponse<{ connected: boolean; country: CountryConfig }>> {
    const country = countryCode ? 
      getConfiguredCountries().find(c => c.code === countryCode) : 
      this.getCurrentCountryConfig();
    
    if (!country) {
      return {
        success: false,
        error: 'Configuration pays non trouvée'
      };
    }

    try {
      const response = await fetch(`${country.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return {
          success: true,
          data: {
            connected: true,
            country
          }
        };
      } else {
        return {
          success: false,
          error: `Health check failed: ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        data: {
          connected: false,
          country
        }
      };
    }
  }

  // Vérifier la connectivité de tous les pays
  async checkAllCountriesConnectivity(): Promise<ApiResponse<Array<{ country: string; connected: boolean; responseTime: number }>>> {
    const configuredCountries = getConfiguredCountries();
    const connectivityPromises = configuredCountries.map(async country => {
      const startTime = Date.now();
      const response = await this.fetchFromCountry(country.code, 'exploitation', '/health');
      const responseTime = Date.now() - startTime;

      return {
        country: country.name,
        code: country.code,
        flag: country.flag,
        connected: response.success,
        responseTime
      };
    });

    const connectivityResults = await Promise.all(connectivityPromises);
    
    return {
      success: true,
      data: connectivityResults
    };
  }
}

// Export du service singleton
export const multiCountryApiService = new MultiCountryApiService();
