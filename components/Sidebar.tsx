import React from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole } from '../types';
import { Calendar, Users, LayoutDashboard, Settings, Briefcase, Play, Bell, MapPin, UserPlus, BookCheck } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { currentUser, users, setCurrentUser, getPendingRequestsCount, getConfirmedMeetingsCount } = useData();

  const navItemClass = (page: string) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
      activePage === page 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;
  
  const pendingCount = getPendingRequestsCount(currentUser.id);
  const confirmedCount = getConfirmedMeetingsCount(currentUser.id);

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">MCMD<span className="text-white text-sm font-normal block opacity-70">One-to-One Manager</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Menu</div>
        
        <div onClick={() => onNavigate('dashboard')} className={navItemClass('dashboard')}>
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </div>

        {/* Unified Planning View */}
        <div onClick={() => onNavigate('planning')} className={navItemClass('planning')}>
          <div className="relative">
            <Calendar size={20} />
            {currentUser.role === UserRole.ISSUER && pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </div>
          <span>Planning & Demandes</span>
        </div>

        {/* NEW: Confirmation Section for Non-Admins */}
        {currentUser.role !== UserRole.ADMIN && (
          <div onClick={() => onNavigate('confirmations')} className={navItemClass('confirmations')}>
            <div className="relative">
              <BookCheck size={20} />
              {confirmedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {confirmedCount}
                </span>
              )}
            </div>
            <span>Mes RDV Validés</span>
          </div>
        )}

        {/* Legacy Wishlist - Keeping only for Admin reference if needed, but primary flow is now Planning */}
        {currentUser.role === UserRole.INVESTOR && (
          <div onClick={() => onNavigate('wishlist')} className={navItemClass('wishlist')}>
            <Briefcase size={20} />
            <span>Ma Wishlist (Old)</span>
          </div>
        )}

        {currentUser.role === UserRole.ADMIN && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 pt-4 border-t border-slate-800">Administration</div>
            <div onClick={() => onNavigate('admin')} className={navItemClass('admin')}>
              <Play size={20} />
              <span>Matching & Demandes</span>
            </div>
            <div onClick={() => onNavigate('rooms')} className={navItemClass('rooms')}>
              <MapPin size={20} />
              <span>Gestion des Salles</span>
            </div>
            <div onClick={() => onNavigate('users')} className={navItemClass('users')}>
              <UserPlus size={20} />
              <span>Participants</span>
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Changer de rôle (Demo)</div>
        <select 
          className="w-full bg-slate-800 border border-slate-700 rounded text-sm p-2 text-slate-300 focus:outline-none focus:border-blue-500"
          value={currentUser.id}
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            if (user) setCurrentUser(user);
          }}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.role === UserRole.ADMIN ? 'Admin' : u.role === UserRole.INVESTOR ? 'Inv' : 'Emet'} - {u.name}
            </option>
          ))}
        </select>
        <div className="flex items-center space-x-3 mt-4">
          <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser.company}</p>
          </div>
        </div>
      </div>
    </div>
  );
};