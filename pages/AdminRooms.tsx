import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, Settings, MapPin } from 'lucide-react';

export const AdminRooms: React.FC = () => {
  const { rooms, addRoom, deleteRoom } = useData();
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(1);

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      addRoom(newRoomName, newRoomCapacity);
      setNewRoomName('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700">
           <MapPin size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Gestion des Salles</h2>
           <p className="text-slate-500">Ajoutez ou supprimez les salles disponibles pour les rendez-vous.</p>
        </div>
      </div>

      {/* Add Room Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
          <Plus size={18} className="mr-2 text-indigo-600" />
          Ajouter une nouvelle salle
        </h3>
        <form onSubmit={handleAddRoom} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la salle / Table</label>
            <input 
              type="text" 
              placeholder="ex: Table 4, Salle VIP, Lounge..." 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacité</label>
            <input 
              type="number" 
              min="1"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newRoomCapacity}
              onChange={(e) => setNewRoomCapacity(parseInt(e.target.value))}
            />
          </div>
          <button 
            type="submit" 
            disabled={!newRoomName}
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Rooms List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
          Salles existantes ({rooms.length})
        </div>
        <div className="p-6">
          {rooms.length === 0 ? (
            <div className="text-center text-slate-400 py-8 italic">
              Aucune salle configurée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all bg-white group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <Settings size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{room.name}</div>
                      <div className="text-xs text-slate-500">Capacité: {room.capacity} pers.</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteRoom(room.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Supprimer la salle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};