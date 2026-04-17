import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle } from
'lucide-react';
import { multiCountryApiService } from '../services/multi-country-api';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/StatusBadge';
import { CountryTabs } from '../components/CountryTabs';
import { TemperatureChart } from '../components/TemperatureChart';
import { HumidityChart } from '../components/HumidityChart';
import { useTranslation } from 'react-i18next';

export const LotDetail: React.FC = () => {
  const { t } = useTranslation();
  const { idLotGrains } = useParams<{
    idLotGrains: string;
  }>();
  const navigate = useNavigate();
  const [lot, setLot] = useState<any>(null);
  const [mesures, setMesures] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingOut, setIsMarkingOut] = useState(false);

  useEffect(() => {
    // Initialiser le service depuis localStorage
    multiCountryApiService.initFromStorage();
    
    if (!idLotGrains) return;
    const fetchData = async () => {
      try {
        // APPEL API : GET /api/lots/:id — Récupère les infos du lot (datSto, statut, datSortie, entrepôt, exploitation, pays)
        const lotData = await multiCountryApiService.getLot(idLotGrains);
        if (lotData.data) {
          // Déterminer la période du lot : de la date d'entrée à la date de sortie (ou aujourd'hui si pas sorti)
          const startDate = lotData.data.datSto;
          const endDate = lotData.data.datSortie || new Date().toISOString();
          
          const [mesData, alertesData] = await Promise.all([
          // APPEL API : GET /api/entrepot/:idEntrepot/mesures?from=datSto&to=datSortie - Mesures température/humidité sur la période du lot
          multiCountryApiService.getEntrepotMeasures(lotData.data.idEntrepot, 30), // Utilise l'API standard avec période
          // APPEL API : GET /api/lots/:id/alertes - Historique des alertes liées à ce lot
          multiCountryApiService.getLotAlerts(idLotGrains)]
          );
          
          // Filtrer les mesures pour ne garder que celles dans la période du lot
          const filteredMesures = (mesData.data || []).filter((mesure: any) => {
            const mesureDate = new Date(mesure.datMesure);
            const lotStartDate = new Date(startDate);
            const lotEndDate = new Date(endDate);
            return mesureDate >= lotStartDate && mesureDate <= lotEndDate;
          });
          setLot(lotData.data);
          setMesures(filteredMesures);
          setAlertes(alertesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching lot data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idLotGrains]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>);

  }
  if (!lot) return <div>{t('lots.lotNotFound')}</div>;
  const ageDays = Math.floor(
    (new Date().getTime() - new Date(lot.datSto).getTime()) / (
    1000 * 60 * 60 * 24)
  );
  const pays = lot.pays;
  const chartDataTemp = mesures.map((m) => ({
    date: m.datMesure,
    value: m.temperature
  }));
  const chartDataHum = mesures.map((m) => ({
    date: m.datMesure,
    value: m.humidite
  }));
  const handleMarkOut = async () => {
    setIsMarkingOut(true);
    
    try {
      const updateData = {
        datSortie: new Date().toISOString(),
        statut: 'Vendu'
      };
      
      console.log('Envoi de la mise à jour du lot:', idLotGrains, updateData);
      
      // Appel API pour mettre à jour le lot avec la date de sortie
      const response = await multiCountryApiService.updateLot(idLotGrains!, updateData);
      
      console.log('Réponse de l\'API:', response);
      
      if (response.success && response.data) {
        // Mettre à jour le lot avec les nouvelles données
        setLot({
          ...lot,
          datSortie: new Date().toISOString(),
          statut: 'Vendu'
        });
        console.log('Lot mis à jour localement avec succès');
      } else {
        console.error('Erreur lors de la mise à jour du lot:', response.error);
      }
    } catch (error) {
      console.error('Erreur lors du marquage du lot comme sorti:', error);
    } finally {
      setIsMarkingOut(false);
    }
  };
  return (
    <div className="space-y-6">
      <CountryTabs />
      
      <Breadcrumb
        items={[
        {
          label: pays.nom,
          path: `/pays/${pays.idPays}`
        },
        {
          label: lot.exploitation.nom,
          path: `/exploitation/${lot.exploitation.idExploitation}`
        },
        {
          label: lot.entrepot.nom,
          path: `/entrepot/${lot.entrepot.idEntrepot}`
        },
        {
          label: `Lot #${lot.idLotGrains}`
        }]
        } />
      

      {/* Alerts for age */}
      {ageDays > 365 && !lot.datSortie &&
      <div className="bg-status-danger text-white p-4 rounded-lg flex items-center shadow-md">
          <AlertTriangle className="mr-3" />
          <div>
            <h3 className="font-bold">{t('lots.expiredLot')}</h3>
            <p className="text-sm opacity-90">
              {t('lots.expiredLotDescription', { days: ageDays })}
            </p>
          </div>
        </div>
      }
      {ageDays > 300 && ageDays <= 365 && !lot.datSortie &&
      <div className="bg-status-warning text-white p-4 rounded-lg flex items-center shadow-md">
          <AlertTriangle className="mr-3" />
          <div>
            <h3 className="font-bold">{t('lots.nearExpiration')}</h3>
            <p className="text-sm opacity-90">
              {t('lots.nearExpirationDescription', { ageDays, daysUntilExpiration: 365 - ageDays })}
            </p>
          </div>
        </div>
      }

      {/* Lot Header */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <div className="bg-cream-bg p-4 rounded-xl mr-4">
            <Package className="w-8 h-8 text-coffee-medium" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-coffee-dark">
              Lot {lot.idLotGrains}
            </h1>
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> {t('lots.storedOn')}{' '}
                {new Date(lot.datSto).toLocaleDateString('fr-FR')}
              </span>
              <span>•</span>
              <span>{ageDays} {t('lots.storageDays')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-3">
          <StatusBadge status={lot.statut} className="text-sm px-3 py-1" />

          {!lot.datSortie ?
          <button
            onClick={handleMarkOut}
            disabled={isMarkingOut}
            className="flex items-center px-4 py-2 bg-coffee-dark hover:bg-coffee-medium text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-70">
            
              {isMarkingOut ?
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

            <CheckCircle className="w-4 h-4 mr-2" />
            }
              {t('lots.markAsOut')}
            </button> :

          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
              {t('lots.outOn')} {new Date(lot.datSortie).toLocaleDateString('fr-FR')}
            </div>
          }
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6">
        <h2 className="text-lg font-bold text-coffee-dark mb-6">
          {t('lots.storageConditionHistory')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TemperatureChart
            data={chartDataTemp}
            minThreshold={pays.temperatureMin}
            maxThreshold={pays.temperatureMax} />
          
          <HumidityChart
            data={chartDataHum}
            minThreshold={pays.humiditeMin}
            maxThreshold={pays.humiditeMax} />
          
        </div>
      </div>

      {/* Alerts History */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-coffee-dark">
            {t('lots.relatedAlerts')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
                <th className="p-4 font-medium">{t('alerts.date')}</th>
                <th className="p-4 font-medium">{t('alerts.alertType')}</th>
                <th className="p-4 font-medium">{t('alerts.measuredValue')}</th>
                <th className="p-4 font-medium">{t('alerts.status')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {alertes.map((alerte) =>
              <tr key={alerte.idAlerte} className="border-b border-gray-50">
                <td className="p-4 text-gray-600">
                  {new Date(alerte.dateAlerte).toLocaleString('fr-FR')}
                </td>
                <td className="p-4 font-medium text-coffee-dark">
                  {alerte.type}
                </td>
                <td className="p-4 text-gray-600">
                  {alerte.valeurMesuree ? (
                    <span className="text-status-danger font-medium">
                      {alerte.valeurMesuree}{' '}
                      {alerte.type.includes('Température') ? '°C' : '%'}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-4">
                  <StatusBadge status={alerte.statut} />
                </td>
              </tr>
              )}
              {alertes.length === 0 &&
              <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Aucune alerte enregistrée pour ce lot.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};