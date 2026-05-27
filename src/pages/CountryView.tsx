import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Thermometer,
  Droplets,
  MapPin,
  ChevronRight,
  Plus,
  X,
  Tractor,
} from 'lucide-react';
import { multiCountryApiService } from '../services/multi-country-api';
import { Breadcrumb } from '../components/Breadcrumb';
import { TemperatureChart } from '../components/TemperatureChart';
import { StatusBadge } from '../components/StatusBadge';
import { CountryTabs } from '../components/CountryTabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const CountryView: React.FC = () => {
  const { t } = useTranslation();
  const { idPays } = useParams<{
    idPays: string;
  }>();
  const navigate = useNavigate();
  const [pays, setPays] = useState<any>(null);
  const [exploitations, setExploitations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newExploitation, setNewExploitation] = useState({ nom: '' });

  useEffect(() => {
    multiCountryApiService.initFromStorage();
    
    if (!idPays) return;
    const fetchData = async () => {
      try {
        const [paysData, expsData, historyData] = await Promise.all([
          multiCountryApiService.getCountry(idPays),
          multiCountryApiService.getCountryExploitations(idPays),
          multiCountryApiService.getCountryMeasureHistory(idPays),
        ]);
        setPays(paysData.data);
        setExploitations(expsData.data || []);
        setHistory(historyData.data || []);
      } catch (error) {
        console.error('Error fetching country data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idPays]);

  const handleAddExploitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await multiCountryApiService.createExploitation({
        nom: newExploitation.nom,
        idPays: idPays!,
      });

      if (response.success && response.data) {
        const expsData = await multiCountryApiService.getCountryExploitations(idPays!);
        setExploitations(expsData.data || []);

        setIsModalOpen(false);
        setNewExploitation({ nom: '' });
      } else {
        console.error('Erreur lors de la création de l\'exploitation:', response.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'exploitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  if (!pays) return <div>{t('countries.countryNotFound')}</div>;

  const chartData = history
    .map((h) => ({
      date: h.date,
      value: h.avgTemp ? Number(h.avgTemp.toFixed(1)) : null,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      <CountryTabs />
      
      <Breadcrumb items={[{ label: pays.nom }]} />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-coffee-dark flex items-center">
            <MapPin className="mr-3 text-accent-primary" size={32} />
            {pays.nom}
          </h1>
          <p className="text-coffee-medium mt-2">{t('countries.overview')}</p>
        </div>
      </div>

      {/* Plages Idéales */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 flex flex-wrap gap-8">
        <div>
          <h3 className="text-sm font-semibold text-coffee-light uppercase tracking-wider mb-3">
            {t('countries.idealRanges')}
          </h3>
          <div className="flex space-x-8">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg mr-3">
                <Thermometer className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('countries.temperature')}</p>
                <p className="font-medium text-coffee-dark">
                  {pays.temperatureMin}°C - {pays.temperatureMax}°C
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Droplets className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('countries.humidity')}</p>
                <p className="font-medium text-coffee-dark">
                  {pays.humiditeMin}% - {pays.humiditeMax}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exploitations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-coffee-dark">
              {t('exploitations.title')} ({exploitations.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>{t('exploitations.newExploitation') || 'Nouvelle exploitation'}</span>
            </button>
          </div>

          {exploitations.map((exp, index) => (
            <motion.div
              key={exp.idExploitation}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/exploitation/${exp.idExploitation}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-accent-primary/30 cursor-pointer transition-all flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-coffee-dark">{exp.nom}</h3>
                <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                  <span>{exp.nbEntrepots} {t('warehouses.title')}</span>
                  <span>•</span>
                  <span>{exp.nbLots} {t('lots.stored')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge status={exp.statutGlobal} />
                <ChevronRight className="text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-coffee-dark mb-4">
            {t('countries.avgTemp7Days')}
          </h2>
          <TemperatureChart
            data={chartData}
            minThreshold={pays.temperatureMin}
            maxThreshold={pays.temperatureMax}
            title=""
          />
        </div>
      </div>

      {/* Modal Nouvelle Exploitation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-coffee-dark/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-coffee-dark">
                  Nouvelle exploitation
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-coffee-dark transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddExploitation} className="p-6">
                <div className="mb-6">
                  <label htmlFor="nomExploitation" className="block text-sm font-medium text-coffee-dark mb-2">
                    Nom de l'exploitation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tractor className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nomExploitation"
                      required
                      value={newExploitation.nom}
                      onChange={(e) => setNewExploitation({ nom: e.target.value })}
                      placeholder="Ex: Ferme du Soleil"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-primary focus:border-accent-primary sm:text-sm text-coffee-dark"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Le pays actuel ({pays?.nom}) sera automatiquement assigné.
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
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Ajouter l'exploitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
