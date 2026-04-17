import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  Bell,
  LogOut,
  X,
  Coffee } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { multiCountryApiService } from '../services/multi-country-api';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_CONFIG } from '../config/country-config';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  countryCode?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { logout, user, isSupervision } = useAuth();
  const navigate = useNavigate();
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [currentCountryConfig, setCurrentCountryConfig] = useState(multiCountryApiService.getCurrentCountryConfig());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // En mode supervision, ne pas chercher les alertes spécifiques à un pays
        if (isSupervision()) {
          setActiveAlertsCount(0);
          return;
        }

        // 🔌 APPEL API : GET /api/alertes — Récupère toutes les alertes pour compter celles en cours (badge sidebar)
        const allAlerts = await multiCountryApiService.getAllAlerts();
        setActiveAlertsCount(
          allAlerts.data?.filter((a: any) => a.statut === 'en cours').length || 0
        );
      } catch (error) {
        console.error('Failed to fetch alerts count', error);
        setActiveAlertsCount(0);
      }
    };
    fetchAlerts();
    // In a real app, we might poll this or use websockets
  }, [isSupervision]);

  // Écouter les changements de pays
  useEffect(() => {
    const handleCountryChange = () => {
      setCurrentCountryConfig(multiCountryApiService.getCurrentCountryConfig());
    };

    // Écouter l'événement personnalisé
    window.addEventListener('countryChanged', handleCountryChange);
    
    // Initialiser
    multiCountryApiService.initFromStorage();
    handleCountryChange();

    return () => {
      window.removeEventListener('countryChanged', handleCountryChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCountryClick = (countryCode: string, e: React.MouseEvent) => {
    console.log('handleCountryClick appelé avec countryCode:', countryCode, 'isSupervision:', isSupervision());
    
    // En mode supervision, changer le pays actif quand on clique
    if (isSupervision()) {
      console.log('Changement de pays vers:', countryCode);
      multiCountryApiService.setCurrentCountry(countryCode);
      localStorage.setItem('countryConfig', JSON.stringify(COUNTRIES_CONFIG.find(c => c.code === countryCode)));
      // Déclencher l'événement de changement de pays
      window.dispatchEvent(new CustomEvent('countryChanged', { detail: countryCode }));
      console.log('Pays changé, API actuelle:', multiCountryApiService.getCurrentCountry());
    } else {
      console.log('Pas en mode supervision, pas de changement de pays');
    }
  };

  const navItems: NavItem[] = [
  // Dashboard uniquement visible en mode supervision
  ...(isSupervision() ? [
    {
      path: '/',
      label: t('navigation.dashboard'),
      icon: Home
    }
  ] : []),
  
  // Pays : tous les pays en supervision, pays actuel en mode normal
  ...(isSupervision() 
    ? COUNTRIES_CONFIG.map(country => ({
        path: `/pays/${country.code}`,
        label: `${country.flag} ${country.name}`,
        icon: MapPin,
        countryCode: country.code,
        onClick: (e: React.MouseEvent) => handleCountryClick(country.code, e)
      }))
    : (currentCountryConfig ? [{
        path: `/pays/${currentCountryConfig.code}`,
        label: `${currentCountryConfig.flag} ${currentCountryConfig.name}`,
        icon: MapPin
      }] : [])
  ),
  
  // Alertes toujours visibles
  {
    path: '/alertes',
    label: t('navigation.alerts'),
    icon: Bell,
    badge: activeAlertsCount
  }
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
            {t('navigation.title')}
          </p>
          <nav className="space-y-2">
            {navItems.map((item) => {
            const handleClick = (e: React.MouseEvent) => {
              if (item.onClick) {
                item.onClick(e);
              }
              setIsOpen(false);
            };

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleClick}
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
            );
          })}
          </nav>
        </div>

        <div className="px-6 pb-4">
          <LanguageSwitcher />
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
            <span className="font-medium">{t('common.logout')}</span>
          </button>
        </div>
      </aside>
    </>);

};