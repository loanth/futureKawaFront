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

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
           <Route path="pays/:idPays" element={<CountryView />} />
          
        </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>);

}