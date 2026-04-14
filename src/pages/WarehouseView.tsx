import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Thermometer, Droplets, Calendar, X } from 'lucide-react';
import { api } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/StatusBadge';
import { TemperatureChart } from '../components/TemperatureChart';
import { HumidityChart } from '../components/HumidityChart';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const WarehouseView: React.FC = () => {
  const { t } = useTranslation();
  const { idEntrepot } = useParams<{
    idEntrepot: string;
  }>();
  const navigate = useNavigate();
  const [entrepot, setEntrepot] = useState<any>(null);
  const [mesures, setMesures] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(30); // days
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLotDate, setNewLotDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!idEntrepot) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [entData, mesData, lotsData] = await Promise.all([
        // 🔌 APPEL API : GET /api/entrepot/:id — Récupère les infos de l'entrepôt (nom, adresse, limiteQte, exploitation, pays)
        api.getEntrepot(idEntrepot),
        // 🔌 APPEL API : GET /api/entrepot/:id/mesures?periode=Xj — Récupère les mesures température/humidité sur la période sélectionnée
        api.getEntrepotMeasures(idEntrepot, period),
        // 🔌 APPEL API : GET /api/entrepot/:id/lots — Liste des lots stockés triés par datSto croissante (FIFO)
        api.getEntrepotLots(idEntrepot)]
        );
        setEntrepot(entData);
        setMesures(mesData);
        setLots(lotsData);
      } catch (error) {
        console.error('Error fetching warehouse data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idEntrepot, period]);
  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // 🔌 APPEL API : POST /api/entrepot/:id/lots — Créer un nouveau lot dans cet entrepôt (body: { datSto, idEntrepot })
    // TODO : Remplacer le setTimeout ci-dessous par un vrai appel API, puis rafraîchir la liste des lots
    setTimeout(() => {
      const newLot = {
        idLotGrains: `lot-${idEntrepot}-new-${Math.floor(Math.random() * 1000)}`,
        idEntrepot: idEntrepot,
        datSto: new Date(newLotDate).toISOString(),
        statut: 'conforme'
      };
      setLots([newLot, ...lots]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      // Reset form
      setNewLotDate(new Date().toISOString().split('T')[0]);
    }, 600);
  };
  if (loading && !entrepot) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>);

  }
  if (!entrepot) return <div>{t('warehouses.warehouseNotFound')}</div>;
  const latestMeasure = mesures.length > 0 ? mesures[mesures.length - 1] : null;
  const pays = entrepot.pays;
  const isTempAlert =
  latestMeasure && (
  latestMeasure.temperature < pays.temperatureMin ||
  latestMeasure.temperature > pays.temperatureMax);
  const isHumAlert =
  latestMeasure && (
  latestMeasure.humidite < pays.humiditeMin ||
  latestMeasure.humidite > pays.humiditeMax);
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
      <Breadcrumb
        items={[
        {
          label: pays.nom,
          path: `/pays/${pays.idPays}`
        },
        {
          label: entrepot.exploitation.nom,
          path: `/exploitation/${entrepot.exploitation.idExploitation}`
        },
        {
          label: entrepot.nom
        }]
        } />
      

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-card border border-coffee-light/10">
        <div>
          <h1 className="text-2xl font-bold text-coffee-dark">
            {entrepot.nom}
          </h1>
          <p className="text-gray-500 mt-1">{entrepot.adresse}</p>
          <div className="mt-2 text-sm">
            <span className="text-gray-500">{t('warehouses.capacity')}: </span>
            <span className="font-medium">
              {lots.length} / {entrepot.limiteQte} lots
            </span>
          </div>
        </div>

        {/* Real-time Indicators */}
        <div className="flex space-x-4">
          <div
            className={`p-4 rounded-lg border flex items-center space-x-3 ${isTempAlert ? 'bg-status-danger/10 border-status-danger/20' : 'bg-status-success/10 border-status-success/20'}`}>
            
            <Thermometer
              className={
              isTempAlert ? 'text-status-danger' : 'text-status-success'
              } />
            
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {t('countries.temperature')}
              </p>
              <p
                className={`text-xl font-bold ${isTempAlert ? 'text-status-danger' : 'text-status-success'}`}>
                
                {latestMeasure ? `${latestMeasure.temperature}°C` : '-'}
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border flex items-center space-x-3 ${isHumAlert ? 'bg-status-danger/10 border-status-danger/20' : 'bg-status-success/10 border-status-success/20'}`}>
            
            <Droplets
              className={
              isHumAlert ? 'text-status-danger' : 'text-status-success'
              } />
            
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {t('countries.humidity')}
              </p>
              <p
                className={`text-xl font-bold ${isHumAlert ? 'text-status-danger' : 'text-status-success'}`}>
                
                {latestMeasure ? `${latestMeasure.humidite}%` : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-coffee-dark">
            {t('warehouses.environmentalConditions')}
          </h2>
          <div className="flex space-x-2">
            {[7, 30, 90].map((days) =>
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${period === days ? 'bg-accent-primary text-white' : 'bg-cream-bg text-coffee-medium hover:bg-coffee-light/20'}`}>
              
                {days}j
              </button>
            )}
          </div>
        </div>

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

      {/* Lots Table */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-coffee-dark">
            {t('warehouses.lotInventory')} (FIFO)
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            
            <Plus size={16} />
            <span>{t('warehouses.newLot')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
                <th className="p-4 font-medium">{t('warehouses.lotId')}</th>
                <th className="p-4 font-medium">{t('warehouses.storageDate')}</th>
                <th className="p-4 font-medium">{t('warehouses.age')}</th>
                <th className="p-4 font-medium">{t('warehouses.status')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {lots.map((lot) => {
                const ageDays = Math.floor(
                  (new Date().getTime() - new Date(lot.datSto).getTime()) / (
                  1000 * 60 * 60 * 24)
                );
                return (
                  <tr
                    key={lot.idLotGrains}
                    onClick={() => navigate(`/lot/${lot.idLotGrains}`)}
                    className="border-b border-gray-50 hover:bg-cream-bg cursor-pointer transition-colors">
                    
                    <td className="p-4 font-medium text-coffee-dark">
                      {lot.idLotGrains}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(lot.datSto).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-gray-600">
                      <span
                        className={
                        ageDays > 300 ? 'text-status-danger font-medium' : ''
                        }>
                        
                        {ageDays} {t('warehouses.days')}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={lot.statut} />
                    </td>
                  </tr>);

              })}
              {lots.length === 0 &&
              <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    {t('warehouses.noLotsStored')}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau Lot */}
      <AnimatePresence>
        {isModalOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 bg-coffee-dark/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)} />
          
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-coffee-dark">
                  {t('warehouses.addNewLot')}
                </h3>
                <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-coffee-dark transition-colors">
                
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddLot} className="p-6">
                <div className="mb-6">
                  <label
                  htmlFor="dateStockage"
                  className="block text-sm font-medium text-coffee-dark mb-2">
                  
                    Date de stockage
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="date"
                    id="dateStockage"
                    required
                    value={newLotDate}
                    onChange={(e) => setNewLotDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-primary focus:border-accent-primary sm:text-sm text-coffee-dark" />
                  
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    L'entrepôt actuel ({entrepot.nom}) sera automatiquement
                    assigné.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-coffee-medium bg-cream-bg hover:bg-gray-100 rounded-lg transition-colors">
                  
                    Annuler
                  </button>
                  <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors disabled:opacity-70">
                  
                    {isSubmitting ?
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

                  <Plus className="w-4 h-4 mr-2" />
                  }
                    Ajouter le lot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

};