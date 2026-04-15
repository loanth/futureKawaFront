import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { multiCountryApiService } from '../services/multi-country-api';
import { getConfiguredCountries, CountryConfig } from '../config/country-config';
import { useAuth } from '../contexts/AuthContext';

export const CountrySelector: React.FC = () => {
  const { isSupervision } = useAuth();
  const [currentCountry, setCurrentCountry] = useState<CountryConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialiser depuis le service API
    multiCountryApiService.initFromStorage();
    const countryConfig = multiCountryApiService.getCurrentCountryConfig();
    
    if (countryConfig) {
      setCurrentCountry(countryConfig);
    }
  }, []);

  const handleCountryChange = (country: CountryConfig) => {
    setCurrentCountry(country);
    multiCountryApiService.setCurrentCountry(country.code);
    setIsOpen(false);
    
    // Forcer le rechargement des données si nécessaire
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { country: country.code, name: country.name } 
    }));
  };

  if (!currentCountry) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-coffee-medium rounded-lg">
        <Globe size={16} />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  // En mode utilisateur normal, afficher uniquement le pays actuel sans possibilité de changement
  if (!isSupervision()) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-coffee-medium rounded-lg">
        <Globe size={16} />
        <span className="text-sm font-medium">{currentCountry?.flag}</span>
        <span className="text-sm">{currentCountry?.name}</span>
      </div>
    );
  }

  // En mode supervision, afficher le dropdown avec tous les pays
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-coffee-medium rounded-lg hover:bg-coffee-light transition-colors"
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{currentCountry?.flag}</span>
        <span className="text-sm">{currentCountry?.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-coffee-light z-20 min-w-[200px]">
            <div className="py-2">
              {getConfiguredCountries().map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country)}
                  className={`
                    w-full px-4 py-2 text-left hover:bg-cream-bg transition-colors flex items-center space-x-3
                    ${currentCountry?.code === country.code ? 'bg-accent-primary/10 text-accent-primary' : 'text-coffee-dark'}
                  `}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <div className="font-medium">{country.name}</div>
                    <div className="text-xs text-coffee-light">
                      {country.baseUrl.includes('localhost') ? 'Local' : 'API Distante'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
