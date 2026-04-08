import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-cream-bg flex">
    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} /> 

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-coffee-dark p-2 rounded-md hover:bg-cream-bg">
            
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-coffee-dark text-lg">
            FutureKawa
          </span>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

};