import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CountryView } from './pages/CountryView';
import { ExploitationView } from './pages/ExploitationView';
import { WarehouseView } from './pages/WarehouseView';
import { LotDetail } from './pages/LotDetail';
import { Alerts } from './pages/Alerts';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
           <Route path="pays/:idPays" element={<CountryView />} />
          <Route
              path="exploitation/:idExploitation"
              element={<ExploitationView />} />
              <Route path="entrepot/:idEntrepot" element={<WarehouseView />} />
              <Route path="lot/:idLotGrains" element={<LotDetail />} />
              <Route path="alertes" element={<Alerts />} />
        </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>);

}