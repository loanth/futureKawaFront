import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Clock,
  Building2,
  ChevronRight,
  Loader2,
  Wifi,
  WifiOff } from
'lucide-react';
import { multiCountryApiService } from '../services/multi-country-api';
import { MetricCard } from '../components/MetricCard';
import { AlertBanner } from '../components/AlertBanner';
import { CountryTabs } from '../components/CountryTabs';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_CONFIG } from '../config/country-config';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isSupervision } = useAuth();
  const [data, setData] = useState<any>(null);
  const [multiCountryData, setMultiCountryData] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Ne pas initialiser depuis localStorage pour éviter les conflits
    // Le pays sera défini par la sidebar lors de la navigation
  }, []);

  const fetchData = async () => {
    try {
      if (isSupervision()) {
        // Mode supervision : appeler toutes les APIs des pays
        console.log('Mode supervision : récupération des données de tous les pays...');
        const multiCountryResponse = await multiCountryApiService.getAllCountriesDashboardSummary();
        setMultiCountryData(multiCountryResponse);
        
        // Calculer les métriques globales
        let totalMetrics = { lotsStockes: 0, lotsAlerte: 0, lotsPerimes: 0, entrepotsActifs: 0 };
        let allSummaryByCountry: any[] = [];
        
        multiCountryResponse.countries.forEach((countryResult: any) => {
          if (countryResult.status === 'success' && countryResult.data) {
            // Ajouter les métriques de ce pays
            if (countryResult.data.metrics) {
              totalMetrics.lotsStockes += countryResult.data.metrics.lotsStockes || 0;
              totalMetrics.lotsAlerte += countryResult.data.metrics.lotsAlerte || 0;
              totalMetrics.lotsPerimes += countryResult.data.metrics.lotsPerimes || 0;
              totalMetrics.entrepotsActifs += countryResult.data.metrics.entrepotsActifs || 0;
            }
            
            // Ajouter les données par pays
            if (countryResult.data.summaryByCountry) {
              allSummaryByCountry = allSummaryByCountry.concat(countryResult.data.summaryByCountry);
            }
          }
        });
        
        setData({
          metrics: totalMetrics,
          summaryByCountry: allSummaryByCountry
        });
        
      } else {
        // Mode normal : appeler l'API du pays actuel
        const summaryResponse = await multiCountryApiService.getDashboardSummary();
        
        if (summaryResponse.success) {
          setData(summaryResponse.data);
        } else {
          console.warn('Dashboard API non disponible:', summaryResponse.error);
          setData({
            metrics: { lotsStockes: 0, lotsAlerte: 0, lotsPerimes: 0, entrepotsActifs: 0 },
            summaryByCountry: []
          });
        }
      }
      
      // Récupérer les alertes (uniquement si pas en supervision pour éviter les appels multiples)
      if (!isSupervision()) {
        let alertsResponse;
        try {
          alertsResponse = await multiCountryApiService.getRecentAlerts();
          if (alertsResponse.success) {
            setRecentAlerts(alertsResponse.data || []);
          } else {
            console.warn('Alertes API non disponible:', alertsResponse.error);
            setRecentAlerts([]);
          }
        } catch (alertsError) {
          console.warn('Erreur lors de la récupération des alertes:', alertsError);
          setRecentAlerts([]);
        }
      } else {
        setRecentAlerts([]); // Pas d'alertes en mode supervision
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setData({
        metrics: { lotsStockes: 0, lotsAlerte: 0, lotsPerimes: 0, entrepotsActifs: 0 },
        summaryByCountry: []
      });
      setRecentAlerts([]);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
  
  // Définir la fonction fetchData pour le callback de CountryTabs
  (window as any).fetchDashboardData = fetchData;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>);
  }

  // Determine global status
  let globalStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
  let globalMessage =
  t('dashboard.allSystemsOperational');
  if (data?.metrics.lotsPerimes > 0) {
    globalStatus = 'critical';
    globalMessage = t('dashboard.criticalAlert', { count: data.metrics.lotsPerimes });
  } else if (data?.metrics.lotsAlerte > 0) {
    globalStatus = 'warning';
    globalMessage = t('dashboard.warningAlert', { count: data.metrics.lotsAlerte });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-coffee-dark">
          {t('dashboard.globalSupervision')}
        </h1>
      </div>

      <CountryTabs />

      <AlertBanner status={globalStatus} message={globalMessage} />

      {/* Messages d'information pour les APIs en mode supervision */}
      {isSupervision() && multiCountryData && (
        <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6">
          <h2 className="text-lg font-bold text-coffee-dark mb-4">
            Statut de connexion aux APIs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {multiCountryData.countries.map((countryResult: any) => (
              <div
                key={countryResult.country.code}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  countryResult.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {countryResult.status === 'success' ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600" />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-coffee-dark">
                      {countryResult.country.flag} {countryResult.country.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        countryResult.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {countryResult.status === 'success' ? 'Connecté' : 'Hors ligne'}
                    </span>
                  </div>
                  {countryResult.status === 'error' && (
                    <p className="text-xs text-gray-600 mt-1">
                      {countryResult.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                {multiCountryData.successfulCountries} / {multiCountryData.totalCountries}
              </span>{' '}
              pays connectés
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('dashboard.storedLots')}
          value={data?.metrics.lotsStockes || 0}
          icon={Package}
          colorClass="text-accent-primary" />
        
        <MetricCard
          title={t('dashboard.lotsInAlert')}
          value={data?.metrics.lotsAlerte || 0}
          icon={AlertTriangle}
          colorClass="text-status-warning" />
        
        <MetricCard
          title={t('dashboard.expiredLots')}
          value={data?.metrics.lotsPerimes || 0}
          icon={Clock}
          colorClass="text-status-danger" />
        
        <MetricCard
          title={t('dashboard.activeWarehouses')}
          value={data?.metrics.entrepotsActifs || 0}
          icon={Building2}
          colorClass="text-coffee-medium" />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table by Country */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-coffee-dark">
              {t('dashboard.distributionByCountry')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">{t('countries.countryName')}</th>
                  <th className="p-4 font-medium">{t('countries.exploitationCount')}</th>
                  <th className="p-4 font-medium">{t('countries.warehouseCount')}</th>
                  <th className="p-4 font-medium">{t('lots.title')}</th>
                  <th className="p-4 font-medium">{t('dashboard.inAlert')}</th>
                  <th className="p-4 font-medium">{t('dashboard.lastMeasurement')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.summaryByCountry.map((row: any) =>
                <tr
                  key={row.pays.idPays}
                  onClick={() => navigate(`/pays/${row.pays.idPays}`)}
                  className="border-b border-gray-50 hover:bg-cream-bg cursor-pointer transition-colors">
                  
                    <td className="p-4 font-medium text-coffee-dark flex items-center">
                      {row.pays.nom}
                    </td>
                    <td className="p-4 text-gray-600">{row.nbExploitations}</td>
                    <td className="p-4 text-gray-600">{row.nbEntrepots}</td>
                    <td className="p-4 text-gray-600">{row.nbLots}</td>
                    <td className="p-4">
                      {row.lotsEnAlerte > 0 ?
                    <span className="text-status-warning font-medium">
                          {row.lotsEnAlerte}
                        </span> :

                    <span className="text-gray-400">0</span>
                    }
                    </td>
                    <td className="p-4 text-gray-500">
                      {row.derniereMesure ?
                    new Date(row.derniereMesure).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) :
                    '-'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-coffee-dark">
              {t('dashboard.recentAlerts')}
            </h2>
            <button
              onClick={() => navigate('/alertes')}
              className="text-sm text-accent-primary hover:underline">
              
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {recentAlerts.length > 0 ?
            <ul className="divide-y divide-gray-100">
                {recentAlerts.map((alerte) =>
              <li
                key={alerte.idAlerte}
                className="p-4 hover:bg-cream-bg transition-colors">
                
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-coffee-dark">
                        {alerte.nomEntrepot}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alerte.dateAlerte).toLocaleDateString(
                      'fr-FR'
                    )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                    className={`text-xs px-2 py-1 rounded-md ${alerte.type.includes('périmé') ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'}`}>
                    
                        {alerte.type}
                      </span>
                      <button
                    onClick={() =>
                    navigate(`/entrepot/${alerte.idEntrepot}`)
                    }
                    className="text-gray-400 hover:text-accent-primary">
                    
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </li>
              )}
              </ul> :

            <div className="p-6 text-center text-gray-500 text-sm">
                {t('dashboard.noRecentAlerts')}
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};