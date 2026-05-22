import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Filter, Download, ChevronRight, Thermometer, Droplets } from 'lucide-react';
import { multiCountryApiService } from '../services/multi-country-api';
import { COUNTRIES_CONFIG } from '../config/country-config';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export const Alerts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSupervisor = user?.idPoste === 3;

  const storedCountry = (() => {
    const stored = localStorage.getItem('countryConfig');
    return stored ? JSON.parse(stored) : null;
  })();

  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPays, setFilterPays] = useState('');
  const [filterType, setFilterType] = useState('');

  // Helpers seuils
  const isTempHorsPlage = (mesure: any, seuils: any): boolean => {
    if (!seuils) return mesure.temperature > 30 || mesure.temperature < 10;
    return mesure.temperature > seuils.temperatureMax || mesure.temperature < seuils.temperatureMin;
  };

  const isHumidHorsPlage = (mesure: any, seuils: any): boolean => {
    if (!seuils) return mesure.humidite > 80 || mesure.humidite < 40;
    return mesure.humidite > seuils.humiditeMax || mesure.humidite < seuils.humiditeMin;
  };

  const isHorsPlage = (mesure: any, seuils: any): boolean =>
    isTempHorsPlage(mesure, seuils) || isHumidHorsPlage(mesure, seuils);

  const getAlertType = (mesure: any, seuils: any): { label: string; isTemp: boolean; isHumid: boolean } => {
    const tempKO = isTempHorsPlage(mesure, seuils);
    const humidKO = isHumidHorsPlage(mesure, seuils);
    if (tempKO && humidKO) return { label: 'Température & Humidité hors plage', isTemp: true, isHumid: true };
    if (tempKO) return { label: 'Température hors plage', isTemp: true, isHumid: false };
    if (humidKO) return { label: 'Humidité hors plage', isTemp: false, isHumid: true };
    return { label: 'Alerte', isTemp: false, isHumid: false };
  };

  useEffect(() => {
    multiCountryApiService.initFromStorage();
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        let allAlertes: any[] = [];

        if (isSupervisor) {
          const countriesToFetch = filterPays
            ? COUNTRIES_CONFIG.filter(c => c.code === filterPays)
            : COUNTRIES_CONFIG;

          for (const country of countriesToFetch) {
            const originalCountry = multiCountryApiService.getCurrentCountry();
            multiCountryApiService.setCurrentCountry(country.code);

            // Toujours tout fetcher, on filtre côté client
            const [alertesResponse, paysResponse] = await Promise.all([
              multiCountryApiService.getAllAlerts({}),
              multiCountryApiService.getCountry(country.code),
            ]);

            multiCountryApiService.setCurrentCountry(originalCountry);

            const seuils = paysResponse.data ?? null;

            if (alertesResponse.success && Array.isArray(alertesResponse.data)) {
              const enriched = alertesResponse.data
                .map((a: any) => ({ ...a, _country: country, _seuils: seuils }))
                .filter((a: any) => isHorsPlage(a.mesure, a._seuils));
              allAlertes = allAlertes.concat(enriched);
            }
          }
        } else {
          const [alertesResponse, paysResponse] = await Promise.all([
            multiCountryApiService.getAllAlerts({}),
            multiCountryApiService.getCountry(storedCountry?.id?.toString() ?? '1'),
          ]);

          const seuils = paysResponse.data ?? null;
          const raw = Array.isArray(alertesResponse.data) ? alertesResponse.data : [];
          allAlertes = raw
            .map((a: any) => ({ ...a, _seuils: seuils }))
            .filter((a: any) => isHorsPlage(a.mesure, a._seuils));
        }

        // Filtre type côté client — les doubles sont inclus dans les deux cas
        if (filterType) {
          allAlertes = allAlertes.filter((a) => {
            if (filterType === 'temperature') return isTempHorsPlage(a.mesure, a._seuils);
            if (filterType === 'humidite') return isHumidHorsPlage(a.mesure, a._seuils);
            return true;
          });
        }

        setAlertes(allAlertes);
      } catch (error) {
        console.error('Error fetching alerts', error);
        setAlertes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [filterPays, filterType, isSupervisor]);

  const handleExportCSV = () => {
    const headers = ['ID Alerte', 'Pays', 'Date mesure', 'ID Entrepôt', 'Température (°C)', 'Humidité (%)'];
    const csvContent = [
      headers.join(','),
      ...alertes.map((a) =>
        [
          a.idAlerte,
          a._country?.name || '',
          new Date(a.mesure.datMesure).toISOString(),
          a.mesure.idEntrepot,
          a.mesure.temperature,
          a.mesure.humidite,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'alertes_futurekawa.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-coffee-dark">
          {t('alerts.management')}
          {!isSupervisor && storedCountry && (
            <span className="ml-3 text-base font-normal text-coffee-medium">
              — {storedCountry.flag} {storedCountry.name}
            </span>
          )}
        </h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-white border border-coffee-light/20 text-coffee-dark rounded-lg hover:bg-cream-bg transition-colors text-sm font-medium shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          {t('common.export')} CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-coffee-light/10 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-coffee-medium mr-2">
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">{t('common.filter')}:</span>
        </div>

        {isSupervisor && (
          <select
            value={filterPays}
            onChange={(e) => setFilterPays(e.target.value)}
            className="bg-cream-bg border border-gray-200 text-coffee-dark text-sm rounded-lg focus:ring-accent-primary focus:border-accent-primary block p-2.5"
          >
            <option value="">{t('alerts.allCountries')}</option>
            {COUNTRIES_CONFIG.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-cream-bg border border-gray-200 text-coffee-dark text-sm rounded-lg focus:ring-accent-primary focus:border-accent-primary block p-2.5"
        >
          <option value="">{t('alerts.allTypes')}</option>
          <option value="temperature">Température hors plage</option>
          <option value="humidite">Humidité hors plage</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">{t('alerts.date')}</th>
                  <th className="p-4 font-medium">{t('warehouses.title')}</th>
                  {isSupervisor && <th className="p-4 font-medium">{t('countries.title')}</th>}
                  <th className="p-4 font-medium">{t('alerts.alertType')}</th>
                  <th className="p-4 font-medium">Température</th>
                  <th className="p-4 font-medium">Humidité</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {alertes.map((alerte) => {
                  const alertType = getAlertType(alerte.mesure, alerte._seuils);
                  return (
                    <tr
                      key={`${alerte._country?.code}-${alerte.idAlerte}`}
                      className="border-b border-gray-50 hover:bg-cream-bg transition-colors"
                    >
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(alerte.mesure.datMesure).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-coffee-dark">
                          Entrepôt #{alerte.mesure.idEntrepot}
                        </div>
                        <div className="text-xs text-gray-500">ID alerte : {alerte.idAlerte}</div>
                      </td>
                      {isSupervisor && (
                        <td className="p-4 text-gray-600 whitespace-nowrap">
                          {alerte._country?.flag} {alerte._country?.name}
                        </td>
                      )}
                      <td className="p-4 font-medium text-coffee-dark">{alertType.label}</td>
                      <td className="p-4">
                        <span className={`font-medium flex items-center gap-1 ${alertType.isTemp ? 'text-status-danger' : 'text-gray-600'}`}>
                          <Thermometer className="w-4 h-4" />
                          {alerte.mesure.temperature} °C
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium flex items-center gap-1 ${alertType.isHumid ? 'text-status-warning' : 'text-gray-600'}`}>
                          <Droplets className="w-4 h-4" />
                          {alerte.mesure.humidite} %
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/entrepot/${alerte.mesure.idEntrepot}`)}
                          className="text-gray-400 hover:text-accent-primary p-2 rounded-full hover:bg-white transition-colors"
                          title={t('alerts.viewWarehouse')}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {alertes.length === 0 && (
                  <tr>
                    <td colSpan={isSupervisor ? 7 : 6} className="p-8 text-center text-gray-500">
                      {t('alerts.noAlertsFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};