import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  Bell,
  LogOut,
  Menu,
  X,
  Coffee,
  Settings } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, user, selectedCountry } = useAuth();
  const navigate = useNavigate();
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // 🔌 APPEL API : GET /api/alertes — Récupère toutes les alertes pour compter celles en cours (badge sidebar)
        const allAlerts = await api.getAllAlerts();
        setActiveAlertsCount(
          allAlerts.filter((a) => a.statut === 'en cours').length
        );
      } catch (error) {
        console.error('Failed to fetch alerts count', error);
      }
    };
    fetchAlerts();
    // In a real app, we might poll this or use websockets
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fonction helper pour convertir le nom du pays en ID
  const getCountryId = (countryName: string): number => {
    const countryIds: { [key: string]: number } = {
      'Brésil': 1,
      'Équateur': 2,
      'Colombie': 3
    };
    return countryIds[countryName] || 0;
  };

  const navItems = [
  // Dashboard et Paramètres seulement en mode supervision
  ...(selectedCountry === 'Supervision' ? [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home
    }
  ] : []),
  
  // Pays sélectionné ou tous les pays en supervision
  ...(selectedCountry === 'Supervision' ? [
    {
      path: '/pays/1',
      label: 'Brésil',
      icon: MapPin
    },
    {
      path: '/pays/2',
      label: 'Équateur',
      icon: MapPin
    },
    {
      path: '/pays/3',
      label: 'Colombie',
      icon: MapPin
    }
  ] : selectedCountry && selectedCountry !== 'Supervision' ? [
    {
      path: `/pays/${getCountryId(selectedCountry)}`,
      label: selectedCountry,
      icon: MapPin
    }
  ] : []),
  
  // Alertes toujours visibles
  {
    path: '/alertes',
    label: 'Alertes',
    icon: Bell,
    badge: activeAlertsCount
  },
  
  // Paramètres seulement en supervision
  ...(selectedCountry === 'Supervision' ? [
    {
      path: '/parametres',
      label: 'Paramètres',
      icon: Settings
    }
  ] : [])
];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-coffee-dark/50 z-40 lg:hidden"
        onClick={() => setIsOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-coffee-dark text-cream-bg transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        
        <div className="flex items-center justify-between p-6 border-b border-coffee-medium">
          <div className="flex items-center space-x-3">
            <div className="bg-accent-primary p-2 rounded-lg">
              <Coffee className="w-6 h-6 text-cream-bg" />
            </div>
            <span className="text-xl font-bold tracking-wide">FutureKawa</span>
          </div>
          <button
            className="lg:hidden text-cream-bg"
            onClick={() => setIsOpen(false)}>
            
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-coffee-light uppercase tracking-wider font-semibold mb-4">
            Navigation
          </p>
          <nav className="space-y-2">
            {navItems.map((item) =>
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-accent-primary text-white' : 'hover:bg-coffee-medium text-cream-bg/80 hover:text-white'}
                `}>
              
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 &&
              <span className="bg-status-danger text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
              }
              </NavLink>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-coffee-medium">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-coffee-medium flex items-center justify-center text-lg font-bold">
              {user?.prenom.charAt(0)}
              {user?.nom.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-coffee-light truncate w-32">
                {user?.mail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-coffee-light hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-coffee-medium">
            
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>);

};