import React, { useState } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import { Sidebar } from './components/Sidebar';
import { Availability } from './pages/Availability'; // Kept for legacy if needed, but Planning replaces it functionally
import { Wishlist } from './pages/Wishlist';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRooms } from './pages/AdminRooms';
import { AdminUsers } from './pages/AdminUsers';
import { UserConfirmations } from './pages/UserConfirmations';
import { ScheduleView } from './pages/ScheduleView';
import { Planning } from './pages/Planning';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard'); // Changed default to dashboard
  const { currentUser } = useData();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        // FIX: If user is ADMIN, show the Admin Dashboard component immediately
        if (currentUser.role === UserRole.ADMIN) {
          return <AdminDashboard />;
        }

        // For Investors and Issuers, show the welcome message
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Bienvenue, {currentUser.name}</h1>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-lg text-slate-700 mb-4">
                Vous êtes connecté en tant que <span className="font-bold text-blue-600">{currentUser.role === UserRole.INVESTOR ? 'Investisseur' : 'Émetteur'}</span>.
              </p>
              <p className="text-slate-500 mb-6">
                Utilisez le menu latéral pour naviguer dans l'application. 
                {currentUser.role === UserRole.INVESTOR && " Proposez des rendez-vous directement depuis le Planning."}
                {currentUser.role === UserRole.ISSUER && " Consultez votre planning pour valider les demandes reçues."}
              </p>
              <div className="flex space-x-4">
                 <button onClick={() => setCurrentPage('planning')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-semibold">
                    Accéder au Planning
                 </button>
                 <button onClick={() => setCurrentPage('confirmations')} className="px-6 py-3 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-sm font-semibold">
                    Voir mes RDV Validés
                 </button>
              </div>
            </div>
          </div>
        );
      case 'availability':
        return <Availability />;
      case 'planning':
        return <Planning />;
      case 'wishlist':
        return <Wishlist />;
      case 'confirmations':
        return <UserConfirmations />;
      case 'admin':
        return currentUser.role === UserRole.ADMIN ? <AdminDashboard /> : <div>Accès refusé</div>;
      case 'rooms':
        return currentUser.role === UserRole.ADMIN ? <AdminRooms /> : <div>Accès refusé</div>;
      case 'users':
        return currentUser.role === UserRole.ADMIN ? <AdminUsers /> : <div>Accès refusé</div>;
      case 'schedule':
        return currentUser.role === UserRole.ADMIN ? <ScheduleView personalOnly={false} /> : <div>Accès refusé</div>;
      case 'myschedule':
         return <ScheduleView personalOnly={true} />;
      default:
        return <div>Page introuvable</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;