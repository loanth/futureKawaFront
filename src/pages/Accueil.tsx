import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, Building2, Thermometer, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export const Accueil: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Vérifier si l'utilisateur est connecté et a le rôle "supervision"
  const canAccessSupervision = isAuthenticated && user?.nom?.toLowerCase().includes('supervision');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-coffee-dark mb-4">
          {t('accueil.welcome')}
        </h1>
        <p className="text-lg text-coffee-medium max-w-2xl mx-auto">
          {t('accueil.description')}
        </p>
      </div>

      {/* Cartes d'accès rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {canAccessSupervision && (
          <div
            onClick={() => navigate('/dashboard')}
            className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 hover:shadow-md hover:border-accent-primary/30 cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <Package className="w-8 h-8 text-accent-primary mr-3" />
              <h3 className="text-lg font-semibold text-coffee-dark">
                {t('accueil.supervision')}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {t('accueil.supervisionDesc')}
            </p>
          </div>
        )}

        <div
          onClick={() => navigate('/alertes')}
          className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 hover:shadow-md hover:border-accent-primary/30 cursor-pointer transition-all"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-status-warning mr-3" />
            <h3 className="text-lg font-semibold text-coffee-dark">
              {t('accueil.alerts')}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {t('accueil.alertsDesc')}
          </p>
        </div>

        <div
          onClick={() => navigate('/pays/1')}
          className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 hover:shadow-md hover:border-accent-primary/30 cursor-pointer transition-all"
        >
          <div className="flex items-center mb-4">
            <Building2 className="w-8 h-8 text-coffee-medium mr-3" />
            <h3 className="text-lg font-semibold text-coffee-dark">
              {t('accueil.brazil')}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {t('accueil.brazilDesc')}
          </p>
        </div>

        <div
          onClick={() => navigate('/pays/2')}
          className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 hover:shadow-md hover:border-accent-primary/30 cursor-pointer transition-all"
        >
          <div className="flex items-center mb-4">
            <Building2 className="w-8 h-8 text-coffee-medium mr-3" />
            <h3 className="text-lg font-semibold text-coffee-dark">
              {t('accueil.ecuador')}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {t('accueil.ecuadorDesc')}
          </p>
        </div>
      </div>

      {/* Informations système */}
      <div className="bg-cream-bg rounded-xl p-6 border border-coffee-light/10">
        <h2 className="text-xl font-bold text-coffee-dark mb-4 flex items-center">
          <Thermometer className="w-6 h-6 mr-2 text-orange-500" />
          {t('accueil.systemStatus')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">✅</div>
            <div className="text-sm text-gray-600">{t('accueil.systemOnline')}</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">🌡️</div>
            <div className="text-sm text-gray-600">{t('accueil.sensorsActive')}</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">📊</div>
            <div className="text-sm text-gray-600">{t('accueil.dataCollection')}</div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="text-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          {t('accueil.goToDashboard')}
        </button>
      </div>
    </div>
  );
};
