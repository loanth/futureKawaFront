import React, { useEffect, useState, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Filter, Download, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Filters
  const [filterPays, setFilterPays] = useState('');
  const [filterType, setFilterType] = useState('');
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        // 🔌 APPEL API : GET /api/alertes?pays=X&type=Y&from=Z&to=W — Récupère toutes les alertes avec filtres (pays, type, période)
        const data = await api.getAllAlerts({
          pays: filterPays || undefined,
          type: filterType || undefined
        });
        setAlertes(data);
      } catch (error) {
        console.error('Error fetching alerts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [filterPays, filterType]);
  const handleExportCSV = () => {
    // Simple CSV export simulation
    const headers = [
    'Date',
    'Pays',
    'Exploitation',
    'Entrepôt',
    'Type',
    'Valeur',
    'Statut'];

    const csvContent = [
    headers.join(','),
    ...alertes.map((a) =>
    [
    new Date(a.dateAlerte).toISOString(),
    a.nomPays,
    a.nomExploitation,
    a.nomEntrepot,
    a.type,
    a.valeurMesuree || '',
    a.statut].
    join(',')
    )].
    join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
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
          Gestion des Alertes
        </h1>

        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-white border border-coffee-light/20 text-coffee-dark rounded-lg hover:bg-cream-bg transition-colors text-sm font-medium shadow-sm">
          
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-coffee-light/10 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-coffee-medium mr-2">
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">Filtres :</span>
        </div>

        <select
          value={filterPays}
          onChange={(e) => setFilterPays(e.target.value)}
          className="bg-cream-bg border border-gray-200 text-coffee-dark text-sm rounded-lg focus:ring-accent-primary focus:border-accent-primary block p-2.5">
          
          <option value="">Tous les pays</option>
          <option value="1">Brésil</option>
          <option value="2">Équateur</option>
          <option value="3">Colombie</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-cream-bg border border-gray-200 text-coffee-dark text-sm rounded-lg focus:ring-accent-primary focus:border-accent-primary block p-2.5">
          
          <option value="">Tous les types</option>
          <option value="Température hors plage">Température hors plage</option>
          <option value="Humidité hors plage">Humidité hors plage</option>
          <option value="Lot périmé">Lot périmé</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card border border-coffee-light/10 overflow-hidden">
        {loading ?
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-bg/50 text-coffee-medium text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Localisation</th>
                  <th className="p-4 font-medium">Type d'alerte</th>
                  <th className="p-4 font-medium">Valeur</th>
                  <th className="p-4 font-medium">Statut</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {alertes.map((alerte) =>
              <tr
                key={alerte.idAlerte}
                className="border-b border-gray-50 hover:bg-cream-bg transition-colors">
                
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {new Date(alerte.dateAlerte).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-coffee-dark">
                        {alerte.nomEntrepot}
                      </div>
                      <div className="text-xs text-gray-500">
                        {alerte.nomPays} • {alerte.nomExploitation}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-coffee-dark">
                      {alerte.type}
                    </td>
                    <td className="p-4 text-gray-600">
                      {alerte.valeurMesuree ?
                  <span className="text-status-danger font-medium">
                          {alerte.valeurMesuree}{' '}
                          {alerte.type.includes('Température') ? '°C' : '%'}
                        </span> :

                  '-'
                  }
                    </td>
                    <td className="p-4">
                      <StatusBadge status={alerte.statut} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                    onClick={() =>
                    navigate(`/entrepot/${alerte.idEntrepot}`)
                    }
                    className="text-gray-400 hover:text-accent-primary p-2 rounded-full hover:bg-white transition-colors"
                    title="Voir l'entrepôt">
                    
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
              )}
                {alertes.length === 0 &&
              <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Aucune alerte trouvée pour ces critères.
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>);

};