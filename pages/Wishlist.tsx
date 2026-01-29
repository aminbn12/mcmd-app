import React from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole } from '../types';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { users, currentUser, preferences, addPreference, removePreference, reorderPreference } = useData();

  if (currentUser.role !== UserRole.INVESTOR) {
    return <div>Accès réservé aux investisseurs.</div>;
  }

  const issuers = users.filter(u => u.role === UserRole.ISSUER);
  const myPreferences = preferences
    .filter(p => p.investorId === currentUser.id)
    .sort((a, b) => a.priority - b.priority);

  const isSelected = (issuerId: string) => myPreferences.some(p => p.issuerId === issuerId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Left: Available Issuers */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Émetteurs Disponibles</h3>
          <p className="text-xs text-slate-500">Sélectionnez les entreprises que vous souhaitez rencontrer.</p>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {issuers.map(issuer => {
            const selected = isSelected(issuer.id);
            return (
              <div key={issuer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <img src={issuer.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-slate-900">{issuer.company}</div>
                    <div className="text-xs text-slate-500">{issuer.name}</div>
                  </div>
                </div>
                <button 
                  onClick={() => !selected && addPreference(issuer.id)}
                  disabled={selected}
                  className={`p-2 rounded-full ${selected ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                >
                  <Plus size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Ranked Wishlist */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Ma Sélection (Priorisée)</h3>
          <p className="text-xs text-slate-500">L'algorithme tentera de matcher les premiers choix en priorité.</p>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {myPreferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>Votre liste est vide.</p>
              <p className="text-sm">Ajoutez des émetteurs depuis la liste de gauche.</p>
            </div>
          ) : (
            myPreferences.map((pref, index) => {
              const issuer = users.find(u => u.id === pref.issuerId);
              if (!issuer) return null;
              return (
                <div key={pref.issuerId} className="flex items-center p-3 bg-white border border-blue-100 rounded-lg shadow-sm">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-sm mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{issuer.company}</div>
                    <div className="text-xs text-slate-500">{issuer.name}</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => reorderPreference(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button 
                      onClick={() => reorderPreference(index, index + 1)}
                      disabled={index === myPreferences.length - 1}
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-2"></div>
                    <button 
                      onClick={() => removePreference(issuer.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};