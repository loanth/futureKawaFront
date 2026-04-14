import React, { useEffect, useState } from 'react';
import { multiCountryApiService } from '../services/multi-country-api';
import { COUNTRIES_CONFIG } from '../config/country-config';

export const CountryTabs: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countryConfig, setCountryConfig] = useState<any>(null);

  useEffect(() => {
    // Récupérer la configuration du pays depuis localStorage
    const savedConfig = localStorage.getItem('countryConfig');
    if (savedConfig) {
      setCountryConfig(JSON.parse(savedConfig));
      const country = COUNTRIES_CONFIG.find(c => c.name === JSON.parse(savedConfig).name);
      if (country) {
        setSelectedCountry(country.name);
        // Initialiser le service avec la configuration du pays
        multiCountryApiService.setCurrentCountry(country.code);
      }
    }
  }, []);

  // Fonction pour changer de pays
  const handleCountryChange = (countryName: string) => {
    const country = COUNTRIES_CONFIG.find(c => c.name === countryName);
    if (country) {
      setSelectedCountry(countryName);
      setCountryConfig(country);
      multiCountryApiService.setCurrentCountry(country.code);
      localStorage.setItem('countryConfig', JSON.stringify(country));
    }
  };

  if (!countryConfig) {
    return <div>Chargement...</div>;
  }

  return null;
};
