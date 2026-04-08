import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@futurekawa.com');
  const [password, setPassword] = useState('password123');
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
      // 🔌 APPEL API : POST /api/auth/login — Authentification utilisateur (email + mot de passe), retourne un token JWT et les infos utilisateur
      const response = await api.login(email, password);
      login(response.token, response.user, selectedCountry);
      
      // Mapping des pays vers leurs IDs
      const countryIds: { [key: string]: number } = {
        'Brésil': 1,
        'Équateur': 2,
        'Colombie': 3
      };
      
      // Rediriger selon le choix
      if (selectedCountry === 'Supervision') {
        navigate('/');
      } else {
        const countryId = countryIds[selectedCountry];
        navigate(`/pays/${countryId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-coffee-light/10 rounded-full blur-3xl"></div>

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
          Plateforme de suivi des stocks de grains de café vert
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-xl sm:px-10 border border-coffee-light/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error &&
            <div className="bg-status-danger/10 border border-status-danger/20 rounded-lg p-4 flex items-center text-status-danger">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            }

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-coffee-dark">
                
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm" />
                
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-coffee-dark">
                
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm" />
                
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-dark mb-3">
                Sélectionnez votre périmètre d'accès
              </label>
              <div className="space-y-2">
                {['Brésil', 'Équateur', 'Colombie', 'Supervision'].map((country) => (
                  <label key={country} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                    <input
                      type="radio"
                      name="country"
                      value={country}
                      checked={selectedCountry === country}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-4 h-4 text-accent-primary border-gray-300 focus:ring-accent-primary"
                    />
                    <span className="text-sm text-coffee-dark font-medium">{country}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-70 transition-colors">
                
                {isLoading ?
                <Loader2 className="w-5 h-5 animate-spin" /> :

                'Se connecter'
                }
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Identifiants de test : admin@futurekawa.com / password123</p>
          </div>
        </div>
      </div>
    </div>);

};