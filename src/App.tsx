import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';


import { Dashboard } from './pages/Dashboard';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
        
            <Route index element={<Dashboard />} />
           
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>);

}