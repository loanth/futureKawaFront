import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Clock,
  Building2,
  ChevronRight,
  Loader2 } from
'lucide-react';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { AlertBanner } from '../components/AlertBanner';
import { StatusBadge } from '../components/StatusBadge';
export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summary, alerts] = await Promise.all([
        // 🔌 APPEL API : GET /api/dashboard/summary — Récupère les métriques globales (lots stockés, en alerte, périmés, entrepôts actifs) et le résumé par pays
        api.getDashboardSummary(),
        // 🔌 APPEL API : GET /api/alertes/recent — Récupère les 5 dernières alertes déclenchées
        api.getRecentAlerts()]
        );
        setData(summary);
        setRecentAlerts(alerts);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>);

  }
  // Determine global status
  let globalStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
  let globalMessage =
  'Tous les systèmes sont opérationnels. Conditions de stockage optimales.';
  if (data?.metrics.lotsPerimes > 0) {
    globalStatus = 'critical';
    globalMessage = `Alerte Critique : ${data.metrics.lotsPerimes} lot(s) périmé(s) détecté(s). Action immédiate requise.`;
  } else if (data?.metrics.lotsAlerte > 0) {
    globalStatus = 'warning';
    globalMessage = `Attention : ${data.metrics.lotsAlerte} lot(s) en alerte de conditions de stockage.`;
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-coffee-dark">
          Supervision Globale
        </h1>
      </div>

      <AlertBanner status={globalStatus} message={globalMessage} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Lots Stockés"
          value={data?.metrics.lotsStockes || 0}
          icon={Package}
          colorClass="text-accent-primary" />
        
        <MetricCard
          title="Lots en Alerte"
          value={data?.metrics.lotsAlerte || 0}
          icon={AlertTriangle}
          colorClass="text-status-warning" />
        
        <MetricCard
          title="Lots Périmés"
          value={data?.metrics.lotsPerimes || 0}
          icon={Clock}
          colorClass="text-status-danger" />
        
        <MetricCard
          title="Entrepôts Actifs"
          value={data?.metrics.entrepotsActifs || 0}
          icon={Building2}
          colorClass="text-coffee-medium" />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table by Country */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-coffee-dark">
              Répartition par Pays
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Pays</th>
                  <th className="p-4 font-medium">Exploitations</th>
                  <th className="p-4 font-medium">Entrepôts</th>
                  <th className="p-4 font-medium">Lots</th>
                  <th className="p-4 font-medium">En Alerte</th>
                  <th className="p-4 font-medium">Dernière Mesure</th>
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
              Alertes Récentes
            </h2>
            <button
              onClick={() => navigate('/alertes')}
              className="text-sm text-accent-primary hover:underline">
              
              Voir tout
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
                Aucune alerte récente.
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};