import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { multiCountryApiService } from '../services/multi-country-api';
import { COUNTRIES_CONFIG } from '../config/country-config';
import { useTranslation } from 'react-i18next';

export const Login: React.FC = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCountry) {
      setError('Veuillez sélectionner un pays ou la supervision');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedCountry !== 'Supervision') {
        const countryConfig = COUNTRIES_CONFIG.find(
          config => config.name === selectedCountry
        );

        if (countryConfig) {
          multiCountryApiService.setCurrentCountry(countryConfig.code);
          localStorage.setItem('countryConfig', JSON.stringify(countryConfig));

          const response = await multiCountryApiService.login(email, password);

          if (response.success && response.data) {
            login(response.data.token, response.data.user, selectedCountry);

            const countryIds: Record<string, number> = {
              'Brésil': 1,
              'Équateur': 2,
              'Colombie': 3
            };

            navigate(`/pays/${countryIds[selectedCountry]}`);
          } else {
            setError(response.error || 'Erreur de connexion');
          }
        }
      } else {
        // Supervision → API Brésil
        multiCountryApiService.setCurrentCountry('BR');

        const response = await multiCountryApiService.login(email, password);

        if (response.success && response.data) {
          const user = response.data.user;

          if (user.idPoste !== 3) {
            setError('Accès supervision refusé');
            return;
          }

          login(response.data.token, user, selectedCountry);
          navigate('/');
        } else {
          setError(response.error || 'Erreur de connexion');
        }
      }
    } catch (err: any) {
      setError(err.message || t('login.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-coffee-light/10 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-accent-primary p-3 rounded-2xl shadow-lg">
            <Coffee className="w-12 h-12 text-cream-bg" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-coffee-dark">
          FutureKawa
        </h2>

        <p className="mt-2 text-center text-sm text-coffee-medium">
          {t('login.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-xl sm:px-10 border border-coffee-light/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-status-danger/10 border border-status-danger/20 rounded-lg p-4 flex items-center text-status-danger">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-coffee-dark">
                {t('login.username')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-dark">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-dark mb-3">
                {t('login.selectScope')}
              </label>

              <div className="space-y-2">
                {['Brésil', 'Équateur', 'Colombie', 'Supervision'].map((country) => (
                  <label
                    key={country}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="radio"
                      name="country"
                      value={country}
                      checked={selectedCountry === country}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-4 h-4 text-accent-primary"
                    />
                    <span className="text-sm text-coffee-dark font-medium">
                      {country}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};