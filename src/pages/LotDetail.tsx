import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { multiCountryApiService } from '../services/multi-country-api';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/StatusBadge';
import { CountryTabs } from '../components/CountryTabs';
import { TemperatureChart } from '../components/TemperatureChart';
import { HumidityChart } from '../components/HumidityChart';
import { useTranslation } from 'react-i18next';

export const LotDetail: React.FC = () => {
  const { t } = useTranslation();
  const { idLotGrains } = useParams<{ idLotGrains: string }>();
  const navigate = useNavigate();

  const [lot, setLot] = useState<any>(null);
  const [mesures, setMesures] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingOut, setIsMarkingOut] = useState(false);

  useEffect(() => {
    multiCountryApiService.initFromStorage();

    if (!idLotGrains) return;

    const fetchData = async () => {
      try {
        const lotData = await multiCountryApiService.getLot(idLotGrains);

        if (!lotData.data) return;

        const startDate = lotData.data.datSto;
        const endDate = lotData.data.datSortie || new Date().toISOString();

        const [mesData, alertesData] = await Promise.all([
          multiCountryApiService.getEntrepotMeasures(lotData.data.idEntrepot, 30),
          multiCountryApiService.getLotAlerts(idLotGrains)
        ]);

        const filteredMesures = (mesData.data || []).filter((m: any) => {
          const d = new Date(m.datMesure);
          return d >= new Date(startDate) && d <= new Date(endDate);
        });

        // =========================
        // 🔥 ALERTES MAPPING CLEAN
        // =========================
        const pays = lotData.data.pays;

        const mappedAlertes = (alertesData.data || []).map((a: any) => {
          const mesure = a.mesure;

          if (!mesure) {
            return {
              idAlerte: a.idAlerte,
              dateAlerte: null,
              type: 'Inconnue',
              valeurMesuree: null,
              statut: 'UNKNOWN'
            };
          }

          const temp = mesure.temperature;
          const hum = mesure.humidite;

          const isTempAlert =
            temp != null &&
            (temp < pays.temperatureMin || temp > pays.temperatureMax);

          const isHumAlert =
            hum != null &&
            (hum < pays.humiditeMin || hum > pays.humiditeMax);

          let type = 'Alerte inconnue';
          let valeurMesuree = null;

          if (isTempAlert) {
            type = 'Température';
            valeurMesuree = temp;
          } else if (isHumAlert) {
            type = 'Humidité';
            valeurMesuree = hum;
          }

          return {
            idAlerte: a.idAlerte,
            dateAlerte: mesure.datMesure,
            type,
            valeurMesuree,
            statut: 'ACTIVE'
          };
        });

        setLot(lotData.data);
        setMesures(filteredMesures);
        setAlertes(mappedAlertes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idLotGrains]);

  const handleMarkOut = async () => {
    setIsMarkingOut(true);

    try {
      const updateData = {
        datSortie: new Date().toISOString(),
        statut: 'Vendu'
      };

      const response = await multiCountryApiService.updateLot(
        idLotGrains!,
        updateData
      );

      if (response.success) {
        setLot((prev: any) => ({
          ...prev,
          ...updateData
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarkingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  if (!lot) return <div>{t('lots.lotNotFound')}</div>;

  const ageDays = Math.floor(
    (Date.now() - new Date(lot.datSto).getTime()) / (1000 * 60 * 60 * 24)
  );

  const chartDataTemp = mesures.map((m) => ({
    date: m.datMesure,
    value: m.temperature
  }));

  const chartDataHum = mesures.map((m) => ({
    date: m.datMesure,
    value: m.humidite
  }));

  return (
    <div className="space-y-6">
      <CountryTabs />

      {/* ================= BREADCRUMB ================= */}
      <Breadcrumb
        items={[
          {
            label: lot.pays.nom,
            path: `/pays/${lot.pays.idPays}`
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
          }
        ]}
      />

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl shadow-card p-6 flex justify-between">
        <div className="flex items-center">
          <Package className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">
              Lot {lot.idLotGrains}
            </h1>
            <p className="text-sm text-gray-500">
              {ageDays} jours de stockage
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={lot.statut} />

          {!lot.datSortie ? (
            <button
              onClick={handleMarkOut}
              disabled={isMarkingOut}
              className="px-4 py-2 bg-black text-white rounded"
            >
              {isMarkingOut ? '...' : 'Marquer sorti'}
            </button>
          ) : (
            <span className="text-sm text-gray-500">
              Sorti le {new Date(lot.datSortie).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

    {!lot.datSortie && ageDays > 365 && (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
    <p className="text-sm font-medium">
      Ce lot est stocké depuis {ageDays} jours (plus d'un an) et est considéré comme périmé.
    </p>
  </div>
)}
  {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-2 gap-6">
        <TemperatureChart
          data={chartDataTemp}
          minThreshold={lot.pays.temperatureMin}
          maxThreshold={lot.pays.temperatureMax}
        />

        <HumidityChart
          data={chartDataHum}
          minThreshold={lot.pays.humiditeMin}
          maxThreshold={lot.pays.humiditeMax}
        />
      </div>
      {/* ================= ALERTES TABLE ================= */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="font-bold mb-4">Alertes</h2>

        <table className="w-full table-fixed text-left border-collapse">
          <thead>
  <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
    <th className="p-4 font-medium w-1/3">Date</th>
    <th className="p-4 font-medium w-1/4">Type</th>
    <th className="p-4 font-medium w-1/4">Valeur</th>
    <th className="p-4 font-medium w-1/6">Status</th>
  </tr>
</thead>

          <tbody className="text-sm">
  {alertes.map((a: any) => (
    <tr key={a.idAlerte} className="border-b border-gray-50">
      
      <td className="p-4 align-top">
        {a.dateAlerte
          ? new Date(a.dateAlerte).toLocaleString('fr-FR')
          : '-'}
      </td>

      <td className="p-4 align-top">
        {a.type}
      </td>

      <td className="p-4 align-top">
        {a.valeurMesuree ?? '-'}
      </td>

      <td className="p-4 align-top">
        <StatusBadge status={a.statut} />
      </td>

    </tr>
  ))}
</tbody>
        </table>
      </div>

    
    </div>
  );
};