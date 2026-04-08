import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Thermometer,
  Droplets,
  MapPin,
  ChevronRight } from
'lucide-react';
import { api } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';
import { TemperatureChart } from '../components/TemperatureChart';
import { StatusBadge } from '../components/StatusBadge';
import { motion } from 'framer-motion';
export const CountryView: React.FC = () => {
  const { idPays } = useParams<{
    idPays: string;
  }>();
  const navigate = useNavigate();
  const [pays, setPays] = useState<any>(null);
  const [exploitations, setExploitations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!idPays) return;
    const fetchData = async () => {
      try {
        const [paysData, expsData, historyData] = await Promise.all([
        // 🔌 APPEL API : GET /api/pays/:id — Récupère les infos du pays (nom, plages température/humidité)
        api.getPays(idPays),
        // 🔌 APPEL API : GET /api/pays/:id/exploitations — Liste des exploitations du pays avec nb entrepôts, nb lots, statut global
        api.getPaysExploitations(idPays),
        // 🔌 APPEL API : GET /api/pays/:id/mesures/history — Historique température moyenne des 7 derniers jours pour ce pays
        api.getPaysMeasureHistory(idPays)]
        );
        setPays(paysData);
        setExploitations(expsData);
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching country data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idPays]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>);

  }
  if (!pays) return <div>Pays non trouvé</div>;
  const chartData = history.
  map((h) => ({
    date: h.date,
    value: h.avgTemp ? Number(h.avgTemp.toFixed(1)) : null
  })).
  reverse(); // Oldest to newest
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
        {
          label: pays.nom
        }]
        } />
      

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-coffee-dark flex items-center">
            <MapPin className="mr-3 text-accent-primary" size={32} />
            {pays.nom}
          </h1>
          <p className="text-coffee-medium mt-2">
            Vue d'ensemble des exploitations et conditions de stockage
          </p>
        </div>
      </div>

      {/* Plages Idéales */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 p-6 flex flex-wrap gap-8">
        <div>
          <h3 className="text-sm font-semibold text-coffee-light uppercase tracking-wider mb-3">
            Plages Idéales
          </h3>
          <div className="flex space-x-8">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg mr-3">
                <Thermometer className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Température</p>
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
                <p className="text-xs text-gray-500">Humidité</p>
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
          <h2 className="text-xl font-bold text-coffee-dark mb-4">
            Exploitations ({exploitations.length})
          </h2>
          {exploitations.map((exp, index) =>
          <motion.div
            key={exp.idExploitation}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: index * 0.1
            }}
            onClick={() => navigate(`/exploitation/${exp.idExploitation}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-accent-primary/30 cursor-pointer transition-all flex items-center justify-between">
            
              <div>
                <h3 className="text-lg font-bold text-coffee-dark">
                  {exp.nom}
                </h3>
                <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                  <span>{exp.nbEntrepots} entrepôts</span>
                  <span>•</span>
                  <span>{exp.nbLots} lots stockés</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge status={exp.statutGlobal} />
                <ChevronRight className="text-gray-400" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-coffee-dark mb-4">
            Moyenne Température (7j)
          </h2>
          <TemperatureChart
            data={chartData}
            minThreshold={pays.temperatureMin}
            maxThreshold={pays.temperatureMax}
            title="" />
          
        </div>
      </div>
    </div>);

};