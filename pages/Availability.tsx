import React from 'react';
import { useData } from '../contexts/DataContext';
import { Check, X, Clock, Calendar as CalendarIcon } from 'lucide-react';

export const Availability: React.FC = () => {
  const { currentUser, slots, availability, toggleAvailability } = useData();
  
  const userBusySlots = availability[currentUser.id] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion de mon Planning</h2>
          <p className="text-slate-500 mt-1">
            Définissez vos créneaux d'ouverture pour les rendez-vous.
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border border-slate-200 text-sm">
           <div className="flex items-center">
             <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
             <span className="text-slate-600">Disponible</span>
           </div>
           <div className="flex items-center">
             <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
             <span className="text-slate-600">Indisponible</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center text-slate-700 font-semibold">
          <CalendarIcon size={18} className="mr-2" />
          <span>Agenda de l'événement</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {slots.map((slot) => {
            const isBusy = userBusySlots.includes(slot.id);
            const statusColor = isBusy ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700';
            const borderColor = isBusy ? 'border-red-200' : 'border-emerald-200';
            
            return (
              <div 
                key={slot.id} 
                className="group hover:bg-slate-50 transition-colors p-4 flex items-center justify-between"
              >
                {/* Time Section */}
                <div className="flex items-center w-1/3">
                  <div className="p-2 bg-slate-100 rounded-lg mr-4 text-slate-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{slot.startTime}</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{slot.label}</div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex-1 mx-6">
                   <div className={`h-2 rounded-full w-full ${isBusy ? 'bg-red-200' : 'bg-emerald-200'}`}>
                      <div className={`h-2 rounded-full ${isBusy ? 'bg-red-500' : 'bg-emerald-500'} w-full`}></div>
                   </div>
                   <div className="flex justify-between mt-1 text-xs">
                     <span className={`${isBusy ? 'text-red-500 font-bold' : 'text-slate-400'}`}>Occupé / Absent</span>
                     <span className={`${!isBusy ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>Disponible</span>
                   </div>
                </div>

                {/* Action Toggle */}
                <button
                  onClick={() => toggleAvailability(slot.id)}
                  className={`
                    relative w-32 px-4 py-2 rounded-lg border flex items-center justify-center space-x-2 transition-all active:scale-95
                    ${isBusy 
                      ? 'bg-white border-red-300 text-red-600 hover:bg-red-50' 
                      : 'bg-white border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                    }
                  `}
                >
                  {isBusy ? <X size={18} /> : <Check size={18} />}
                  <span className="font-semibold text-sm">
                    {isBusy ? 'Bloqué' : 'Ouvert'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};