import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole } from '../types';
import { UserPlus, Trash2, Search, Briefcase, User as UserIcon } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, addUser, deleteUser } = useData();
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.INVESTOR);

  // Form State
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newCompany) {
      addUser(newName, newCompany, activeTab);
      setNewName('');
      setNewCompany('');
    }
  };

  const filteredUsers = users.filter(u => u.role === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Gestion des Participants</h2>
           <p className="text-slate-500">Ajoutez des Investisseurs et des Émetteurs à l'événement.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab(UserRole.INVESTOR)}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === UserRole.INVESTOR ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Investisseurs
        </button>
        <button 
           onClick={() => setActiveTab(UserRole.ISSUER)}
           className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === UserRole.ISSUER ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Émetteurs (Entreprises)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE FORM */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <UserPlus size={18} className="mr-2 text-indigo-600" />
            Ajouter un {activeTab === UserRole.INVESTOR ? 'Investisseur' : 'Émetteur'}
          </h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ex: Jean Dupont" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entreprise / Fonds</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ex: Tech Ventures" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!newName || !newCompany}
              className={`w-full py-2 font-bold text-white rounded-lg shadow-md transition-all ${activeTab === UserRole.INVESTOR ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-50`}
            >
              Créer le participant
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-semibold text-slate-800">
               Liste des {activeTab === UserRole.INVESTOR ? 'Investisseurs' : 'Émetteurs'} ({filteredUsers.length})
             </h3>
             <div className="text-xs text-slate-400">ID Unique généré auto.</div>
           </div>
           
           <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
             {filteredUsers.length === 0 ? (
               <div className="p-8 text-center text-slate-400 italic">Aucun participant trouvé.</div>
             ) : (
               filteredUsers.map(user => (
                 <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center space-x-4">
                       <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                       <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500 flex items-center">
                            <Briefcase size={12} className="mr-1" />
                            {user.company}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center">
                       <span className="text-xs font-mono text-slate-300 mr-4 bg-slate-100 px-2 py-1 rounded">{user.id}</span>
                       <button 
                         onClick={() => deleteUser(user.id)}
                         className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         title="Supprimer"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
};